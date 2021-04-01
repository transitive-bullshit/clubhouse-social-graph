import React from 'react'

import { User } from 'state/user'
import { NavHeader, Head } from 'components'
import styles from './styles.module.css'

export const Layout = ({ children }) => {
  return (
    <User.Provider>
      <Head />

      <div className={styles.body}>
        <NavHeader />

        <main className={styles.main}>{children}</main>
      </div>
    </User.Provider>
  )
}
