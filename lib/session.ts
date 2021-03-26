import { NextApiRequest, NextApiResponse } from 'next'
import { withIronSession, Session } from 'next-iron-session'
import { isDev, sessionSecret, sessionCookieName } from './config'

export interface NextApiRequestSession extends NextApiRequest {
  session: Session
}

export type { NextApiResponse }

export function withSession(handler) {
  return withIronSession(handler, {
    password: sessionSecret,
    cookieName: sessionCookieName,
    cookieOptions: {
      secure: !isDev
    }
  })
}
