import React from 'react'
import Link from 'next/link'
import { useDisclosure, Button } from '@chakra-ui/react'

import { LoginModal } from 'components'
import { User } from 'state/user'

import styles from './styles.module.css'

export const NavHeader: React.FC = () => {
  const loginModal = useDisclosure()
  const { user, isLoggedIn } = User.useContainer()
  console.log({ user, isLoggedIn })

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
          {!isLoggedIn && (
            <Button colorScheme='blue' onClick={loginModal.onOpen}>
              Log in
            </Button>
          )}
        </nav>
      </div>

      {!isLoggedIn && loginModal.isOpen && (
        <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.onClose} />
      )}
    </header>
  )
}
