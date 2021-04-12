import React from 'react'
import Link from 'next/link'
import {
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { IoIosLogOut } from 'react-icons/io'
import { AiOutlineUser, AiOutlineHome } from 'react-icons/ai'

import { LoginModal } from '../LoginModal/LoginModal'
import { Avatar } from '../Avatar/Avatar'

import { User } from 'state/user'

import styles from './styles.module.css'

export const NavHeader: React.FC<{ full?: boolean }> = ({ full }) => {
  const router = useRouter()
  const {
    user,
    isLoggedIn,
    isLoading,
    loginModal,
    logout
  } = User.useContainer()

  const onClickHome = React.useCallback(() => {
    router.push('/')
  }, [router])

  const onClickProfile = React.useCallback(() => {
    router.push(`/${user.username}`)
  }, [user, router])

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
            {full && (
              <Link href='/about'>
                <a className={styles.link}>About</a>
              </Link>
            )}

            {isLoggedIn ? (
              <Menu>
                <MenuButton className={styles.avatar}>
                  <Avatar user={user} />
                </MenuButton>

                <MenuList>
                  <MenuItem
                    icon={<Icon as={AiOutlineHome} />}
                    onClick={onClickHome}
                  >
                    Home
                  </MenuItem>

                  <MenuItem
                    icon={<Icon as={AiOutlineUser} />}
                    onClick={onClickProfile}
                  >
                    Social Graph
                  </MenuItem>

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
