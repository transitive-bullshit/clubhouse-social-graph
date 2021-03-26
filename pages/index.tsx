import React from 'react'

import { User } from 'state/user'
import { NavHeader, Head } from 'components'
import styles from 'styles/index.module.css'

export default function HomePage() {
  return (
    <User.Provider>
      <Head />

      <div className={styles.body}>
        <NavHeader />

        <main className={styles.main}>
          <section className={styles.heroSection}>
            <div className={styles.intro}>
              <h1>Understand Your Clubhouse Social Graph</h1>

              <h2>
                Cool visualizations of all your Clubhouse peeps, invite chain,
                and follower graph 🤙
              </h2>
            </div>
          </section>
        </main>
      </div>
    </User.Provider>
  )
}
