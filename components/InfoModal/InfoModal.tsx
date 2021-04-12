import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
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

export const InfoModal = () => {
  const { infoModal } = Viz.useContainer()
  const router = useRouter()

  return (
    <>
      <Modal
        isOpen={infoModal.isOpen}
        onClose={infoModal.onClose}
        autoFocus={false}
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Clubhouse Social Graph</ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={6}>TODO</ModalBody>

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
