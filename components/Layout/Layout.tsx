import React from 'react'
import cs from 'classnames'

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
  socialImage?: string
}> = ({ children, title, description, twitter, socialImage, full = false }) => {
  return (
    <User.Provider>
      <Head
        title={title}
        description={description}
        twitter={twitter}
        socialImage={socialImage}
      />

      <div className={cs(styles.body, full ? 'full-page' : 'fixed-page')}>
        <NavHeader full={full} />

        <main className={styles.main}>{children}</main>

        {full && <NavFooter />}
      </div>
    </User.Provider>
  )
}
