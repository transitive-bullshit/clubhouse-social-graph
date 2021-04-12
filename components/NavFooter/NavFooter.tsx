import React from 'react'
import Link from 'next/link'
import cs from 'classnames'
import { FaTwitter, FaGithub } from 'react-icons/fa'

import { User } from 'state/user'
import exampleUsers from 'lib/example-users'

import styles from './styles.module.css'

export const NavFooter: React.FC = () => {
  const { user, loginModal } = User.useContainer()

  const sections = [
    {
      title: 'Site',
      key: 'site',
      links: [
        {
          title: 'Home',
          href: '/'
        },
        {
          title: 'About',
          href: '/about'
        },
        {
          title: 'Top 100 Users',
          href: '/top-users'
        },
        {
          title: 'Clubhouse Data',
          href: '/data'
        },
        user && {
          title: user.name || user.username,
          href: `/${user.username}`
        },
        !user && {
          title: 'Log in',
          onClick: loginModal.onOpen
        }
      ].filter(Boolean)
    },
    {
      title: 'Example Users',
      key: 'users',
      links: exampleUsers
    }
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {sections.map((section) => (
          <div
            key={section.key}
            className={cs(styles.section, styles[section.key])}
          >
            <h3>{section.title}</h3>

            <div className={styles.links}>
              {section.links.map((link) =>
                link.href ? (
                  <Link key={link.title} href={link.href}>
                    <a title={link.title} className={styles.link}>
                      {link.title}
                    </a>
                  </Link>
                ) : (
                  <div
                    className={styles.link}
                    key={link.title}
                    title={link.title}
                    onClick={link.onClick}
                  >
                    {link.title}
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        <div key='socials' className={cs(styles.section, styles.socials)}>
          <h3>Socials</h3>

          <div className={styles.social}>
            <a
              className={styles.twitter}
              href='https://twitter.com/transitive_bs'
              title='Twitter @transitive_bs'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaTwitter size={24} />
            </a>

            <a
              className={styles.instagram}
              href='https://github.com/transitive-bullshit/clubhouse'
              title='GitHub'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaGithub size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
