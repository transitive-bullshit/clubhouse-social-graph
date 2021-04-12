/* eslint-disable */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  images: {
    domains: [
      'pbs.twimg.com',
      'clubhouseprod.s3.amazonaws.com',
      'chsg.imgix.net'
    ]
  }
})
