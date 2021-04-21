import React from 'react'
import NextHead from 'next/head'

const siteName = 'Clubhouse Social Graph'
const defaultSocialImage =
  'https://ssfy.io/https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F6abf3b96-a774-44d6-bd14-d6df0f2b682d%252FScreen_Shot_2021-04-12_at_8.40.35_AM.jpg%3Ftable%3Dblock%26id%3Dbd1d4ef6-e6ad-409c-8095-aa13ce7f2c0e%26cache%3Dv2'

export const Head: React.FC<{
  title?: string
  domain?: string
  twitter?: string
  description?: string
  socialImage?: string
}> = ({
  title = siteName,
  domain = 'clubhousesocialgraph.com',
  twitter = 'transitive_bs',
  description = 'Visualizations for understanding your Clubhouse social graph.',
  socialImage = defaultSocialImage
}) => {
  return (
    <NextHead>
      <link rel='shortcut icon' href='/favicon.png' />

      <meta name='twitter:title' content={title} />
      <meta property='og:title' content={title} />
      <meta property='og:site_name' content={siteName} />

      <meta property='twitter:domain' content={domain} />
      <meta name='twitter:creator' content={`@${twitter}`} />

      <meta name='description' content={description} />
      <meta property='og:description' content={description} />
      <meta name='twitter:description' content={description} />

      {socialImage ? (
        <>
          {socialImage === defaultSocialImage && (
            <meta name='twitter:card' content='summary_large_image' />
          )}
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
