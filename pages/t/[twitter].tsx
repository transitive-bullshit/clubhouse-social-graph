import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

export async function getServerSideProps(ctx) {
  const twitter = ctx.params.twitter as string

  let driver: neo4j.Driver

  try {
    driver = db.driver()

    let session: neo4j.Session

    try {
      session = driver.session({ defaultAccessMode: 'READ' })
      const user = (
        await db.getUserByTwitterHandle(session, twitter)
      ).records[0]?.get(0)?.properties

      if (!user?.username) {
        return {
          notFound: true
        }
      }

      return {
        redirect: {
          destination: `/${user.username}`,
          permanent: true
        }
      }
    } finally {
      await session.close()
    }
  } finally {
    await driver.close()
  }
}

export default () => null
