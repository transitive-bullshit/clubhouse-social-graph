export async function fetchClubhouseAPI({
  endpoint,
  body,
  method = 'GET'
}: {
  endpoint: string
  method?: 'POST' | 'GET'
  body?: any
}) {
  console.log('<<< fetchClubhouseAPI', method, endpoint)
  try {
    const res = await fetch(`/api${endpoint}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'content-type': 'application/json'
      }
    })

    if (!res.ok) {
      const error = await res.json()
      console.warn('error', res.status, error.message)
      throw new Error(error.message || 'unknown error')
    }

    const result = await res.json()

    console.log('>>> fetchClubhouseAPI', method, endpoint, '=>', result)
    return result
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}
