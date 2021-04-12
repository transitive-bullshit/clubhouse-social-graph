> Clubhouse social graph visualizations.

[![Build Status](https://github.com/senpai-so/clubhouse-social-graph/actions/workflows/build.yml/badge.svg)](https://github.com/senpai-so/clubhouse-social-graph/actions/workflows/build.yml) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

## Intro

This webapp is built using [Next.js](https://nextjs.org) deployed to [Vercel](http://vercel.com).

## Core Deps

- [clubhouse-client](https://github.com/transitive-bullshit/clubhouse) - OSS TS wrapper around the unofficial Clubhouse API.
- [clubhouse-crawler](https://github.com/transitive-bullshit/clubhouse) - Crawler for the Clubhouse social graph with neo4j support.
- [neo4j](https://neo4j.com) - Graph database used for storing user info and relationships.
- [d3](https://d3js.org) - Visualization framework.
- [react-force-graph](https://github.com/vasturiano/react-force-graph) - Excellent D3 wrapper for working with force-directed graphs.

## MVP Todo

- Home page `/`
  - [ ] content
  - [ ] social proof
  - [x] footer
- User page `/[username]`
  - [x] Basic user profile info
  - [x] Links to social
  - [x] Followers viz
  - [x] Following viz
  - [x] Invite chain viz
  - [ ] Relationship viz `/[username]/relationship/[username]`
- User settings page `/[username]/settings`
  - [ ] Adjust viz settings
  - [ ] Logout
- Core visualization
  - [x] Navigate to user profiles
  - [ ] Navigate to user relationship viz
  - [x] Add fallback profile photo
  - [x] Add info modal
  - [x] Add zoom in / out buttons
- [ ] About page `/about`
- [ ] Data page `/data`

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

Support my OSS work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
