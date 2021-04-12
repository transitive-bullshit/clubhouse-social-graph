import React from 'react'

import { Layout, ParticleAnimation, HeroCTA } from 'components'
import styles from 'styles/index.module.css'

export default function HomePage() {
  const [hasMounted, setHasMounted] = React.useState(false)
  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <Layout full>
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
            Gain insight into Clubhouse with powerful visualizations of your
            invite chain and follower graph 🤙
          </h2>

          <HeroCTA />
        </div>
      </section>
    </Layout>
  )
}
