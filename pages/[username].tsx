import React from 'react'

import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import { Layout, SocialGraphVisualization } from 'components'
import { getFullUserByUsername } from 'lib/get-full-user-by-username'
import { UserNode, UserNodeMap } from 'lib/types'
import styles from 'styles/user.module.css'

export const getStaticProps = async (context) => {
  const username = context.params.username as string

  try {
    const props: any = {
      username
    }

    let driver: neo4j.Driver

    try {
      driver = db.driver()

      let session: neo4j.Session

      try {
        session = driver.session({ defaultAccessMode: 'READ' })
        const userNode = await getFullUserByUsername(session, username)
        props.userNode = userNode
      } finally {
        await session.close()
      }
    } finally {
      await driver.close()
    }

    return { props, revalidate: 3600 }
  } catch (err) {
    console.error('page error', username, err)

    throw err
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  }
}

export default function UserDetailPage({
  username,
  userNode
}: {
  username: string
  userNode: UserNode
}) {
  const [userNodeMap, setUserNodeMap] = React.useState<UserNodeMap>({})
  const [visualization] = React.useState<any>('following')

  const addUserNode = React.useCallback(
    (userNode: UserNode) => {
      const userId = userNode.user.user_id
      console.log('addUserNode', userId, userNode)

      setUserNodeMap((userNodeMap) => ({
        ...userNodeMap,
        [userId]: userNode
      }))
    },
    [setUserNodeMap]
  )

  React.useEffect(() => {
    if (!userNode) return

    setUserNodeMap({
      [userNode.user.user_id]: userNode
    })
  }, [userNode])

  console.log('UserDetailPage', username, !!userNode)
  return (
    <Layout>
      <section className={styles.fullPage}>
        <SocialGraphVisualization
          userNodeMap={userNodeMap}
          addUserNode={addUserNode}
          visualization={visualization}
        />
      </section>
    </Layout>
  )
}
