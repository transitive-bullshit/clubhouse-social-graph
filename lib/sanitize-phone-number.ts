import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber'

export const sanitizePhoneNumber = (
  input: string,
  defaultCountry = 'US'
): string | null => {
  const phoneUtil = PhoneNumberUtil.getInstance()
  const number = phoneUtil.parseAndKeepRawInput(input, defaultCountry)

  if (!phoneUtil.isValidNumber(number)) {
    return null
  }

  return phoneUtil.format(number, PhoneNumberFormat.E164)
}
