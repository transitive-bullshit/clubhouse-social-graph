import React from 'react'
import { createContainer } from 'unstated-next'
import { useDisclosure } from '@chakra-ui/react'

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

function useUser() {
  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const loginModal = useDisclosure()
  const isLoggedIn = !!user?.user_id

  const updateUser = async () => {
    const res = await fetchClubhouseAPI({
      method: 'POST',
      endpoint: '/me'
    })
    setUser(res.user_profile)
    return res.user_profile
  }

  const logout = async () => {
    await fetchClubhouseAPI({
      endpoint: '/logout'
    })

    setUser(null)
  }

  async function crawlUser(user) {
    if (!user) return

    console.log('<<< crawl', user.user_id, user)
    const crawl = await fetchClubhouseAPI({
      method: 'POST',
      endpoint: '/crawl'
    })
    console.log('>>> crawl', user.user_id, crawl)
  }

  React.useEffect(() => {
    if (user) {
      crawlUser(user)
    }
  }, [user])

  React.useEffect(() => {
    setIsLoading(true)
    updateUser().then(() => {
      setIsLoading(false)
    })
  }, [])

  return { user, isLoggedIn, isLoading, updateUser, loginModal, logout }
}

export const User = createContainer(useUser)
