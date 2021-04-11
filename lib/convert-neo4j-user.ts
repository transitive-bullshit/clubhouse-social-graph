import { User } from 'clubhouse-client'

export const convertNeo4jUser = (user?: any): User | null => {
  const u = user?.properties || user

  if (u) {
    // remote any potentially sensitive info
    delete u.phone_number
    delete u.deviceId
    delete u.authToken

    return {
      ...u,
      // simplify date formats
      time_created: u.time_created?.toString(),
      time_scraped: u.time_scraped?.toString()
    }
  } else {
    return null
  }
}
