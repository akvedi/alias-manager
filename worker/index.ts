interface Env {
  DB: D1Database
}

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/aliases') {
      const result = await env.DB
        .prepare('SELECT * FROM aliases ORDER BY created_at DESC')
        .all()

      return Response.json(result.results)
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404 },
    )
  },
}
