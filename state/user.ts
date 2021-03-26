import React from 'react'
import { createContainer } from 'unstated-next'

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'

export function useUser() {
  const [user, setUser] = React.useState(null)
  const isLoggedIn = user?.user_id

  const updateUser = async () => {
    const res = await fetchClubhouseAPI({
      endpoint: '/me'
    })

    setUser(res.user_profile)
  }

  React.useEffect(() => {
    updateUser()

    // If redirectTo is set, redirect if the user was not found.
    // if (redirectTo && !isLoggedIn) {
    //   Router.push(redirectTo)
    // }
  }, [])

  return { user, isLoggedIn, updateUser }
}

export const User = createContainer(useUser)
