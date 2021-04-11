import React from 'react'

import * as db from 'clubhouse-crawler'
import * as neo4j from 'neo4j-driver'

import {
  Layout,
  SocialGraphVisualization,
  VisualizationSelector,
  QueryParamProvider
} from 'components'
import { getFullUserByUsername } from 'lib/get-full-user-by-username'
import { UserNode } from 'lib/types'
import { Viz } from 'state/viz'

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

    // revalidate once every hour
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
  return (
    <Layout>
      <QueryParamProvider>
        <Viz.Provider>
          <SocialGraph userNode={userNode} />
        </Viz.Provider>
      </QueryParamProvider>
    </Layout>
  )
}

const SocialGraph = ({ userNode }: { userNode: UserNode }) => {
  const { addUserNode } = Viz.useContainer()

  React.useEffect(() => {
    if (!userNode) return

    addUserNode(userNode)
  }, [userNode, addUserNode])

  return (
    <section className={styles.fullPage}>
      <SocialGraphVisualization />

      <VisualizationSelector />
    </section>
  )
}
