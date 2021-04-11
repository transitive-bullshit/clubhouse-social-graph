import type { User } from 'clubhouse-client'

export type { User }

export interface UserNode {
  user: User
  followers: User[]
  following: User[]
  inviteChain: User[]
  invitees: User[]
}

export interface UserNodeMap {
  [userId: string]: UserNode
}

export type Visualization = 'followers' | 'following' | 'invites'
