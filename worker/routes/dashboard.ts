import type { Env } from '../lib/auth'

export async function getDashboard(
  env: Env,
  userId: string,
): Promise<Response> {
  const domainCount = await env.DB
    .prepare(`
      SELECT COUNT(*) AS count
      FROM domains
      WHERE user_id = ?
    `)
    .bind(userId)
    .first<{
      count: number
    }>()

  const aliasCounts = await env.DB
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(
          CASE
            WHEN aliases.status = 'active' THEN 1
            ELSE 0
          END
        ) AS active,
        SUM(
          CASE
            WHEN aliases.status = 'disabled' THEN 1
            ELSE 0
          END
        ) AS disabled
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE domains.user_id = ?
    `)
    .bind(userId)
    .first<{
      total: number
      active: number
      disabled: number
    }>()

  const recentAliases = await env.DB
    .prepare(`
      SELECT
        aliases.id,
        aliases.local_part,
        domains.domain,
        aliases.destination,
        aliases.status,
        aliases.created_at
      FROM aliases
      JOIN domains
        ON aliases.domain_id = domains.id
      WHERE domains.user_id = ?
      ORDER BY aliases.created_at DESC
      LIMIT 5
    `)
    .bind(userId)
    .all()

  return Response.json({
    domains: domainCount?.count ?? 0,

    aliases: {
      total: aliasCounts?.total ?? 0,
      active: aliasCounts?.active ?? 0,
      disabled: aliasCounts?.disabled ?? 0,
    },

    recentAliases: recentAliases.results.map(
      (alias) => ({
        id: alias.id,
        address: `${alias.local_part}@${alias.domain}`,
        destination: alias.destination,
        enabled: alias.status === 'active',
        createdAt: alias.created_at,
      }),
    ),
  })
}
