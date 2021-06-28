import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useMutation } from '@apollo/react-hooks'

import Billing from './billing'
import Products from './products'
import { useMenu } from '../state'
import OrderInfo from '../../OrderInfo'
import Fulfillment from './fulfillment'
import PaymentCard from './PaymentCard'
import { useConfig } from '../../../lib'
import { useUser } from '../../../context'
import { isClient } from '../../../utils'
import { Button } from '../../../components'
import { CloseIcon } from '../../../assets/icons'
import { UPDATE_BRAND_CUSTOMER } from '../../../graphql'

export const CartPanel = ({ noSkip, isCheckout }) => {
   const router = useRouter()
   const { user } = useUser()
   const { state } = useMenu()
   const { configOf } = useConfig()
   const [updateBrandCustomer] = useMutation(UPDATE_BRAND_CUSTOMER, {
      skip: !isCheckout || !user?.brandCustomerId,
      onError: error => {
         console.log('UPDATE BRAND CUSTOMER -> ERROR -> ', error)
      },
   })
   const [isCartPanelOpen, setIsCartPanelOpen] = React.useState(false)

   const onSubmit = async () => {
      try {
         if (isCheckout) {
            await updateBrandCustomer({
               variables: {
                  id: user?.brandCustomerId,
                  _set: { subscriptionOnboardStatus: 'CHECKOUT' },
               },
            })

            const skipList = new URL(location.href).searchParams.get('previous')
            if (skipList && skipList.split(',').length > 0) {
               isClient && localStorage.setItem('skipList', skipList.split(','))
            }
         }
         router.push(
            `/get-started/checkout/?id=${state.occurenceCustomer?.cart?.id}`
         )
      } catch (error) {
         console.log('SKIP CARTS -> ERROR -> ', error)
      }
   }

   const theme = configOf('theme-color', 'Visual')
   if (['ORDER_PENDING'].includes(state?.occurenceCustomer?.cart?.status))
      return (
         <>
            <CartBar setIsCartPanelOpen={setIsCartPanelOpen} />
            <Styles.Wrapper isCartPanelOpen={isCartPanelOpen}>
               <header tw="md:hidden flex items-center justify-between">
                  <h1 tw="text-green-600 text-2xl tracking-wide">
                     Cart Summary
                  </h1>
                  <button
                     tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center"
                     onClick={() => setIsCartPanelOpen(false)}
                  >
                     <CloseIcon size={16} tw="stroke-current text-green-400" />
                  </button>
               </header>
               <OrderInfo
                  cart={state.occurenceCustomer?.cart}
                  showViewOrderButton
               />
            </Styles.Wrapper>
         </>
      )
   return (
      <>
         <CartBar setIsCartPanelOpen={setIsCartPanelOpen} />
         <Styles.Wrapper isCartPanelOpen={isCartPanelOpen}>
            <header tw="md:hidden flex items-center justify-between">
               <h1 tw="text-green-600 text-2xl tracking-wide">Cart Summary</h1>
               <button
                  tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center"
                  onClick={() => setIsCartPanelOpen(false)}
               >
                  <CloseIcon size={16} tw="stroke-current text-green-400" />
               </button>
            </header>
            {/* Products */}
            <Products noSkip={noSkip} isCheckout={isCheckout} />
            {/* Fulfilment Mode */}
            <Fulfillment />
            {/* Payment */}
            <PaymentCard />
            {/* Billing Details */}
            <Billing isCheckout={isCheckout} />
            {/* Checkout */}
            {isCheckout && (
               <Button
                  tw="w-full"
                  bg={theme?.accent}
                  onClick={onSubmit}
                  disabled={
                     !state?.week?.isValid ||
                     !state?.occurenceCustomer?.validStatus?.itemCountValid
                  }
               >
                  PROCEED TO CHECKOUT
               </Button>
            )}
         </Styles.Wrapper>
      </>
   )
}

const CartBar = ({ setIsCartPanelOpen }) => {
   const { state } = useMenu()
   const { user } = useUser()
   return (
      <Styles.CartBar onClick={() => setIsCartPanelOpen(true)}>
         <section>
            <h4 tw="text-base text-gray-700">
               Cart {state?.occurenceCustomer?.validStatus?.addedProductsCount}/
               {user?.subscription?.recipes?.count}
            </h4>
            <h4 tw="text-blue-700 pt-2">
               View full summary <span>&#8657;</span>
            </h4>
         </section>
         <section tw="sm:hidden md:block">
            {state.cartState === 'SAVING' && (
               <span tw="text-sm bg-blue-200 text-blue-700  rounded-full px-3 font-medium">
                  SAVING
               </span>
            )}
            {state.cartState === 'SAVED' && (
               <span tw="text-sm bg-green-200 text-green-700 rounded-full px-3 font-medium">
                  SAVED
               </span>
            )}
         </section>
      </Styles.CartBar>
   )
}

const Styles = {
   Wrapper: styled.div`
      @media (max-width: 786px) {
         position: fixed;
         background-color: #ffff;
         padding: 1rem 1rem 72px 1rem;
         z-index: 1020;
         overflow: scroll;
         ${tw`inset-0`}
         ${({ isCartPanelOpen }) =>
            isCartPanelOpen
               ? css`
                    top: 100%;
                    display: block;
                    animation: slide 0.5s forwards;
                    @keyframes slide {
                       100% {
                          top: 0;
                       }
                    }
                 `
               : css`
                    display: none;
                 `}
      }
   `,
   CartBar: styled.section`
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
      ${tw`flex items-center justify-between z-10 p-2 md:hidden h-20 fixed bottom-0 right-0 left-0 bg-white border-t`}
   `,
}
