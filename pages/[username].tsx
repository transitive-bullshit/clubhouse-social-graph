import React from 'react'

import { Layout, FollowerGraphVisualization } from 'components'
import styles from 'styles/user.module.css'

export const getStaticProps = async (context) => {
  const username = context.params.username as string

  // TODO
  console.log({ username })

  try {
    const props = {
      username
    }

    return { props, revalidate: 10 }
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

export default function UserDetailPage({ username }: { username: string }) {
  return (
    <Layout>
      <section className={styles.socialGraph}>
        <h1>{username}</h1>

        <FollowerGraphVisualization />
      </section>
    </Layout>
  )
}
