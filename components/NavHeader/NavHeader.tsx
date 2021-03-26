import React from 'react'
import Link from 'next/link'
import {
  useDisclosure,
  Avatar,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import { IoIosLogOut } from 'react-icons/io'

import { LoginModal } from 'components'
import { User } from 'state/user'

import styles from './styles.module.css'

export const NavHeader: React.FC = () => {
  const loginModal = useDisclosure()
  const { user, isLoggedIn, isLoading, logout } = User.useContainer()
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

        {!isLoading && (
          <nav className={styles.nav}>
            {isLoggedIn ? (
              <Menu>
                <MenuButton>
                  <Avatar src={user.photo_url} name={user.name} size='md' />
                </MenuButton>

                <MenuList>
                  <MenuItem icon={<Icon as={IoIosLogOut} />} onClick={logout}>
                    Log out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button colorScheme='blue' onClick={loginModal.onOpen}>
                Log in
              </Button>
            )}
          </nav>
        )}
      </div>

      {!isLoggedIn && loginModal.isOpen && (
        <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.onClose} />
      )}
    </header>
  )
}
