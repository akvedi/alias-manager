import { createAuth, type Env } from './lib/auth'

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

    if (url.pathname.startsWith('/api/aliases')) {
      if (!session) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 401 },
        )
      }
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/aliases'
    ) {
      return getAliases(env)
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

      return disableAlias(env, aliasId)
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

      return enableAlias(env, aliasId)
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404 },
    )
  },
}

async function getAliases(env: Env): Promise<Response> {
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
      ORDER BY aliases.created_at DESC
    `)
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
): Promise<Response> {
  const result = await env.DB
    .prepare(`
      UPDATE aliases
      SET
        status = 'disabled',
        disabled_at = unixepoch()
      WHERE id = ?
    `)
    .bind(aliasId)
    .run()

  if (result.meta.changes === 0) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  return Response.json({
    success: true,
  })
}

async function enableAlias(
  env: Env,
  aliasId: string,
): Promise<Response> {
  const result = await env.DB
    .prepare(`
      UPDATE aliases
      SET
        status = 'active',
        disabled_at = NULL
      WHERE id = ?
    `)
    .bind(aliasId)
    .run()

  if (result.meta.changes === 0) {
    return Response.json(
      { error: 'Alias not found' },
      { status: 404 },
    )
  }

  return Response.json({
    success: true,
  })
}
