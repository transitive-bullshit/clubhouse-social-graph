import { NotionAPI } from 'notion-client'

import { NotionPage } from 'components/NotionPage/NotionPage'

const notion = new NotionAPI()
const notionPageId = '66e39661ff464288bba1b71f561baa52'

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
