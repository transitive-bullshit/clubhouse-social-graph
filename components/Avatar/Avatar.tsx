import React from 'react'
import cs from 'classnames'

import { User } from 'lib/types'
import { getProfilePhotoUrl } from 'lib/get-profile-photo-url'
import { BlockImage } from '../BlockImage/BlockImage'

import styles from './styles.module.css'

const defaultProfileImageUrl = '/profile.png'

export const Avatar: React.FC<{
  user: User
  className?: string
  width?: number
  size?: 'md' | 'lg' | 'xl'
}> = ({ user, className, width, size = 'md', ...rest }) => {
  return (
    <BlockImage
      src={getProfilePhotoUrl(user, {
        width
      })}
      alt={user.name || user.username}
      width={512}
      height={512}
      className={cs(styles.avatar, styles[size], className)}
      fallback={defaultProfileImageUrl}
      {...rest}
    />
  )
}
