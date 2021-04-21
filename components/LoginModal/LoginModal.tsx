import React from 'react'
import Link from 'next/link'
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

import styles from './styles.module.css'

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
  }, [phoneNumber, verificationCode, router, onClose, setError, updateUser])

  return (
    <>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log in to Clubhouse</ModalHeader>

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

                <p className={styles.details}>
                  We use the Clubhouse API to log you in. Clubhouse only allows
                  you to log in to a single device at a time, so you may be
                  temporarily logged out of your mobile account.
                </p>

                <p className={styles.details}>
                  This is necessary in order to view your profile and follower
                  data.{' '}
                  <i>Our use of the Clubhouse API is strictly read-only</i>.
                </p>

                <p className={styles.details}>
                  For more info on how this works, visit our{' '}
                  <Link href='/about'>
                    <a>about page</a>
                  </Link>
                  .
                </p>
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
