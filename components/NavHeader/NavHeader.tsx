import React from 'react'
import Link from 'next/link'

import styles from './styles.module.css'

export const NavHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link href='/'>
          <a className={styles.brand}>
            <img
              className={styles.logo}
              src='/icon.png'
              alt='CH Social Graph'
            />
            CH Social Graph
          </a>
        </Link>

        <nav className={styles.nav}>
          <Link href='/login'>
            <a>Log in</a>
          </Link>
        </nav>
      </div>
    </header>
  )
}
