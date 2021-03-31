import * as crawler from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

export const getSeedUsers = async (driver: neo4j.Driver) => {
  let session

  try {
    session = driver.session({ defaultAccessMode: 'READ' })

    const seedUserIds = (
      await crawler.getSeedUsers(session, {
        limit: 20
      })
    ).records.map((record) => record.get(0))

    return new Set<number>(seedUserIds)
  } finally {
    await session.close()
  }
}
