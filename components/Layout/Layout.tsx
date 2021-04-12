import React from 'react'

import { User } from 'state/user'

import { NavHeader } from '../NavHeader/NavHeader'
import { NavFooter } from '../NavFooter/NavFooter'
import { Head } from '../Head/Head'

import styles from './styles.module.css'

export const Layout: React.FC<{ full?: boolean }> = ({
  children,
  full = false
}) => {
  return (
    <User.Provider>
      <Head />

      <div className={styles.body}>
        <NavHeader />

        <main className={styles.main}>{children}</main>

        {full && <NavFooter />}
      </div>
    </User.Provider>
  )
}
