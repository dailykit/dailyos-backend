import React from 'react'
import { toast } from 'react-toastify'
import usePortal from 'react-useportal'
import { useMutation } from '@apollo/react-hooks'
import { Flex, TextButton, ComboButton, Popup, ButtonGroup } from '@dailykit/ui'

import { MUTATIONS } from '../../../graphql'
import { useOrder } from '../../../context'
import { CardIcon } from '../../../assets/icons'
import { logger } from '../../../../../shared/utils'
import { ResponsiveFlex, StyledText } from './styled'

export const Actions = ({ order }) => {
   const { dispatch } = useOrder()
   const { openPortal, closePortal, isOpen, Portal } = usePortal({
      bindTo: document && document.getElementById('popups'),
   })
   const [updateOrder] = useMutation(MUTATIONS.ORDER.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })
   return (
      <Flex
         as="aside"
         padding="0 14px"
         style={{
            borderLeft: '1px solid #ececec',
         }}
      >
         <StyledText as="h3">Actions</StyledText>
         <ResponsiveFlex container>
            <TextButton
               type="solid"
               disabled={order.isAccepted}
               size="sm"
               onClick={() =>
                  updateOrder({
                     variables: {
                        id: order.id,
                        _set: {
                           isAccepted: true,
                           ...(order.isRejected && { isRejected: false }),
                        },
                     },
                  })
               }
            >
               {order.isAccepted ? 'Accepted' : 'Accept'}
            </TextButton>
            <TextButton type="ghost" onClick={openPortal} size="sm">
               {order.isRejected ? 'Un Reject' : 'Reject'}
            </TextButton>
         </ResponsiveFlex>
         {!order.paymentId && (
            <ComboButton
               type="outline"
               size="sm"
               onClick={() =>
                  dispatch({ type: 'SET_CART_ID', payload: order.cart.id })
               }
            >
               <CardIcon />
               {order.cart.paymentStatus}
            </ComboButton>
         )}
         <Portal>
            <Popup show={isOpen}>
               <Popup.Text type="danger">
                  {order.thirdPartyOrderId
                     ? `${
                          order.isRejected ? 'Unrejecting' : 'Rejecting'
                       } a third party order would not ${
                          order.isRejected ? 'unreject' : 'reject'
                       } the order from said third party app. Are you sure you want to ${
                          order.isRejected ? 'unreject' : 'reject'
                       } this order?`
                     : `Are you sure you want to ${
                          order.isRejected ? 'unreject' : 'reject'
                       } this order?`}
               </Popup.Text>
               <Popup.Actions>
                  <ButtonGroup align="left">
                     <TextButton
                        type="solid"
                        onClick={e => {
                           closePortal(e)
                           updateOrder({
                              variables: {
                                 id: order.id,
                                 _set: {
                                    isRejected: !order.isRejected,
                                 },
                              },
                           })
                        }}
                     >
                        {order.isRejected ? 'Un Reject' : 'Reject'}
                     </TextButton>
                     <TextButton type="ghost" onClick={closePortal}>
                        Close
                     </TextButton>
                  </ButtonGroup>
               </Popup.Actions>
            </Popup>
         </Portal>
      </Flex>
   )
}
