import React from 'react'
import { Avatar, Button } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { FaTwitter, FaInstagram } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'

import { Viz } from 'state/viz'
import { getApproxNumRepresentation } from 'lib/get-approx-num-representation'
import { getProfilePhotoUrl } from 'lib/get-profile-photo-url'

import styles from './styles.module.css'

export const FocusedUserPane = () => {
  const {
    focusedUser: user,
    userNodeMap,
    addUserNode,
    removeUserNode
  } = Viz.useContainer()
  const router = useRouter()

  const numFollowers = getApproxNumRepresentation((user as any)?.num_followers)
  const numFollowing = getApproxNumRepresentation((user as any)?.num_following)

  const isExpanded = !!userNodeMap[user?.user_id]
  const isActiveUser = user && router.query.username === user.username

  const onClickExpand = React.useCallback(() => {}, [addUserNode, user])

  const onClickCollapse = React.useCallback(() => {
    removeUserNode(user.user_id)
  }, [removeUserNode, user])

  const onClickViewGraph = React.useCallback(() => {
    router.push(`/${user.username}`)
  }, [router, user])

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.lhs}>
                <Avatar
                  src={getProfilePhotoUrl(user)}
                  name={user.name}
                  size='lg'
                />
              </div>

              <div className={styles.rhs}>
                <div className={styles.name}>{user.name}</div>

                <div className={styles.stat}>
                  <span className={styles.bold}>{numFollowers}</span> Followers
                </div>

                <div className={styles.stat}>
                  <span className={styles.bold}>{numFollowing}</span> Following
                </div>
              </div>
            </div>

            {user.bio && <p className={styles.bio}>{user.bio}</p>}

            {(user.twitter || (user as any).instagram) && (
              <div className={styles.social}>
                {user.twitter && (
                  <a
                    className={styles.twitter}
                    href={`https://twitter.com/${user.twitter}`}
                    title={`Twitter @${user.twitter}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <FaTwitter size={24} />
                  </a>
                )}

                {(user as any).instagram && (
                  <a
                    className={styles.instagram}
                    href={`https://instagram.com/${(user as any).instagram}`}
                    title={`Instagram @${(user as any).instagram}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <FaInstagram size={24} />
                  </a>
                )}
              </div>
            )}

            <div className={styles.actions}>
              {isExpanded ? (
                <Button colorScheme='blue' onClick={onClickCollapse}>
                  Collapse
                </Button>
              ) : (
                <Button colorScheme='blue' onClick={onClickExpand}>
                  Expand
                </Button>
              )}

              <Button
                colorScheme='blue'
                onClick={onClickViewGraph}
                isDisabled={isActiveUser}
              >
                View Graph
              </Button>

              <a
                href={`https://joinclubhouse.com/@${user.username}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button colorScheme='blue'>
                  View Bio
                  <HiOutlineExternalLink
                    className={styles.external}
                    size={12}
                  />
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
