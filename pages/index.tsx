import React from 'react'

import { Layout, ParticleAnimation } from 'components'
import styles from 'styles/index.module.css'

export default function HomePage() {
  const [hasMounted, setHasMounted] = React.useState(false)
  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <Layout>
      {hasMounted && (
        <ParticleAnimation
          className={styles.particles}
          background={{
            r: 242,
            g: 239,
            b: 228,
            a: 255
          }}
          interactive={true}
        />
      )}

      <section className={styles.heroSection}>
        <div className={styles.intro}>
          <h1>Understand Your Clubhouse Social Graph</h1>

          <h2>
            Cool visualizations for all your Clubhouse peeps, invite chain, and
            follower graph 🤙
          </h2>
        </div>
      </section>
    </Layout>
  )
}
