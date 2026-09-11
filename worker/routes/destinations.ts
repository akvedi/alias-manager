import type { Env } from '../lib/auth'

export async function getDestinations(
  env: Env,
  userId: string,
): Promise<Response> {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        email,
        label,
        created_at
      FROM destinations
      WHERE user_id = ?
      ORDER BY label COLLATE NOCASE ASC, email COLLATE NOCASE ASC
    `)
    .bind(userId)
    .all()

  return Response.json(
    result.results.map((destination) => ({
      id: destination.id,
      email: destination.email,
      label: destination.label,
      createdAt: destination.created_at,
    })),
  )
}

export async function createDestination(
  env: Env,
  request: Request,
  userId: string,
 ): Promise<Response> {
  const body = await request.json<{
    email?: string
    label?: string
  }>()

  const email = body.email?.trim().toLowerCase()
  const label = body.label?.trim()

  if (!email) {
    return Response.json(
      { error: 'Email is required' },
      { status: 400 },
    )
  }

  if (!label) {
    return Response.json(
      { error: 'Label is required' },
      { status: 400 },
    )
  }

  if (!email.includes('@')) {
    return Response.json(
      { error: 'Invalid email address' },
      { status: 400 },
    )
  }

  try {
    const id = crypto.randomUUID()

    await env.DB
      .prepare(`
        INSERT INTO destinations (
          id,
          user_id,
          email,
          created_at,
          label
        )
        VALUES (?, ?, ?, unixepoch(), ?)
      `)
      .bind(
        id,
        userId,
        email,
        label,
      )
      .run()

    return Response.json(
      {
        success: true,
        id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error:
          'A destination with this email already exists',
      },
      { status: 409 },
    )
  }
}

export async function updateDestination(
  env: Env,
  request: Request,
  destinationId: string,
  userId: string,
 ): Promise<Response> {
  const body = await request.json<{
    email?: string
    label?: string
  }>()

  const email = body.email?.trim().toLowerCase()
  const label = body.label?.trim()

  if (!email) {
    return Response.json(
      { error: 'Email is required' },
      { status: 400 },
    )
  }

  if (!label) {
    return Response.json(
      { error: 'Label is required' },
      { status: 400 },
    )
  }

  if (!email.includes('@')) {
    return Response.json(
      { error: 'Invalid email address' },
      { status: 400 },
    )
  }

  const existing = await env.DB
    .prepare(`
      SELECT id
      FROM destinations
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(destinationId, userId)
    .first<{ id: string }>()

  if (!existing) {
    return Response.json(
      { error: 'Destination not found' },
      { status: 404 },
    )
  }

  try {
    await env.DB
      .prepare(`
        UPDATE destinations
        SET
          email = ?,
          label = ?
        WHERE id = ?
          AND user_id = ?
      `)
      .bind(
        email,
        label,
        destinationId,
        userId,
      )
      .run()
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error:
          'A destination with this email already exists',
      },
      { status: 409 },
    )
  }

  return Response.json({ success: true })
}

export async function deleteDestination(
  env: Env,
  destinationId: string,
  userId: string,
 ): Promise<Response> {
  const destination = await env.DB
    .prepare(`
      SELECT id
      FROM destinations
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(destinationId, userId)
    .first<{ id: string }>()

  if (!destination) {
    return Response.json(
      { error: 'Destination not found' },
      { status: 404 },
    )
  }

  await env.DB
    .prepare(`
      DELETE FROM destinations
      WHERE id = ?
        AND user_id = ?
    `)
    .bind(destinationId, userId)
    .run()

  return Response.json({ success: true })
}
