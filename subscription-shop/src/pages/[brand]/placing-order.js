import React from 'react'
import moment from 'moment'
import tw, { styled, css } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { isClient } from '../../utils'
import { CART_STATUS } from '../../graphql'
import OrderInfo from '../../sections/OrderInfo'
import { Layout, SEO, Loader, HelperBar } from '../../components'
import { PlacedOrderIllo, CartIllo, PaymentIllo } from '../../assets/icons'

const PlacingOrder = () => {
   const { configOf } = useConfig()
   const { loading, data: { cart = {} } = {} } = useSubscription(CART_STATUS, {
      skip: !isClient,
      variables: {
         id: isClient ? new URLSearchParams(location.search).get('id') : '',
      },
   })

   const gotoMenu = () => {
      isClient && window.localStorage.removeItem('plan')
      if (isClient) {
         window.location.href = cart?.fulfillmentInfo?.slot?.from
            ? `${window.location.origin}/menu?d=${moment(
                 cart?.fulfillmentInfo?.slot?.from
              ).format('YYYY-MM-DD')}`
            : `${window.location.origin}/menu`
      }
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <Layout>
         <SEO title="Placing Order" />
         <Wrapper>
            <Main tw="pt-4">
               {loading ? (
                  <Loader inline />
               ) : (
                  <Content>
                     {cart && (
                        <>
                           <header tw="w-full my-3 pb-1 border-b flex items-center justify-between">
                              <SectionTitle theme={theme}>
                                 Order Summary
                              </SectionTitle>
                           </header>
                           <OrderInfo cart={cart} />
                           <Steps>
                              <Step
                                 className={`${
                                    cart.status !== 'CART_PENDING'
                                       ? 'active'
                                       : ''
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <CartIllo />
                                 </span>
                                 Saving Cart
                                 {cart.status === 'CART_PENDING' && <Pulse />}
                              </Step>
                              <Step
                                 className={`${
                                    cart.paymentStatus === 'SUCCEEDED'
                                       ? 'active'
                                       : ''
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <PaymentIllo />
                                 </span>
                                 Processing Payment
                                 {cart.paymentStatus !== 'SUCCEEDED' && (
                                    <Pulse />
                                 )}
                              </Step>
                              <Step
                                 className={`${
                                    cart.status === 'ORDER_PENDING' &&
                                    cart.orderId
                                       ? 'active'
                                       : 'null'
                                 }`}
                              >
                                 <span tw="border rounded-full mb-3 shadow-md">
                                    <PlacedOrderIllo />
                                 </span>
                                 Order Placed
                                 {cart.status !== 'ORDER_PENDING' ||
                                    (!Boolean(cart.orderId) && <Pulse />)}
                              </Step>
                           </Steps>
                           {cart.status === 'ORDER_PENDING' && cart.orderId && (
                              <HelperBar type="success" tw="mt-3">
                                 <HelperBar.Title>
                                    <span role="img" aria-label="celebrate">
                                       🎉
                                    </span>
                                    Congratulations!{' '}
                                 </HelperBar.Title>
                                 <HelperBar.SubTitle>
                                    Your order has been placed. Continue
                                    selecting menu for others weeks.
                                 </HelperBar.SubTitle>
                                 <HelperBar.Button onClick={gotoMenu}>
                                    Browse Menu
                                 </HelperBar.Button>
                              </HelperBar>
                           )}
                        </>
                     )}
                  </Content>
               )}
            </Main>
         </Wrapper>
      </Layout>
   )
}

export default PlacingOrder

const Pulse = () => (
   <span tw="mt-3 flex h-3 w-3 relative">
      <span tw="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
      <span tw="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
   </span>
)

const Wrapper = styled.div`
   ${tw`md:bg-gray-100`}
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-lg`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const Main = styled.main`
   margin: auto;
   max-width: 980px;
   background: #fff;
   padding-bottom: 24px;
   min-height: calc(100vh - 128px);
`

const Content = styled.section`
   margin: auto;
   max-width: 567px;
   width: calc(100% - 40px);
   ${tw`flex flex-col items-center`}
`

const Steps = styled.ul`
   ${tw`w-full flex items-start justify-between`}
`

const Step = styled.li`
   ${tw`flex flex-col items-center justify-center text-gray-600`}
   &.active {
      ${tw`text-green-600`}
   }
`
