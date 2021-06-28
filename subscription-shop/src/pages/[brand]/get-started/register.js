import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import Link from 'next/link'
import jwtDecode from 'jwt-decode'
import tw, { styled } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { useUser } from '../../../context'
import { useConfig, auth } from '../../../lib'
import { getSettings, isClient, processUser } from '../../../utils'
import { SEO, Layout, StepsNavbar } from '../../../components'
import { BRAND, CUSTOMER, MUTATIONS } from '../../../graphql'
import {
   deleteStoredReferralCode,
   getStoredReferralCode,
   isReferralCodeValid,
   setStoredReferralCode,
} from '../../../utils/referrals'

export default props => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { user, dispatch } = useUser()
   const { brand, organization } = useConfig()
   const [current, setCurrent] = React.useState('REGISTER')
   const { settings } = props
   const [create_brand_customer] = useMutation(BRAND.CUSTOMER.CREATE, {
      refetchQueries: ['customer'],
      onCompleted: () => {
         if (isClient) {
            window.location.href =
               window.location.origin + '/get-started/select-plan'
         }
      },
      onError: error => {
         console.log(error)
      },
   })
   const [applyReferralCode] = useMutation(MUTATIONS.CUSTOMER_REFERRAL.UPDATE, {
      onCompleted: () => {
         addToast('Referral code applied!', { appearance: 'success' })
         deleteStoredReferralCode()
      },
      onError: error => {
         console.log(error)
         addToast('Referral code not applied!', { appearance: 'error' })
      },
   })
   const [create, { loading: creatingCustomer }] = useMutation(
      MUTATIONS.CUSTOMER.CREATE,
      {
         refetchQueries: ['customer'],
         onCompleted: async ({ createCustomer }) => {
            if (!isEmpty(createCustomer)) {
               const user = await processUser(
                  createCustomer,
                  organization?.stripeAccountType
               )
               const storedCode = getStoredReferralCode(null)
               if (storedCode) {
                  await applyReferralCode({
                     variables: {
                        brandId: brand.id,
                        keycloakId: user.keycloakId,
                        _set: {
                           referredByCode: storedCode,
                        },
                     },
                  })
               }
               dispatch({ type: 'SET_USER', payload: user })
            }
            if (isClient) {
               window.location.href =
                  window.location.origin + '/get-started/select-plan'
            }
         },
         onError: () =>
            addToast('Something went wrong!', {
               appearance: 'error',
            }),
      }
   )
   const [customer, { loading: loadingCustomerDetails }] = useLazyQuery(
      CUSTOMER.DETAILS,
      {
         onCompleted: async ({ customer = {} }) => {
            const { email = '', sub: keycloakId = '' } = jwtDecode(
               localStorage.getItem('token')
            )
            if (isEmpty(customer)) {
               console.log('CUSTOMER DOESNT EXISTS')
               create({
                  variables: {
                     object: {
                        email,
                        keycloakId,
                        source: 'subscription',
                        sourceBrandId: brand.id,
                        clientId: isClient && window._env_.CLIENTID,
                        brandCustomers: {
                           data: {
                              brandId: brand.id,
                              subscriptionOnboardStatus: 'SELECT_DELIVERY',
                           },
                        },
                     },
                  },
               })
               return
            }
            console.log('CUSTOMER EXISTS')

            const user = await processUser(
               customer,
               organization?.stripeAccountType
            )
            dispatch({ type: 'SET_USER', payload: user })

            const { brandCustomers = {} } = customer
            if (isEmpty(brandCustomers)) {
               console.log('BRAND_CUSTOMER DOESNT EXISTS')
               create_brand_customer({
                  variables: {
                     object: {
                        keycloakId,
                        brandId: brand.id,
                        subscriptionOnboardStatus: 'SELECT_DELIVERY',
                     },
                  },
               })
            } else if (
               customer.isSubscriber &&
               brandCustomers[0].isSubscriber
            ) {
               console.log('BRAND_CUSTOMER EXISTS & CUSTOMER IS SUBSCRIBED')
               router.push('/menu')
               isClient && localStorage.removeItem('plan')
            } else {
               console.log('CUSTOMER ISNT SUBSCRIBED')
               if (isClient) {
                  window.location.href =
                     window.location.origin + '/get-started/select-plan'
               }
            }
         },
      }
   )

   React.useEffect(() => {
      if (user?.keycloakId) {
         if (user?.isSubscriber) router.push('/menu')
         else if (isClient) {
            window.location.href =
               window.location.origin + '/get-started/select-plan'
         }
      }
   }, [user])

   return (
      <Layout settings={settings}>
         <SEO title="Register" />
         <StepsNavbar />
         <Main tw="pt-8">
            <TabList>
               <Tab
                  className={current === 'LOGIN' ? 'active' : ''}
                  onClick={() => setCurrent('LOGIN')}
               >
                  Login
               </Tab>
               <Tab
                  className={current === 'REGISTER' ? 'active' : ''}
                  onClick={() => setCurrent('REGISTER')}
               >
                  Register
               </Tab>
            </TabList>
            {current === 'LOGIN' && (
               <LoginPanel
                  customer={customer}
                  loading={loadingCustomerDetails || creatingCustomer}
               />
            )}
            {current === 'REGISTER' && (
               <RegisterPanel
                  customer={customer}
                  setCurrent={setCurrent}
                  loading={loadingCustomerDetails || creatingCustomer}
               />
            )}
         </Main>
      </Layout>
   )
}

const LoginPanel = ({ loading, customer }) => {
   const { brand } = useConfig()
   const [error, setError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
      password: '',
   })

   const isValid = form.email && form.password

   const onChange = e => {
      const { name, value } = e.target
      setForm(form => ({
         ...form,
         [name]: value,
      }))
   }

   const submit = async () => {
      try {
         setError('')
         const token = await auth.login({
            email: form.email,
            password: form.password,
         })
         if (token?.sub) {
            customer({
               variables: {
                  keycloakId: token?.sub,
                  brandId: brand.id,
               },
            })
         } else {
            setError('Failed to login, please try again!')
         }
      } catch (error) {
         if (error?.code === 401) {
            setError('Email or password is incorrect!')
         }
      }
   }

   return (
      <Panel>
         <FieldSet>
            <Label htmlFor="email">Email*</Label>
            <Input
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
            />
         </FieldSet>
         <FieldSet>
            <Label htmlFor="password">Password*</Label>
            <Input
               name="password"
               type="password"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
            />
         </FieldSet>
         <button
            tw="self-start mb-2 text-blue-500"
            onClick={() => router.push('/forgot-password')}
         >
            Forgot password?
         </button>
         <Submit
            className={!isValid || loading ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Logging in...' : 'Login'}
         </Submit>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
}

function validateEmail(email) {
   const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
   return re.test(email)
}

const RegisterPanel = ({ loading, customer, setCurrent }) => {
   const { brand } = useConfig()
   const [hasAccepted, setHasAccepted] = React.useState(false)
   const [isReferralFieldVisible, setIsReferralFieldVisible] =
      React.useState(false)
   const [error, setError] = React.useState('')
   const [emailError, setEmailError] = React.useState('')
   const [passwordError, setPasswordError] = React.useState('')
   const [phoneError, setPhoneError] = React.useState('')
   const [form, setForm] = React.useState({
      email: '',
      password: '',
      phone: '',
      code: '',
   })

   const isValid =
      validateEmail(form.email) &&
      form.password &&
      form.password.length >= 6 &&
      form.phone &&
      form.phone.length > 0

   React.useEffect(() => {
      const storedReferralCode = getStoredReferralCode('')
      if (storedReferralCode) {
         setForm({ ...form, code: storedReferralCode })
         setIsReferralFieldVisible(true)
      }
   }, [])

   const onChange = e => {
      const { name, value } = e.target
      if (name === 'email' && validateEmail(value) && emailError) {
         setEmailError('')
      }
      if (name === 'password' && value.length >= 6 && passwordError) {
         setPasswordError('')
      }
      if (name === 'phone' && value.length > 0 && phoneError) {
         setPhoneError('')
      }
      setForm(form => ({
         ...form,
         [name]: value.trim(),
      }))
   }

   const submit = async () => {
      try {
         setError('')
         const isCodeValid = await isReferralCodeValid(
            brand.id,
            form.code,
            true
         )
         if (!isCodeValid) {
            deleteStoredReferralCode()
            return setError('Referral code is not valid!')
         }
         if (form.code) {
            setStoredReferralCode(form.code)
         }
         const result = await auth.register({
            email: form.email,
            password: form.password,
         })
         if (result?.success) {
            const token = await auth.login({
               email: form.email,
               password: form.password,
            })
            if (token?.sub) {
               isClient && localStorage.setItem('phone', form.phone)
               customer({
                  variables: {
                     keycloakId: token?.sub,
                     brandId: brand.id,
                  },
               })
            }
         }
      } catch (error) {
         console.log(error)
         if (error.includes('exists')) {
            return setError('Email is already in use!')
         }
         setError('Failed to register, please try again!')
      }
   }

   return (
      <Panel>
         <FieldSet css={[emailError && tw`mb-1`]}>
            <Label htmlFor="email">Email*</Label>
            <Input
               type="email"
               name="email"
               value={form.email}
               onChange={onChange}
               placeholder="Enter your email"
               onBlur={e =>
                  validateEmail(e.target.value)
                     ? setEmailError('')
                     : setEmailError('Must be a valid email!')
               }
            />
         </FieldSet>
         {emailError && (
            <span tw="self-start block text-red-500 mb-2">{emailError}</span>
         )}
         <FieldSet css={[passwordError && tw`mb-1`]}>
            <Label htmlFor="password">Password*</Label>
            <Input
               name="password"
               type="password"
               onChange={onChange}
               value={form.password}
               placeholder="Enter your password"
               onBlur={e =>
                  e.target.value.length < 6
                     ? setPasswordError(
                          'Password must be atleast 6 letters long!'
                       )
                     : setPasswordError('')
               }
            />
         </FieldSet>
         {passwordError && (
            <span tw="self-start block text-red-500 mb-2">{passwordError}</span>
         )}
         <FieldSet css={[phoneError && tw`mb-1`]}>
            <Label htmlFor="phone">Phone Number*</Label>
            <Input
               type="text"
               name="phone"
               value={form.phone}
               onChange={onChange}
               placeholder="Eg. 9879879876"
               onBlur={e =>
                  e.target.value.length === 0
                     ? setPhoneError('Must be a valid phone number!')
                     : setPhoneError('')
               }
            />
         </FieldSet>
         {phoneError && (
            <span tw="self-start block text-red-500 mb-2">{phoneError}</span>
         )}
         {isReferralFieldVisible ? (
            <FieldSet>
               <Label htmlFor="code">Referral Code</Label>
               <Input
                  name="code"
                  type="text"
                  onChange={onChange}
                  value={form.code}
                  placeholder="Enter referral code"
               />
            </FieldSet>
         ) : (
            <button
               tw="self-start mb-1 text-blue-500"
               onClick={() => setIsReferralFieldVisible(true)}
            >
               Got a referral code?
            </button>
         )}
         <section tw="self-start mt-2 mb-3">
            <input
               tw="mr-2"
               type="checkbox"
               name="terms&conditions"
               id="terms&conditions"
               onChange={() => setHasAccepted(!hasAccepted)}
            />
            <label htmlFor="terms&conditions" tw="text-gray-600">
               I accept{' '}
               <Link href="/terms-and-conditions">
                  <span tw="text-blue-500">terms and conditions.</span>
               </Link>
            </label>
         </section>
         <Submit
            className={!hasAccepted || !isValid || loading ? 'disabled' : ''}
            onClick={() => isValid && submit()}
         >
            {loading ? 'Registering' : 'Register'}
         </Submit>
         <button
            tw="self-start mt-2 text-blue-500"
            onClick={() => setCurrent('LOGIN')}
         >
            Login instead?
         </button>
         {error && <span tw="self-start block text-red-500 mt-2">{error}</span>}
      </Panel>
   )
}

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

const TabList = styled.ul`
   ${tw`border-b flex justify-center space-x-3`}
`

const Tab = styled.button`
   ${tw`h-8 px-3`}
   &.active {
      ${tw`border-b border-green-500 border-b-2`}
   }
`

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
export const getStaticProps = async () => {
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/get-started/register')
   return {
      props: { seo, settings },
      revalidate: 60,
   }
}

export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
