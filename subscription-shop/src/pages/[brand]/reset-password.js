import React from 'react'

import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { SEO, Layout, Loader } from '../../components'
import { isClient } from '../../utils'
import { useMutation } from '@apollo/react-hooks'
import { RESET_PASSWORD, VERIFY_RESET_PASSWORD_TOKEN } from '../../graphql'
import { useConfig } from '../../lib'
import { useQueryParams } from '../../utils/useQueryParams'
import { useRouter } from 'next/router'

const ResetPassword = () => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { configOf } = useConfig()
   const params = { token: '' }

   const theme = configOf('theme-color', 'Visual')

   const [token, setToken] = React.useState(null)
   const [isVerified, setIsVerified] = React.useState(false)
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      password: '',
      confirmPassword: '',
   })

   const isValid = form.password && form.confirmPassword

   const [verifyResetPasswordToken, { loading: verifying }] = useMutation(
      VERIFY_RESET_PASSWORD_TOKEN,
      {
         onCompleted: data => {
            if (data.verifyResetPasswordToken.success) {
               setIsVerified(true)
            } else {
               addToast('Token expired or incorrect!', { appearance: 'error' })
               router.push('/login')
            }
         },
         onError: error => {
            addToast(error.message, { appearance: 'error' })
            router.push('/login')
         },
      }
   )

   const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
      onCompleted: () => {
         addToast('Password changed successfully!', { appearance: 'success' })
         router.push('/login')
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })

   React.useEffect(() => {
      if (params) {
         const token = params['token']
         if (token) {
            setToken(token)
         } else {
            router.push('/login')
         }
      }
   }, [params])

   React.useEffect(() => {
      if (token) {
         verifyResetPasswordToken({ variables: { token } })
      }
   }, [token])

   const onChange = e => {
      const { name, value } = e.target
      setForm(form => ({
         ...form,
         [name]: value.trim(),
      }))
   }

   const submit = async () => {
      try {
         setError('')
         if (form.password.length < 6) {
            return setError('Passwords should contain at least 6 characters!')
         }
         if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match!')
         }
         if (isClient) {
            resetPassword({
               variables: {
                  token,
                  password: form.password,
               },
            })
         }
      } catch (error) {
         if (error?.code === 401) {
            setError('Token or password is missing!')
         }
      }
   }

   if (verifying) return <Loader />
   return (
      <Layout>
         <SEO title="Login" />
         <Main tw="pt-8">
            <Title theme={theme}>Reset Password</Title>
            {isVerified ? (
               <Panel>
                  <FieldSet>
                     <Label htmlFor="email">Password</Label>
                     <Input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        placeholder="Enter new password"
                     />
                  </FieldSet>
                  <FieldSet>
                     <Label htmlFor="email">Confirm Password</Label>
                     <Input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={onChange}
                        placeholder="Confirm new password"
                     />
                  </FieldSet>
                  <Submit
                     className={!isValid || loading ? 'disabled' : ''}
                     onClick={() => isValid && submit()}
                  >
                     Change Password
                  </Submit>
                  {error && (
                     <span tw="self-start block text-red-500 mt-2">
                        {error}
                     </span>
                  )}
               </Panel>
            ) : (
               <span tw="self-start block text-red-500 mt-2 text-center">
                  Token not verified!
               </span>
            )}
         </Main>
      </Layout>
   )
}

export default ResetPassword

const Main = styled.main`
   margin: auto;
   overflow-y: auto;
   max-width: 1180px;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
   > section {
      width: 100%;
      max-width: 360px;
   }
`

const Panel = styled.section`
   ${tw`flex mx-auto justify-center items-center flex-col py-4`}
`

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`text-green-600 text-2xl text-center`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const FieldSet = styled.fieldset`
   ${tw`w-full flex flex-col mb-4`}
`

const Label = styled.label`
   ${tw`text-gray-600 mb-1`}
`

const Input = styled.input`
   ${tw`w-full block border h-10 rounded px-2 outline-none focus:border-2 focus:border-blue-400`}
`

const Submit = styled.button`
   ${tw`bg-green-500 rounded w-full h-10 text-white uppercase tracking-wider`}
   &.disabled {
      ${tw`cursor-not-allowed bg-gray-300 text-gray-700`}
   }
`
