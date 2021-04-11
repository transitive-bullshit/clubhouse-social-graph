import { User } from './types'

const imageProxyUrl = 'https://chsg.imgix.net'
const defaultProfileImageUrl = '/profile.png'

export const getProfilePhotoUrl = (
  user: User,
  {
    width = 512
  }: {
    width?: number
  } = {}
) => {
  let url = defaultProfileImageUrl
  let suffix = user?.photo_url?.split(':443/')?.[1]

  if (suffix) {
    const thumbnail = '_thumbnail_250x250'
    if (suffix.endsWith(thumbnail)) {
      suffix = suffix.substring(0, suffix.length - thumbnail.length)
    }

    url = `${imageProxyUrl}/${suffix}?w=${width}&auto=format&mask=corners`
  }

  return url
}
