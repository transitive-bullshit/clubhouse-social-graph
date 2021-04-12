import { NotionAPI } from 'notion-client'

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'

import { NotionPage } from 'components/NotionPage/NotionPage'

const notion = new NotionAPI()
const notionPageId = '26ae0a0a5d38415ea95dde833b8c3370'

export const getStaticProps = async () => {
  const recordMap = await notion.getPage(notionPageId)

  return {
    props: {
      recordMap
    },
    revalidate: 60
  }
}

export default NotionPage
