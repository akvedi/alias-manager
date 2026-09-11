import { createAuth, type Env } from './lib/auth'
import { createForwarder, deleteForwarder, listDomains } from './lib/mxroute'
import { getDashboard } from './routes/dashboard'
import {
  createDestination,
  deleteDestination,
  getDestinations,
  updateDestination,
} from './routes/destinations'

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

    if (url.pathname.startsWith('/api/aliases') || url.pathname.startsWith('/api/domains') || url.pathname.startsWith('/api/destinations') ||  url.pathname === '/api/dashboard') {
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
      request.method === 'GET' &&
      url.pathname === '/api/dashboard'
    ) {
      return getDashboard(
        env,
        session.user.id,
      )
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
      request.method === 'PUT' &&
      url.pathname.startsWith('/api/aliases/')
    ) {
      const aliasId = url.pathname.split('/')[3]

      if (!aliasId) {
        return Response.json(
          { error: 'Alias ID is required' },
          { status: 400 },
        )
      }

      return updateAlias(
        env,
        request,
        aliasId,
        session.user.id,
      )
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

    if (
      request.method === 'GET' &&
      url.pathname === '/api/destinations'
    ) {
      return getDestinations(
        env,
        session.user.id,
      )
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/api/destinations'
    ) {
      return createDestination(
        env,
        request,
        session.user.id,
      )
    }

    if (
      request.method === 'PUT' &&
      url.pathname.startsWith('/api/destinations/')
    ) {
      const destinationId = url.pathname.split('/')[3]

      if (!destinationId) {
        return Response.json(
          { error: 'Destination ID is required' },
          { status: 400 },
        )
      }

      return updateDestination(
        env,
        request,
        destinationId,
        session.user.id,
      )
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/destinations/')
    ) {
      const destinationId = url.pathname.split('/')[3]

      if (!destinationId) {
        return Response.json(
          { error: 'Destination ID is required' },
          { status: 400 },
        )
      }

      return deleteDestination(
        env,
        destinationId,
        session.user.id,
      )
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404 },
    )
  },
}

function isValidEmailAddress(value: string): boolean {
  const email = value.trim()

  if (email.length > 254) {
    return false
  }

  const atIndex = email.lastIndexOf('@')

  if (atIndex <= 0 || atIndex === email.length - 1) {
    return false
  }

  const localPart = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)

  if (
    localPart.length > 64 ||
    domain.length > 253
  ) {
    return false
  }

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return false
  }

  if (
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..')
  ) {
    return false
  }

  if (!domain.includes('.')) {
    return false
  }

  return /^[^\s@]+@[^\s@]+$/.test(email)
}

function isValidLocalPart(value: string): boolean {
  const localPart = value.trim()

  if (!localPart || localPart.length > 64) {
    return false
  }

  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return false
  }

  return !/[\s@]/.test(localPart)
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
        aliases.destination_type,
        aliases.note,
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
    destinationType: alias.destination_type,
    note: alias.note,
    enabled: alias.status === 'active',
    createdAt: alias.created_at,
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
    destinationType?: 'forward' | 'fail' | 'blackhole'
    destination?: string
    note?: string
  }>()

  if (!body.address || !body.destinationType) {
    return Response.json(
      {
        error: 'Address and destination type are required',
      },
      { status: 400 },
    )
  }

  if (
    body.destinationType !== 'forward' &&
    body.destinationType !== 'fail' &&
    body.destinationType !== 'blackhole'
  ) {
    return Response.json(
      { error: 'Invalid destination type' },
      { status: 400 },
    )
  }

  if (
    body.destinationType === 'forward' &&
    !body.destination?.trim()
  ) {
    return Response.json(
      {
        error:
          'Destination email is required for forwarding aliases',
      },
      { status: 400 },
    )
  }

  if (
    body.destinationType === 'forward' &&
    !isValidEmailAddress(body.destination!)
  ) {
    return Response.json(
      { error: 'Invalid destination email address' },
      { status: 400 },
    )
  }

  if (body.note && body.note.trim().length > 500) {
    return Response.json(
      { error: 'Note must be 500 characters or less' },
      { status: 400 },
    )
  }

  const atIndex = body.address.lastIndexOf('@')

  if (
    atIndex <= 0 ||
    atIndex === body.address.length - 1
  ) {
    return Response.json(
      { error: 'Invalid alias address' },
      { status: 400 },
    )
  }

  const localPart = body.address
    .slice(0, atIndex)
    .trim()

  const domain = body.address
    .slice(atIndex + 1)
    .trim()
    .toLowerCase()

  if (!isValidLocalPart(localPart)) {
    return Response.json(
      { error: 'Invalid alias name' },
      { status: 400 },
    )
  }

  if (!localPart || !domain) {
    return Response.json(
      { error: 'Invalid alias address' },
      { status: 400 },
    )
  }

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
      { error: 'Domain not found' },
      { status: 404 },
    )
  }

  const aliasId = crypto.randomUUID()

  const mxrouteCreated = await createForwarder(
    env,
    {
      domain,
      alias: localPart,
      destinationType: body.destinationType,
      destination: body.destination?.trim(),
    },
  )

  if (!mxrouteCreated) {
    return Response.json(
      { error: 'Failed to create alias in MXroute' },
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
          destination_type,
          note,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'active', unixepoch())
      `)
      .bind(
        aliasId,
        domainResult.id,
        localPart,
        body.destinationType === 'forward'
          ? body.destination?.trim() ?? null
          : null,
        body.destinationType,
        body.note?.trim() || null,
      )
      .run()
  } catch (error) {
    console.error(
      'Failed to save alias to D1 after creating it in MXroute',
      {
        aliasId,
        domain,
        localPart,
        error,
      },
    )

    // D1 failed after MXroute succeeded.
    // Remove the MXroute forwarder so we don't leave
    // an alias that Alias Manager doesn't know about.
    const rollbackSucceeded = await deleteForwarder(
      env,
      {
        domain,
        alias: localPart,
      },
    )

    if (!rollbackSucceeded) {
      console.error(
        'CRITICAL: Failed to roll back MXroute alias after D1 failure',
        {
          aliasId,
          domain,
          localPart,
        },
      )

      return Response.json(
        {
          error:
            'Alias could not be saved and MXroute cleanup also failed. Please check MXroute.',
        },
        { status: 500 },
      )
    }

    return Response.json(
      {
        error:
          'Alias already exists or could not be created',
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

  if (
    domain.length > 253 ||
    domain.includes(' ') ||
    domain.includes('@') ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..')
  ) {
    return Response.json(
      { error: 'Invalid domain' },
      { status: 400 },
    )
  }

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

  // Remove the alias from D1.
  try {
    const result = await env.DB
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

    // D1 should report one deleted row.
    if (result.meta.changes !== 1) {
      console.error(
        'CRITICAL: MXroute alias deleted but D1 alias was not deleted',
        {
          aliasId,
          domain: alias.domain,
          localPart: alias.local_part,
          changes: result.meta.changes,
        },
      )

      return Response.json(
        {
          error:
            'Alias was removed from MXroute but could not be removed from Alias Manager. Please contact support.',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(
      'CRITICAL: MXroute alias deleted but D1 deletion failed',
      {
        aliasId,
        domain: alias.domain,
        localPart: alias.local_part,
        error,
      },
    )

    return Response.json(
      {
        error:
          'Alias was removed from MXroute but could not be removed from Alias Manager. Please contact support.',
      },
      { status: 500 },
    )
  }

  return Response.json({
    success: true,
  })
}

async function updateAlias(
  env: Env,
  request: Request,
  aliasId: string,
  userId: string,
  ): Promise<Response> {
  const body = await request.json<{
    destinationType?: 'forward' | 'fail' | 'blackhole'
    destination?: string
    note?: string
  }>()

  if (!body.destinationType) {
    return Response.json(
      { error: 'Destination type is required' },
      { status: 400 },
    )
  }

  if (
    body.destinationType !== 'forward' &&
    body.destinationType !== 'fail' &&
    body.destinationType !== 'blackhole'
  ) {
    return Response.json(
      { error: 'Invalid destination type' },
      { status: 400 },
    )
  }

  if (
    body.destinationType === 'forward' &&
    !body.destination?.trim()
  ) {
    return Response.json(
      {
        error:
          'Destination email is required for forwarding aliases',
      },
      { status: 400 },
    )
  }

  if (
    body.destinationType === 'forward' &&
    !isValidEmailAddress(body.destination!)
  ) {
    return Response.json(
      { error: 'Invalid destination email address' },
      { status: 400 },
    )
  }

  if (body.note && body.note.trim().length > 500) {
    return Response.json(
      { error: 'Note must be 500 characters or less' },
      { status: 400 },
    )
  }

  const alias = await env.DB
    .prepare(`
      SELECT
        aliases.id,
        aliases.local_part,
        aliases.destination,
        aliases.destination_type,
        aliases.note,
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
      id: string
      local_part: string
      destination: string | null
      destination_type: 'forward' | 'fail' | 'blackhole'
      note: string | null
      status: 'active' | 'disabled'
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  const newDestination =
    body.destinationType === 'forward'
      ? body.destination!.trim()
      : null

  const newNote = body.note?.trim() || null



  // If the alias is disabled, MXroute has no active forwarder.
  // We only need to update D1.
  if (alias.status === 'disabled') {
    await env.DB
      .prepare(`
        UPDATE aliases
        SET
          destination = ?,
          destination_type = ?,
          note = ?
        WHERE id = ?
      `)
      .bind(
        newDestination,
        body.destinationType,
        newNote,
        aliasId,
      )
      .run()

    return Response.json({ success: true })
  }

  // Active alias:
  // Delete the old MXroute configuration first.
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
        error:
          'Failed to remove the existing alias from MXroute',
      },
      { status: 502 },
    )
  }

  // Create the new MXroute configuration.
  const mxrouteCreated = await createForwarder(
    env,
    {
      domain: alias.domain,
      alias: alias.local_part,
      destinationType: body.destinationType,
      destination: newDestination ?? undefined,
    },
  )

  if (!mxrouteCreated) {
    // Try to restore the previous configuration.
    const restored = await createForwarder(
      env,
      {
        domain: alias.domain,
        alias: alias.local_part,
        destinationType: alias.destination_type,
        destination: alias.destination ?? undefined,
      },
    )

    if (!restored) {
      console.error(
        'CRITICAL: Failed to restore alias after update failure',
        {
          aliasId,
          domain: alias.domain,
          localPart: alias.local_part,
        },
      )
    }

    return Response.json(
      {
        error:
          'Failed to apply the new alias configuration',
      },
      { status: 502 },
    )
  }

  // MXroute is now correct, so update D1.
  await env.DB
    .prepare(`
      UPDATE aliases
      SET
        destination = ?,
        destination_type = ?,
        note = ?
      WHERE id = ?
    `)
    .bind(
      newDestination,
      body.destinationType,
      newNote,
      aliasId,
    )
    .run()

  return Response.json({ success: true })
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
