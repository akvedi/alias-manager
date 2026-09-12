import type { Env } from './auth'

const MXROUTE_API_BASE = 'https://api.mxroute.com'

export type DisabledBehavior =
  | 'blackhole'
  | 'reject'

interface CreateForwarderParams {
  domain: string
  alias: string
  destination: string
}

export async function createForwarder(
  env: Env,
  params: CreateForwarderParams,
): Promise<boolean> {
  const response = await fetch(
    `${MXROUTE_API_BASE}/domains/${encodeURIComponent(params.domain)}/forwarders`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'X-Server': env.MXROUTE_SERVER,
        'X-Username': env.MXROUTE_USERNAME,
        'X-API-Key': env.MXROUTE_API_KEY,
      },

      body: JSON.stringify({
        alias: params.alias,
        destinations: [params.destination],
      }),
    },
  )

  if (response.status === 201) {
    return true
  }

  const errorBody = await response.text()

  console.error(
    'MXroute create forwarder failed:',
    response.status,
    errorBody,
  )

  return false
}

interface CreateDisabledForwarderParams {
  domain: string
  alias: string
  behavior: DisabledBehavior
}

export async function createDisabledForwarder(
  env: Env,
  params: CreateDisabledForwarderParams,
): Promise<boolean> {
  const destination =
    params.behavior === 'reject'
      ? ':fail:'
      : ':blackhole:'

  const response = await fetch(
    `${MXROUTE_API_BASE}/domains/${encodeURIComponent(params.domain)}/forwarders`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'X-Server': env.MXROUTE_SERVER,
        'X-Username': env.MXROUTE_USERNAME,
        'X-API-Key': env.MXROUTE_API_KEY,
      },

      body: JSON.stringify({
        alias: params.alias,
        destinations: [destination],
      }),
    },
  )

  if (response.status === 201) {
    return true
  }

  const errorBody = await response.text()

  console.error(
    'MXroute create disabled forwarder failed:',
    response.status,
    errorBody,
  )

  return false
}

interface DeleteForwarderParams {
  domain: string
  alias: string
}

export async function deleteForwarder(
  env: Env,
  params: DeleteForwarderParams,
): Promise<boolean> {
  const response = await fetch(
    `${MXROUTE_API_BASE}/domains/${encodeURIComponent(params.domain)}/forwarders/${encodeURIComponent(params.alias)}`,
    {
      method: 'DELETE',

      headers: {
        'X-Server': env.MXROUTE_SERVER,
        'X-Username': env.MXROUTE_USERNAME,
        'X-API-Key': env.MXROUTE_API_KEY,
      },
    },
  )

  if (response.status === 204) {
    return true
  }

  const errorBody = await response.text()

  console.error(
    'MXroute delete forwarder failed:',
    response.status,
    errorBody,
  )

  return false
}

export async function listDomains(
  env: Env,
): Promise<string[] | null> {
  const response = await fetch(
    `${MXROUTE_API_BASE}/domains`,
    {
      method: 'GET',

      headers: {
        'X-Server': env.MXROUTE_SERVER,
        'X-Username': env.MXROUTE_USERNAME,
        'X-API-Key': env.MXROUTE_API_KEY,
      },
    },
  )

  if (response.status === 401) {
    console.error(
      'MXroute domain list authentication failed',
    )

    return null
  }

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      'MXroute list domains failed:',
      response.status,
      errorBody,
    )

    return null
  }

  const result = await response.json<{
    success: boolean
    data?: string[]
  }>()

  if (
    !result.success ||
    !Array.isArray(result.data)
  ) {
    console.error(
      'MXroute list domains returned an invalid response',
    )

    return null
  }

  return result.data
}
