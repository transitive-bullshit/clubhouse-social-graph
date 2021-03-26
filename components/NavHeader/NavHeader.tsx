import React from 'react'
import Link from 'next/link'
import { useDisclosure, Button } from '@chakra-ui/react'

import { LoginModal } from 'components'

import styles from './styles.module.css'

export const NavHeader: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

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
          <Button colorScheme='blue' onClick={onOpen}>
            Log in
          </Button>
        </nav>
      </div>

      <LoginModal isOpen={isOpen} onClose={onClose} />
    </header>
  )
}
