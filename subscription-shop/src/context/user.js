import 'twin.macro'
import React from 'react'
import { isEmpty } from 'lodash'
import jwtDecode from 'jwt-decode'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { useRouter } from 'next/router'

import { useConfig } from '../lib'
import {
   BRAND_CUSTOMER,
   CUSTOMER,
   CUSTOMER_REFERRALS,
   LOYALTY_POINTS,
   UPDATE_BRAND_CUSTOMER,
   UPDATE_DAILYKEY_CUSTOMER,
   WALLETS,
} from '../graphql'
import { PageLoader } from '../components'
import { isClient, processUser } from '../utils'

const UserContext = React.createContext()

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_USER': {
         return {
            ...state,
            isAuthenticated: true,
            user: { ...state.user, ...payload },
         }
      }
      case 'CLEAR_USER':
         return {
            ...state,
            isAuthenticated: false,
            user: {
               isDemo: false,
               keycloakId: '',
               subscriptionOnboardStatus: 'REGISTER',
            },
         }
   }
}

export const UserProvider = ({ children }) => {
   const router = useRouter()
   const { brand, organization } = useConfig()
   const [isLoading, setIsLoading] = React.useState(true)
   const [keycloakId, setKeycloakId] = React.useState('')
   const [updatePlatformCustomer] = useMutation(UPDATE_DAILYKEY_CUSTOMER, {
      onCompleted: () => {
         isClient && localStorage.removeItem('phone')
      },
      onError: error =>
         console.log('updatePlatformCustomer => error => ', error),
   })
   const [updateBrandCustomer] = useMutation(UPDATE_BRAND_CUSTOMER, {
      onError: error => console.log('updateBrandCustomer => error => ', error),
   })
   const [state, dispatch] = React.useReducer(reducers, {
      isAuthenticated: false,
      user: {
         isDemo: false,
         keycloakId: '',
         subscriptionOnboardStatus: 'REGISTER',
      },
   })
   const { error } = useSubscription(BRAND_CUSTOMER, {
      skip: !state?.user?.brandCustomerId,
      variables: { id: state?.user?.brandCustomerId },
      onSubscriptionData: ({
         subscriptionData: { data: { brandCustomer = {} } = {} } = {},
      }) => {
         console.log('Sub worked...')
         console.log({ brandCustomer })
         if (isEmpty(brandCustomer)) return
         dispatch({
            type: 'SET_USER',
            payload: {
               subscriptionOnboardStatus:
                  brandCustomer.subscriptionOnboardStatus,
            },
         })
      },
   })

   if (error) {
      console.log('Subscription error:', error)
   }

   const { loading, data: { customer = {} } = {} } = useQuery(
      CUSTOMER.DETAILS,
      {
         skip: !keycloakId || !brand.id,
         fetchPolicy: 'network-only',
         variables: {
            keycloakId,
            brandId: brand.id,
         },
         onError: () => {
            setIsLoading(false)
         },
      }
   )

   useSubscription(LOYALTY_POINTS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { loyaltyPoints } = data.subscriptionData.data
         if (loyaltyPoints?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { loyaltyPoint: loyaltyPoints[0] },
            })
         }
      },
   })

   useSubscription(WALLETS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { wallets } = data.subscriptionData.data
         if (wallets?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { wallet: wallets[0] },
            })
         }
      },
   })

   useSubscription(CUSTOMER_REFERRALS, {
      skip: !(brand.id && state.user?.keycloakId),
      variables: {
         brandId: brand.id,
         keycloakId: state.user?.keycloakId,
      },
      onSubscriptionData: data => {
         const { customerReferrals } = data.subscriptionData.data
         if (customerReferrals?.length) {
            dispatch({
               type: 'SET_USER',
               payload: { customerReferral: customerReferrals[0] },
            })
         }
      },
   })

   const sendBackToSourceRoute = () => {
      const redirectRoute = localStorage.getItem('source-route')
      if (redirectRoute) {
         localStorage.removeItem('source-route')
         router.push(redirectRoute)
      }
   }

   React.useEffect(() => {
      if (isClient) {
         const token = localStorage.getItem('token')
         if (token) {
            const user = jwtDecode(token)
            setKeycloakId(user?.sub)
            dispatch({ type: 'SET_USER', payload: { keycloakId: user?.sub } })
            sendBackToSourceRoute()
         } else {
            dispatch({ type: 'CLEAR_USER' })
         }
      }
   }, [])

   React.useEffect(() => {
      if (!loading) {
         console.log('Big useEffect')
         if (customer?.id && organization?.id) {
            const user = processUser(customer, organization?.stripeAccountType)

            console.log('Big useEffect inner ')

            const hasPhone = Boolean(user?.platform_customer?.phoneNumber)
            const phone = isClient && localStorage.getItem('phone')
            if (user?.keycloakId && !hasPhone && phone && phone.length > 0) {
               updatePlatformCustomer({
                  variables: {
                     keycloakId: user?.keycloakId,
                     _set: { phoneNumber: phone },
                  },
               })
            }

            if (Array.isArray(user?.carts) && user?.carts?.length > 0) {
               const index = user.carts.findIndex(
                  node => node.paymentStatus === 'SUCCEEDED'
               )
               if (index !== -1) {
                  updateBrandCustomer({
                     skip: !user?.brandCustomerId,
                     variables: {
                        id: user?.brandCustomerId,
                        _set: { subscriptionOnboardStatus: 'ONBOARDED' },
                     },
                  })
               }
            }

            dispatch({ type: 'SET_USER', payload: user })
            sendBackToSourceRoute()
            setIsLoading(false)
         }
      }
      setIsLoading(false)
   }, [loading, customer, organization])

   return (
      <UserContext.Provider
         value={{
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            dispatch,
            isLoading,
         }}
      >
         {children}
      </UserContext.Provider>
   )
}

export const useUser = () => React.useContext(UserContext)
