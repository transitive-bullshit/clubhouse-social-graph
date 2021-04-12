import React from 'react'
import Link from 'next/link'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'

import { Viz } from 'state/viz'

import styles from './styles.module.css'

export const InfoModal = () => {
  const { infoModal } = Viz.useContainer()

  return (
    <>
      <Modal
        isOpen={infoModal.isOpen}
        onClose={infoModal.onClose}
        autoFocus={false}
        isCentered={true}
        size='xl'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Clubhouse Social Graph</ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={6} className={styles.body}>
            <p>
              This is a fun little experiment to explore the Clubhouse social
              graph — made with 💕 by{' '}
              <a
                href='https://twitter.com/transitive_bs'
                title='Twitter @transitive_bs'
                target='_blank'
                rel='noopener noreferrer'
              >
                Travis Fischer
              </a>{' '}
              and{' '}
              <a
                href='https://twitter.com/timsaval'
                title='Twitter @timsaval'
                target='_blank'
                rel='noopener noreferrer'
              >
                Tim Saval
              </a>
              .
            </p>

            <p>
              It makes it easy to view any Clubhouse user's followers,
              following, and invite chain.
            </p>

            <p>
              <b>
                Click a user to view their info. Click the user again to expand
                their node.
              </b>
            </p>

            <p>
              The graph gets really interesting once you have multiple nodes
              expanded, which allows you to visualize the users that different
              people have in common.
            </p>

            <p>
              Use two-finger pinch or the scroll-wheel to zoom in &amp; out.
              Click and drag on a user to move them around. Click and drag on
              the background to pan the graph.
            </p>

            <p>
              For more info, including a breakdown of how this was built, check
              out the{' '}
              <Link href='/about'>
                <a>about page</a>
              </Link>
              .
            </p>
          </ModalBody>

          <ModalFooter display='flex' justifyContent='space-between'>
            <Button onClick={infoModal.onClose}>Close</Button>

            <Link href='/about'>
              <Button colorScheme='blue'>About</Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
