import React from 'react'

import { User } from 'state/user'

import { NavHeader } from '../NavHeader/NavHeader'
import { NavFooter } from '../NavFooter/NavFooter'
import { Head } from '../Head/Head'

import styles from './styles.module.css'

export const Layout: React.FC<{
  full?: boolean
  title?: string
  description?: string
  twitter?: string
}> = ({ children, title, description, twitter, full = false }) => {
  return (
    <User.Provider>
      <Head title={title} description={description} twitter={twitter} />

      <div className={styles.body}>
        <NavHeader />

        <main className={styles.main}>{children}</main>

        {full && <NavFooter />}
      </div>
    </User.Provider>
  )
}
