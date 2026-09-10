import { createAuth, type Env } from './lib/auth'
import { createForwarder, deleteForwarder, listDomains } from './lib/mxroute'

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const url = new URL(request.url)

    const auth = createAuth(env)

    if (url.pathname.startsWith('/api/auth/')) {
      return auth.handler(request)
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (url.pathname.startsWith('/api/aliases') || url.pathname.startsWith('/api/domains')) {
      if (!session) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 401 },
        )
      }
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/api/domains'
    ) {
      return createDomain(
        env,
        request,
        session.user.id,
      )
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/domains/')
    ) {
      const domainId = url.pathname.split('/')[3]

      if (!domainId) {
        return Response.json(
          { error: 'Domain ID is required' },
          { status: 400 },
        )
      }

      return deleteDomain(
        env,
        domainId,
        session.user.id,
      )
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/api/aliases'
    ) {
      return createAlias(
        env,
        request,
        session.user.id,
      )
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/aliases'
    ) {
      return getAliases(env, session.user.id)
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/domains'
    ) {
      return getDomains(env, session.user.id)
    }

    if (
      request.method === 'POST' &&
      url.pathname.startsWith('/api/aliases/') &&
      url.pathname.endsWith('/disable')
    ) {
      const aliasId = url.pathname.split('/')[3]

      if (!aliasId) {
        return Response.json(
          { error: 'Alias ID is required' },
          { status: 400 },
        )
      }

      return disableAlias(env, aliasId, session.user.id)
    }

    if (
      request.method === 'POST' &&
      url.pathname.startsWith('/api/aliases/') &&
      url.pathname.endsWith('/enable')
      ) {
      const aliasId = url.pathname.split('/')[3]

      if (!aliasId) {
        return Response.json(
          { error: 'Alias ID is required' },
          { status: 400 },
        )
      }

      return enableAlias(env, aliasId, session.user.id)
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/aliases/')
    ) {
      const aliasId = url.pathname.split('/')[3]

      if (!aliasId) {
        return Response.json(
          { error: 'Alias ID is required' },
          { status: 400 },
        )
      }

      return deleteAlias(
        env,
        aliasId,
        session.user.id,
      )
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404 },
    )
  },
}

async function getAliases(
  env: Env,
  userId: string,
): Promise<Response> {
  const result = await env.DB
    .prepare(`
      SELECT
        aliases.id,
        aliases.local_part,
        domains.domain,
        aliases.destination,
        aliases.status,
        aliases.created_at,
        aliases.disabled_at
      FROM aliases
      JOIN domains ON aliases.domain_id = domains.id
      WHERE domains.user_id = ?
      ORDER BY aliases.created_at DESC
    `)
    .bind(userId)
    .all()

  const aliases = result.results.map((alias) => ({
    id: alias.id,
    address: `${alias.local_part}@${alias.domain}`,
    destination: alias.destination,
    enabled: alias.status === 'active',
    createdAt: alias.created_at,
    disabledAt: alias.disabled_at,
  }))

  return Response.json(aliases)
}

async function disableAlias(
  env: Env,
  aliasId: string,
  userId: string,
): Promise<Response> {
  const alias = await env.DB
    .prepare(`
      SELECT
        aliases.local_part,
        domains.domain
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE aliases.id = ?
        AND domains.user_id = ?
        AND aliases.status = 'active'
    `)
    .bind(aliasId, userId)
    .first<{
      local_part: string
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  const mxrouteDeleted = await deleteForwarder(
    env,
    {
      domain: alias.domain,
      alias: alias.local_part,
    },
  )

  if (!mxrouteDeleted) {
    return Response.json(
      {
        error: 'Failed to disable alias in MXroute',
      },
      { status: 502 },
    )
  }

  await env.DB
    .prepare(`
      UPDATE aliases
      SET
        status = 'disabled',
        disabled_at = unixepoch()
      WHERE id = ?
        AND domain_id IN (
          SELECT id
          FROM domains
          WHERE user_id = ?
        )
    `)
    .bind(aliasId, userId)
    .run()

  return Response.json({
    success: true,
  })
}

async function enableAlias(
  env: Env,
  aliasId: string,
  userId: string,
): Promise<Response> {
  const alias = await env.DB
    .prepare(`
      SELECT
        aliases.local_part,
        aliases.destination,
        domains.domain
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE aliases.id = ?
        AND domains.user_id = ?
        AND aliases.status = 'disabled'
    `)
    .bind(aliasId, userId)
    .first<{
      local_part: string
      destination: string
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  const mxrouteCreated = await createForwarder(
    env,
    {
      domain: alias.domain,
      alias: alias.local_part,
      destinations: [alias.destination],
    },
  )

  if (!mxrouteCreated) {
    return Response.json(
      {
        error: 'Failed to enable alias in MXroute',
      },
      { status: 502 },
    )
  }

  await env.DB
    .prepare(`
      UPDATE aliases
      SET
        status = 'active',
        disabled_at = NULL
      WHERE id = ?
        AND domain_id IN (
          SELECT id
          FROM domains
          WHERE user_id = ?
        )
    `)
    .bind(aliasId, userId)
    .run()

  return Response.json({
    success: true,
  })
}

async function createAlias(
  env: Env,
  request: Request,
  userId: string,
): Promise<Response> {
  const body = await request.json<{
    address?: string
    destination?: string
  }>()

  if (!body.address || !body.destination) {
    return Response.json(
      {
        error: 'Address and destination are required',
      },
      { status: 400 },
    )
  }

  const atIndex = body.address.lastIndexOf('@')

  if (atIndex <= 0 || atIndex === body.address.length - 1) {
    return Response.json(
      {
        error: 'Invalid alias address',
      },
      { status: 400 },
    )
  }

  const localPart = body.address.slice(0, atIndex)
  const domain = body.address.slice(atIndex + 1)

  const domainResult = await env.DB
    .prepare(`
      SELECT id
      FROM domains
      WHERE user_id = ?
        AND domain = ?
    `)
    .bind(userId, domain)
    .first<{ id: string }>()

  if (!domainResult) {
    return Response.json(
      {
        error: 'Domain not found',
      },
      { status: 404 },
    )
  }

  const aliasId = crypto.randomUUID()

  const mxrouteCreated = await createForwarder(
    env,
    {
      domain,
      alias: localPart,
      destinations: [body.destination],
    },
  )

  if (!mxrouteCreated) {
    return Response.json(
      {
        error: 'Failed to create alias in MXroute',
      },
      { status: 502 },
    )
  }

  try {
    await env.DB
      .prepare(`
        INSERT INTO aliases (
          id,
          domain_id,
          local_part,
          destination,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, 'active', unixepoch())
      `)
      .bind(
        aliasId,
        domainResult.id,
        localPart,
        body.destination,
      )
      .run()
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Alias already exists or could not be created',
      },
      { status: 409 },
    )
  }

  return Response.json(
    {
      success: true,
      id: aliasId,
    },
    { status: 201 },
  )
}


async function createDomain(
  env: Env,
  request: Request,
  userId: string,
): Promise<Response> {
  const body = await request.json<{
    domain?: string
  }>()

  if (!body.domain) {
    return Response.json(
      { error: 'Domain is required' },
      { status: 400 },
    )
  }

  const domain = body.domain
    .trim()
    .toLowerCase()

  if (!domain) {
    return Response.json(
      { error: 'Domain is required' },
      { status: 400 },
    )
  }

  const mxrouteDomains = await listDomains(env)

  if (!mxrouteDomains) {
    return Response.json(
      {
        error: 'Could not verify the domain with MXroute',
      },
      { status: 502 },
    )
  }

  const domainExists = mxrouteDomains.some(
    (mxrouteDomain) =>
      mxrouteDomain.toLowerCase() === domain,
  )

  if (!domainExists) {
    return Response.json(
      {
        error: 'Domain was not found in your MXroute account',
      },
      { status: 400 },
    )
  }

  const domainId = crypto.randomUUID()

  try {
    await env.DB
      .prepare(`
        INSERT INTO domains (
          id,
          user_id,
          domain,
          created_at
        )
        VALUES (?, ?, ?, unixepoch())
      `)
      .bind(
        domainId,
        userId,
        domain,
      )
      .run()
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Domain already exists or could not be created',
      },
      { status: 409 },
    )
  }

  return Response.json(
    {
      success: true,
      id: domainId,
    },
    { status: 201 },
  )
}


async function getDomains(
  env: Env,
  userId: string,
): Promise<Response> {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        domain,
        created_at
      FROM domains
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    .bind(userId)
    .all()

  return Response.json(
    result.results.map((domain) => ({
      id: domain.id,
      domain: domain.domain,
      createdAt: domain.created_at,
    })),
  )
}


async function deleteAlias(
  env: Env,
  aliasId: string,
  userId: string,
): Promise<Response> {
  const alias = await env.DB
    .prepare(`
      SELECT
        aliases.local_part,
        aliases.status,
        domains.domain
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE aliases.id = ?
        AND domains.user_id = ?
    `)
    .bind(aliasId, userId)
    .first<{
      local_part: string
      status: string
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  // If the alias is active, remove it from MXroute first.
  if (alias.status === 'active') {
    const mxrouteDeleted = await deleteForwarder(
      env,
      {
        domain: alias.domain,
        alias: alias.local_part,
      },
    )

    if (!mxrouteDeleted) {
      return Response.json(
        {
          error: 'Failed to delete alias from MXroute',
        },
        { status: 502 },
      )
    }
  }

  // Remove the alias from our database.
  await env.DB
    .prepare(`
      DELETE FROM aliases
      WHERE id = ?
        AND domain_id IN (
          SELECT id
          FROM domains
          WHERE user_id = ?
        )
    `)
    .bind(aliasId, userId)
    .run()

  return Response.json({
    success: true,
  })
}

async function deleteDomain(
  env: Env,
  domainId: string,
  userId: string,
): Promise<Response> {
  const domain = await env.DB
    .prepare(`
      SELECT
        id,
        domain
      FROM domains
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(domainId, userId)
    .first<{
      id: string
      domain: string
    }>()

  if (!domain) {
    return Response.json(
      { error: 'Domain not found' },
      { status: 404 },
    )
  }

  const aliasCount = await env.DB
    .prepare(`
      SELECT COUNT(*) AS count
      FROM aliases
      WHERE domain_id = ?
    `)
    .bind(domainId)
    .first<{
      count: number
    }>()

  if (aliasCount && aliasCount.count > 0) {
    return Response.json(
      {
        error: `Cannot delete domain while it has ${aliasCount.count} alias${aliasCount.count === 1 ? '' : 'es'}`,
      },
      { status: 409 },
    )
  }

  await env.DB
    .prepare(`
      DELETE FROM domains
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(domainId, userId)
    .run()

  return Response.json({
    success: true,
  })
}
