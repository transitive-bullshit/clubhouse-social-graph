import React from 'react'

import { Layout, FollowerGraphVisualization } from 'components'
// import { Switch } from '@chakra-ui/react'
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
  const [isChecked] = React.useState(true)

  return (
    <Layout>
      <section className={styles.fullPage}>
        {/* <h1>{username}</h1> */}
        {/* <Switch
          isChecked={isChecked}
          onChange={() => {
            setIsChecked(!isChecked)
          }}
        /> */}

        <FollowerGraphVisualization
          username={username}
          visualization={isChecked ? 'following' : 'followers'}
        />
      </section>
    </Layout>
  )
}
