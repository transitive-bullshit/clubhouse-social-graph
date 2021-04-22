import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@chakra-ui/react'

import { User } from 'state/user'
import { LoadingIndicator } from 'components'

import styles from './styles.module.css'

export const HeroCTA = () => {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, loginModal } = User.useContainer()

  const onClickProfile = React.useCallback(() => {
    router.push(`/${user.username}`)
  }, [user, router])

  return (
    <div className={styles.actions}>
      {isLoading ? (
        <>
          <Button style={{ visibility: 'hidden' }}>Loading...</Button>

          <LoadingIndicator isLoading={isLoading} fill={false} />
        </>
      ) : isLoggedIn ? (
        <Button colorScheme='blue' onClick={onClickProfile}>
          👉 View your social graph 👈
        </Button>
      ) : (
        <Button colorScheme='blue' onClick={loginModal.onOpen}>
          👉 Explore your graph 👈
        </Button>
      )}
    </div>
  )
}
