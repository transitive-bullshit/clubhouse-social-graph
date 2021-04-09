import React from 'react'
import { useRouter } from 'next/router'
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

import { fetchClubhouseAPI } from 'lib/fetch-clubhouse-api'
import { User } from 'state/user'

export const LoginModal: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const initialRef = React.useRef()
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [verificationCode, setVerificationCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [state, setState] = React.useState('/start_phone_number_auth')
  const [error, setError] = React.useState(null)
  const { updateUser } = User.useContainer()

  const onChangePhoneNumber = (event) => {
    setPhoneNumber(event.target.value)
  }
  const onChangeVerificationCode = (event) => {
    setVerificationCode(event.target.value)
  }

  const onKeyPressPhoneNumber = (event) => {
    if (event.charCode === 13) {
      onSubmitPhoneNumber()
    }
  }

  const onKeyPressVerificationCode = (event) => {
    if (event.charCode === 13) {
      onSubmitVerificationCode()
    }
  }

  const onSubmitPhoneNumber = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const res = await fetchClubhouseAPI({
      endpoint: '/start_phone_number_auth',
      method: 'POST',
      body: {
        phone_number: phoneNumber
      }
    })

    setIsLoading(false)
    if (res.success) {
      setError(null)
      setState('/complete_phone_number_auth')
    } else {
      setError(res.error)
    }
  }, [phoneNumber])

  const onSubmitVerificationCode = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const res = await fetchClubhouseAPI({
      endpoint: '/complete_phone_number_auth',
      method: 'POST',
      body: {
        phone_number: phoneNumber,
        verification_code: verificationCode
      }
    })

    setIsLoading(false)
    if (res.success) {
      setError(null)
      await updateUser().then((user) => {
        if (user) {
          router.push(`/${user.username}`)
        }
      })
      onClose()
    } else {
      setError(res.error)
    }
  }, [phoneNumber, verificationCode])

  return (
    <>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in to Clubhouse</ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={6}>
            {state === '/start_phone_number_auth' ? (
              <FormControl>
                <FormLabel>Enter your phone number</FormLabel>

                <Input
                  ref={initialRef}
                  placeholder='555-555-5555'
                  value={phoneNumber}
                  isRequired={true}
                  onChange={onChangePhoneNumber}
                  onKeyPress={onKeyPressPhoneNumber}
                />
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel>
                  Enter the code that Clubhouse just texted you
                </FormLabel>

                <Input
                  placeholder='----'
                  value={verificationCode}
                  isRequired={true}
                  onChange={onChangeVerificationCode}
                  onKeyPress={onKeyPressVerificationCode}
                />
              </FormControl>
            )}

            {error && <p>{error}</p>}
          </ModalBody>

          <ModalFooter display='flex' justifyContent='space-between'>
            <Button onClick={onClose}>Cancel</Button>

            {state === '/start_phone_number_auth' ? (
              <Button
                colorScheme='blue'
                onClick={onSubmitPhoneNumber}
                isLoading={isLoading}
                disabled={!phoneNumber}
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme='blue'
                onClick={onSubmitVerificationCode}
                isLoading={isLoading}
                disabled={!verificationCode}
              >
                Next
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
