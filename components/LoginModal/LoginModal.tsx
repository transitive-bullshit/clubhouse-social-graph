import React from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'

export const LoginModal: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  const initialRef = React.useRef()

  return (
    <>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in to Clubhouse</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Enter your phone number</FormLabel>
              <Input ref={initialRef} placeholder='+15555555555' />
            </FormControl>
          </ModalBody>

          <ModalFooter display='flex' justifyContent='space-between'>
            <Button onClick={onClose}>Cancel</Button>

            <Button colorScheme='blue'>Next</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
