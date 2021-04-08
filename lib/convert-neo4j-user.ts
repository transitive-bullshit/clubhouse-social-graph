import { User } from 'clubhouse-client'

export const convertNeo4jUser = (user?: any): User | null => {
  const u = user?.properties

  if (u) {
    return {
      ...u,
      time_created: u.time_created?.toString(),
      time_scraped: u.time_scraped?.toString()
    }
  } else {
    return null
  }
}
