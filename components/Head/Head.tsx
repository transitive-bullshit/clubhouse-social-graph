import React from 'react'
import NextHead from 'next/head'

export const Head: React.FC<{
  title?: string
  domain?: string
  twitter?: string
  description?: string
  socialImage?: string
}> = ({
  title = 'Clubhouse Social Graph',
  domain = 'clubhousesocialgraph.com',
  twitter = 'clubhouseSocialGraph',
  description = 'Visualizations for understanding your Clubhouse social graph.',
  socialImage = null
}) => {
  return (
    <NextHead>
      <link rel='shortcut icon' href='/favicon.png' />

      <meta name='twitter:title' content={title} />
      <meta property='og:title' content={title} />
      <meta property='og:site_name' content={title} />

      <meta property='twitter:domain' content={domain} />
      <meta name='twitter:creator' content={`@${twitter}`} />

      <meta name='description' content={description} />
      <meta property='og:description' content={description} />
      <meta name='twitter:description' content={description} />

      {socialImage ? (
        <>
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:image' content={socialImage} />
          <meta property='og:image' content={socialImage} />
        </>
      ) : (
        <meta name='twitter:card' content='summary' />
      )}

      <title>{title}</title>
    </NextHead>
  )
}
