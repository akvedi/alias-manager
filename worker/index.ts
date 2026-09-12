import { createAuth, type Env } from './lib/auth'
import {
  createDisabledForwarder,
  createForwarder,
  deleteForwarder,
  listDomains,
} from './lib/mxroute'
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

    if (
      url.pathname.startsWith('/api/aliases') ||
      url.pathname.startsWith('/api/domains') ||
      url.pathname.startsWith('/api/destinations') ||
      url.pathname === '/api/dashboard'
    ) {
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
      return getAliases(
        env,
        session.user.id,
      )
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/domains'
    ) {
      return getDomains(
        env,
        session.user.id,
      )
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

      return disableAlias(
        env,
        aliasId,
        session.user.id,
      )
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

      return enableAlias(
        env,
        aliasId,
        session.user.id,
      )
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

function isValidEmailAddress(
  value: string,
): boolean {
  const email = value.trim()

  if (email.length > 254) {
    return false
  }

  const atIndex = email.lastIndexOf('@')

  if (
    atIndex <= 0 ||
    atIndex === email.length - 1
  ) {
    return false
  }

  const localPart = email.slice(
    0,
    atIndex,
  )

  const domain = email.slice(
    atIndex + 1,
  )

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

function isValidLocalPart(
  value: string,
): boolean {
  const localPart = value.trim()

  if (
    !localPart ||
    localPart.length > 64
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
        aliases.disabled_behavior,
        aliases.note,
        aliases.status,
        aliases.created_at,
        aliases.disabled_at
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE domains.user_id = ?
      ORDER BY aliases.created_at DESC
    `)
    .bind(userId)
    .all()

  const aliases = result.results.map(
    (alias) => ({
      id: alias.id,
      address: `${alias.local_part}@${alias.domain}`,
      destination: alias.destination,
      disabledBehavior:
        alias.disabled_behavior,
      note: alias.note,
      enabled:
        alias.status === 'active',
      createdAt:
        alias.created_at,
    }),
  )

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
        aliases.destination,
        aliases.disabled_behavior,
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
      destination: string | null
      disabled_behavior:
        | 'blackhole'
        | 'reject'
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  if (!alias.destination) {
    return Response.json(
      {
        error:
          'Alias has no destination email and cannot be disabled safely.',
      },
      { status: 409 },
    )
  }

  /*
   * Remove the current forwarding
   * configuration.
   */
  const mxrouteDeleted =
    await deleteForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
    })

  if (!mxrouteDeleted) {
    return Response.json(
      {
        error:
          'Failed to disable alias in MXroute',
      },
      { status: 502 },
    )
  }

  /*
   * Replace forwarding with the configured
   * disabled behavior.
   */
  const disabledCreated =
    await createDisabledForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
      behavior:
        alias.disabled_behavior,
    })

  if (!disabledCreated) {
    /*
     * Try to restore the original
     * forwarding configuration.
     */
    const restored =
      await createForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
        destination:
          alias.destination,
      })

    if (!restored) {
      console.error(
        'CRITICAL: Failed to disable alias and failed to restore original MXroute configuration',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
        },
      )
    }

    return Response.json(
      {
        error:
          'Failed to disable alias in MXroute',
      },
      { status: 502 },
    )
  }

  try {
    const result = await env.DB
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

    if (result.meta.changes !== 1) {
      throw new Error(
        `Expected 1 D1 update, got ${result.meta.changes}`,
      )
    }
  } catch (error) {
    console.error(
      'CRITICAL: Alias was changed to disabled behavior in MXroute but D1 update failed',
      {
        aliasId,
        domain: alias.domain,
        localPart:
          alias.local_part,
        error,
      },
    )

    /*
     * Restore the original forwarding
     * configuration.
     */
    const deletedDisabledConfig =
      await deleteForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
      })

    if (deletedDisabledConfig) {
      const restored =
        await createForwarder(env, {
          domain: alias.domain,
          alias: alias.local_part,
          destination:
            alias.destination,
        })

      if (!restored) {
        console.error(
          'CRITICAL: Failed to restore original forwarding configuration after D1 failure',
          {
            aliasId,
            domain: alias.domain,
            localPart:
              alias.local_part,
          },
        )
      }
    } else {
      console.error(
        'CRITICAL: Failed to remove disabled MXroute configuration after D1 failure',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
        },
      )
    }

    return Response.json(
      {
        error:
          'Alias could not be disabled completely. Please contact support.',
      },
      { status: 500 },
    )
  }

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
        aliases.disabled_behavior,
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
      destination: string | null
      disabled_behavior:
        | 'blackhole'
        | 'reject'
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  /*
   * A disabled alias must have a real
   * destination before it can be enabled.
   */
  if (!alias.destination) {
    return Response.json(
      {
        error:
          'Alias needs a destination email before it can be enabled.',
      },
      { status: 409 },
    )
  }

  /*
   * Remove the disabled MXroute
   * configuration.
   */
  const mxrouteDeleted =
    await deleteForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
    })

  if (!mxrouteDeleted) {
    return Response.json(
      {
        error:
          'Failed to enable alias in MXroute',
      },
      { status: 502 },
    )
  }

  /*
   * Restore the saved forwarding
   * destination.
   */
  const restored =
    await createForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
      destination:
        alias.destination,
    })

  if (!restored) {
    /*
     * Try to restore the disabled
     * behavior.
     */
    const disabledRestored =
      await createDisabledForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
        behavior:
          alias.disabled_behavior,
      })

    if (!disabledRestored) {
      console.error(
        'CRITICAL: Failed to enable alias and failed to restore disabled MXroute configuration',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
        },
      )
    }

    return Response.json(
      {
        error:
          'Failed to enable alias in MXroute',
      },
      { status: 502 },
    )
  }

  try {
    const result = await env.DB
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

    if (result.meta.changes !== 1) {
      throw new Error(
        `Expected 1 D1 update, got ${result.meta.changes}`,
      )
    }
  } catch (error) {
    console.error(
      'CRITICAL: Alias was restored in MXroute but D1 update failed',
      {
        aliasId,
        domain: alias.domain,
        localPart:
          alias.local_part,
        error,
      },
    )

    /*
     * Remove the restored forwarding
     * configuration.
     */
    const deletedRestoredConfig =
      await deleteForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
      })

    if (deletedRestoredConfig) {
      /*
       * D1 still says the alias is disabled,
       * so restore its disabled behavior.
       */
      const disabledRestored =
        await createDisabledForwarder(env, {
          domain: alias.domain,
          alias: alias.local_part,
          behavior:
            alias.disabled_behavior,
        })

      if (!disabledRestored) {
        console.error(
          'CRITICAL: Failed to restore disabled MXroute configuration after D1 failure',
          {
            aliasId,
            domain: alias.domain,
            localPart:
              alias.local_part,
          },
        )
      }
    } else {
      console.error(
        'CRITICAL: Failed to remove restored MXroute forwarding configuration after D1 failure',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
        },
      )
    }

    return Response.json(
      {
        error:
          'Alias could not be enabled completely. Please contact support.',
      },
      { status: 500 },
    )
  }

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
    rejectWhenDisabled?: boolean
    note?: string
  }>()

  const address =
    body.address?.trim()

  const destination =
    body.destination
      ?.trim()
      .toLowerCase()

  if (!address) {
    return Response.json(
      {
        error:
          'Alias address is required',
      },
      { status: 400 },
    )
  }

  if (!destination) {
    return Response.json(
      {
        error:
          'Destination is required',
      },
      { status: 400 },
    )
  }

  if (!isValidEmailAddress(destination)) {
    return Response.json(
      {
        error:
          'Invalid destination email address',
      },
      { status: 400 },
    )
  }

  if (
    body.note &&
    body.note.trim().length > 500
  ) {
    return Response.json(
      {
        error:
          'Note must be 500 characters or less',
      },
      { status: 400 },
    )
  }

  const atIndex =
    address.lastIndexOf('@')

  if (
    atIndex <= 0 ||
    atIndex === address.length - 1
  ) {
    return Response.json(
      {
        error:
          'Invalid alias address',
      },
      { status: 400 },
    )
  }

  const localPart =
    address
      .slice(0, atIndex)
      .trim()

  const domain =
    address
      .slice(atIndex + 1)
      .trim()
      .toLowerCase()

  if (!isValidLocalPart(localPart)) {
    return Response.json(
      {
        error:
          'Invalid alias address',
      },
      { status: 400 },
    )
  }

  if (!domain) {
    return Response.json(
      {
        error:
          'Invalid alias domain',
      },
      { status: 400 },
    )
  }

  const domainRecord =
    await env.DB
      .prepare(`
        SELECT id, domain
        FROM domains
        WHERE user_id = ?
          AND domain = ?
      `)
      .bind(
        userId,
        domain,
      )
      .first<{
        id: string
        domain: string
      }>()

  if (!domainRecord) {
    return Response.json(
      {
        error:
          'Domain is not registered in Alias Manager',
      },
      { status: 400 },
    )
  }

  const disabledBehavior =
    body.rejectWhenDisabled
      ? 'reject'
      : 'blackhole'

  /*
   * New aliases are always created
   * as active forwarding aliases.
   */
  const mxrouteCreated =
    await createForwarder(env, {
      domain,
      alias: localPart,
      destination,
    })

  if (!mxrouteCreated) {
    return Response.json(
      {
        error:
          'Failed to create alias in MXroute',
      },
      { status: 502 },
    )
  }

  const id =
    crypto.randomUUID()

  try {
    await env.DB
      .prepare(`
        INSERT INTO aliases (
          id,
          domain_id,
          local_part,
          destination,
          disabled_behavior,
          note,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'active', unixepoch())
      `)
      .bind(
        id,
        domainRecord.id,
        localPart,
        destination,
        disabledBehavior,
        body.note?.trim() || null,
      )
      .run()
  } catch (error) {
    console.error(
      'Failed to save alias in D1 after MXroute creation',
      {
        id,
        domain: domain,
        localPart,
        error,
      },
    )

    const rollbackSucceeded =
      await deleteForwarder(env, {
        domain,
        alias: localPart,
      })

    if (!rollbackSucceeded) {
      console.error(
        'CRITICAL: MXroute alias was created but rollback failed',
        {
          id,
          domain,
          localPart,
        },
      )

      return Response.json(
        {
          error:
            'Alias was created in MXroute but could not be saved in Alias Manager. Please contact support.',
        },
        { status: 500 },
      )
    }

    return Response.json(
      {
        error:
          'An alias with this address already exists',
      },
      { status: 409 },
    )
  }

  return Response.json(
    {
      success: true,
      id,
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
      {
        error: 'Domain is required',
      },
      { status: 400 },
    )
  }

  const domain =
    body.domain
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
      {
        error: 'Invalid domain',
      },
      { status: 400 },
    )
  }

  if (!domain) {
    return Response.json(
      {
        error: 'Domain is required',
      },
      { status: 400 },
    )
  }

  const mxrouteDomains =
    await listDomains(env)

  if (!mxrouteDomains) {
    return Response.json(
      {
        error:
          'Could not verify the domain with MXroute',
      },
      { status: 502 },
    )
  }

  const domainExists =
    mxrouteDomains.some(
      (mxrouteDomain) =>
        mxrouteDomain.toLowerCase() ===
        domain,
    )

  if (!domainExists) {
    return Response.json(
      {
        error:
          'Domain was not found in your MXroute account',
      },
      { status: 400 },
    )
  }

  const domainId =
    crypto.randomUUID()

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
        error:
          'Domain already exists or could not be created',
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
    result.results.map(
      (domain) => ({
        id: domain.id,
        domain: domain.domain,
        createdAt:
          domain.created_at,
      }),
    ),
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
        domains.domain
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE aliases.id = ?
        AND domains.user_id = ?
    `)
    .bind(
      aliasId,
      userId,
    )
    .first<{
      local_part: string
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      {
        error: 'Alias not found',
      },
      { status: 404 },
    )
  }

  /*
   * Always remove the MXroute forwarder,
   * including disabled aliases.
   */
  const mxrouteDeleted =
    await deleteForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
    })

  if (!mxrouteDeleted) {
    return Response.json(
      {
        error:
          'Failed to delete alias from MXroute',
      },
      { status: 502 },
    )
  }

  /*
   * Remove the alias from D1.
   */
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
      .bind(
        aliasId,
        userId,
      )
      .run()

    if (result.meta.changes !== 1) {
      console.error(
        'CRITICAL: MXroute alias deleted but D1 alias was not deleted',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
          changes:
            result.meta.changes,
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
        localPart:
          alias.local_part,
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
    destination?: string
    rejectWhenDisabled?: boolean
    note?: string
  }>()

  const destination =
    body.destination
      ?.trim()
      .toLowerCase()

  if (!destination) {
    return Response.json(
      {
        error:
          'Destination email is required',
      },
      { status: 400 },
    )
  }

  if (!isValidEmailAddress(destination)) {
    return Response.json(
      {
        error:
          'Invalid destination email address',
      },
      { status: 400 },
    )
  }

  if (
    body.note &&
    body.note.trim().length > 500
  ) {
    return Response.json(
      {
        error:
          'Note must be 500 characters or less',
      },
      { status: 400 },
    )
  }

  const newDisabledBehavior =
    body.rejectWhenDisabled
      ? 'reject'
      : 'blackhole'

  const alias = await env.DB
    .prepare(`
      SELECT
        aliases.id,
        aliases.local_part,
        aliases.destination,
        aliases.disabled_behavior,
        aliases.note,
        aliases.status,
        domains.domain
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE aliases.id = ?
        AND domains.user_id = ?
    `)
    .bind(
      aliasId,
      userId,
    )
    .first<{
      id: string
      local_part: string
      destination: string | null
      disabled_behavior:
        | 'blackhole'
        | 'reject'
      note: string | null
      status:
        | 'active'
        | 'disabled'
      domain: string
    }>()

  if (!alias) {
    return Response.json(
      {
        error: 'Alias not found',
      },
      { status: 404 },
    )
  }

  const newNote =
    body.note?.trim() || null

  /*
   * DISABLED ALIAS
   *
   * Destination changes are stored in D1.
   * MXroute only needs changing if the
   * disabled behavior changes.
   */
  if (alias.status === 'disabled') {
    const disabledBehaviorChanged =
      alias.disabled_behavior !==
      newDisabledBehavior

    if (!disabledBehaviorChanged) {
      try {
        const result = await env.DB
          .prepare(`
            UPDATE aliases
            SET
              destination = ?,
              disabled_behavior = ?,
              note = ?
            WHERE id = ?
              AND domain_id IN (
                SELECT id
                FROM domains
                WHERE user_id = ?
              )
          `)
          .bind(
            destination,
            newDisabledBehavior,
            newNote,
            aliasId,
            userId,
          )
          .run()

        if (result.meta.changes !== 1) {
          throw new Error(
            `Expected 1 D1 update, got ${result.meta.changes}`,
          )
        }
      } catch (error) {
        console.error(
          'Failed to update disabled alias in D1',
          {
            aliasId,
            error,
          },
        )

        return Response.json(
          {
            error:
              'Could not update the alias. Please try again.',
          },
          { status: 500 },
        )
      }

      return Response.json({
        success: true,
      })
    }

    /*
     * Disabled behavior changed.
     *
     * Replace the MXroute disabled
     * configuration.
     */
    const mxrouteDeleted =
      await deleteForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
      })

    if (!mxrouteDeleted) {
      return Response.json(
        {
          error:
            'Failed to update the disabled alias in MXroute',
        },
        { status: 502 },
      )
    }

    const mxrouteCreated =
      await createDisabledForwarder(
        env,
        {
          domain: alias.domain,
          alias: alias.local_part,
          behavior:
            newDisabledBehavior,
        },
      )

    if (!mxrouteCreated) {
      /*
       * Restore the previous disabled
       * configuration.
       */
      const restored =
        await createDisabledForwarder(
          env,
          {
            domain: alias.domain,
            alias: alias.local_part,
            behavior:
              alias.disabled_behavior,
          },
        )

      if (!restored) {
        console.error(
          'CRITICAL: Failed to update disabled alias and failed to restore previous MXroute configuration',
          {
            aliasId,
            domain: alias.domain,
            localPart:
              alias.local_part,
          },
        )
      }

      return Response.json(
        {
          error:
            'Failed to apply the new disabled behavior',
        },
        { status: 502 },
      )
    }

    /*
     * MXroute is correct.
     * Update D1.
     */
    try {
      const result = await env.DB
        .prepare(`
          UPDATE aliases
          SET
            destination = ?,
            disabled_behavior = ?,
            note = ?
          WHERE id = ?
            AND domain_id IN (
              SELECT id
              FROM domains
              WHERE user_id = ?
            )
        `)
        .bind(
          destination,
          newDisabledBehavior,
          newNote,
          aliasId,
          userId,
        )
        .run()

      if (result.meta.changes !== 1) {
        throw new Error(
          `Expected 1 D1 update, got ${result.meta.changes}`,
        )
      }
    } catch (error) {
      console.error(
        'CRITICAL: Disabled MXroute behavior was updated but D1 update failed',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
          error,
        },
      )

      /*
       * Restore the old disabled
       * configuration.
       */
      const deletedNewConfig =
        await deleteForwarder(env, {
          domain: alias.domain,
          alias: alias.local_part,
        })

      if (deletedNewConfig) {
        const restored =
          await createDisabledForwarder(
            env,
            {
              domain: alias.domain,
              alias: alias.local_part,
              behavior:
                alias.disabled_behavior,
            },
          )

        if (!restored) {
          console.error(
            'CRITICAL: Failed to restore previous disabled MXroute configuration after D1 failure',
            {
              aliasId,
              domain: alias.domain,
              localPart:
                alias.local_part,
            },
          )
        }
      } else {
        console.error(
          'CRITICAL: Failed to remove new disabled MXroute configuration after D1 failure',
          {
            aliasId,
            domain: alias.domain,
            localPart:
              alias.local_part,
          },
        )
      }

      return Response.json(
        {
          error:
            'Alias could not be updated completely. Please contact support.',
        },
        { status: 500 },
      )
    }

    return Response.json({
      success: true,
    })
  }

  /*
   * ACTIVE ALIAS
   *
   * MXroute currently forwards to the
   * saved destination.
   *
   * Delete old configuration →
   * create new configuration →
   * update D1.
   */
  if (!alias.destination) {
    return Response.json(
      {
        error:
          'This alias does not have a destination email and cannot be updated.',
      },
      { status: 409 },
    )
  }

  const oldDestination =
    alias.destination

  const mxrouteDeleted =
    await deleteForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
    })

  if (!mxrouteDeleted) {
    return Response.json(
      {
        error:
          'Failed to remove the existing alias from MXroute',
      },
      { status: 502 },
    )
  }

  /*
   * Create the new forwarding
   * configuration.
   */
  const mxrouteCreated =
    await createForwarder(env, {
      domain: alias.domain,
      alias: alias.local_part,
      destination,
    })

  if (!mxrouteCreated) {
    /*
     * Restore the previous forwarding
     * configuration.
     */
    const restored =
      await createForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
        destination:
          oldDestination,
      })

    if (!restored) {
      console.error(
        'CRITICAL: Failed to update alias and failed to restore previous MXroute forwarding configuration',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
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

  /*
   * MXroute is now correct.
   * Update D1.
   */
  try {
    const result = await env.DB
      .prepare(`
        UPDATE aliases
        SET
          destination = ?,
          disabled_behavior = ?,
          note = ?
        WHERE id = ?
          AND domain_id IN (
            SELECT id
            FROM domains
            WHERE user_id = ?
          )
      `)
      .bind(
        destination,
        newDisabledBehavior,
        newNote,
        aliasId,
        userId,
      )
      .run()

    if (result.meta.changes !== 1) {
      throw new Error(
        `Expected 1 D1 update, got ${result.meta.changes}`,
      )
    }
  } catch (error) {
    console.error(
      'CRITICAL: Alias was updated in MXroute but D1 update failed',
      {
        aliasId,
        domain: alias.domain,
        localPart:
          alias.local_part,
        error,
      },
    )

    /*
     * D1 still contains the old state,
     * so restore the old MXroute
     * forwarding configuration.
     */
    const deletedNewConfig =
      await deleteForwarder(env, {
        domain: alias.domain,
        alias: alias.local_part,
      })

    if (deletedNewConfig) {
      const restored =
        await createForwarder(env, {
          domain: alias.domain,
          alias: alias.local_part,
          destination:
            oldDestination,
        })

      if (!restored) {
        console.error(
          'CRITICAL: Failed to restore previous MXroute forwarding configuration after D1 failure',
          {
            aliasId,
            domain: alias.domain,
            localPart:
              alias.local_part,
          },
        )
      }
    } else {
      console.error(
        'CRITICAL: Failed to remove new MXroute forwarding configuration after D1 failure',
        {
          aliasId,
          domain: alias.domain,
          localPart:
            alias.local_part,
        },
      )
    }

    return Response.json(
      {
        error:
          'Alias could not be updated completely. Please contact support.',
      },
      { status: 500 },
    )
  }

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
    .bind(
      domainId,
      userId,
    )
    .first<{
      id: string
      domain: string
    }>()

  if (!domain) {
    return Response.json(
      {
        error: 'Domain not found',
      },
      { status: 404 },
    )
  }

  const aliasCount =
    await env.DB
      .prepare(`
        SELECT COUNT(*) AS count
        FROM aliases
        WHERE domain_id = ?
      `)
      .bind(domainId)
      .first<{
        count: number
      }>()

  if (
    aliasCount &&
    aliasCount.count > 0
  ) {
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
    .bind(
      domainId,
      userId,
    )
    .run()

  return Response.json({
    success: true,
  })
}
