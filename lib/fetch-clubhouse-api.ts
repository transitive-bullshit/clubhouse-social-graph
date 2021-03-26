export async function fetchClubhouseAPI({
  endpoint,
  body,
  method = 'POST'
}: {
  endpoint: string
  method?: 'POST' | 'GET'
  body?: any
}) {
  console.log('fetchClubhouseAPI', endpoint, method, body)
  try {
    const res = await fetch(`/api${endpoint}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'content-type': 'application/json'
      }
    }).then((res) => res.json())

    console.log('fetchClubhouseAPI', endpoint, method, body, '=>', res)
    return res
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}
