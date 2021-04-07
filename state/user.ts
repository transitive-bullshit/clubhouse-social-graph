import React from 'react'
import { createContainer } from 'unstated-next'

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

export function useUser() {
  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const isLoggedIn = !!user?.user_id

  const updateUser = async () => {
    const res = await fetchClubhouseAPI({
      method: 'POST',
      endpoint: '/me'
    })
    setUser(res.user_profile)

    if (!user && res.user_profile) {
      console.log('<<< crawling', res.user_profile)
      const crawl = await fetchClubhouseAPI({
        method: 'POST',
        endpoint: '/crawl'
      })
      console.log('>>> crawl result', crawl)
    }
  }

  const logout = async () => {
    await fetchClubhouseAPI({
      endpoint: '/logout'
    })

    setUser(null)
  }

  React.useEffect(() => {
    setIsLoading(true)
    updateUser().then(() => {
      setIsLoading(false)
    })

    // If redirectTo is set, redirect if the user was not found.
    // if (redirectTo && !isLoggedIn) {
    //   Router.push(redirectTo)
    // }
  }, [])

  return { user, isLoggedIn, isLoading, updateUser, logout }
}

export const User = createContainer(useUser)
