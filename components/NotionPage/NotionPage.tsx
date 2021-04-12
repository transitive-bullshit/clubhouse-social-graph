import React from 'react'
import { ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'

import { Layout } from 'components'

import styles from './styles.module.css'

export function NotionPage({ recordMap }: { recordMap: ExtendedRecordMap }) {
  return (
    <Layout full>
      <section className={styles.notionSection}>
        <NotionRenderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={false}
        />
      </section>
    </Layout>
  )
}
