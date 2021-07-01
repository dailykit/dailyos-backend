import React, { useContext } from 'react'
import { Tunnels, Tunnel, TunnelHeader } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { ALL_DATA } from '../../../../graphql'
import { PaymentCard } from '../../../../components'
import { TunnelHeaderContainer } from './styled'
import { logger } from '../../../../../../shared/utils'
import { Tooltip, InlineLoader } from '../../../../../../shared/components'
import { toast } from 'react-toastify'
import BrandContext from '../../../../context/Brand'

const TunnelVision = ({ id, tunnels, closeTunnel }) => {
   const [context, setContext] = useContext(BrandContext)
   const {
      loading: listLoading,
      data: { brand: { brand_customers: allCards = [] } = {} } = {},
   } = useQuery(ALL_DATA, {
      variables: {
         keycloakId: id,
         brandId: context.brandId,
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   if (listLoading) return <InlineLoader />
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1}>
            <TunnelHeader
               title={`Payment Cards(${
                  allCards[0]?.customer?.platform_customers[0]
                     ?.stripePaymentMethods?.length || 'N/A'
               })`}
               close={() => closeTunnel(1)}
               tooltip={
                  <Tooltip identifier="customer_paymentCard_list_tunnelHeader" />
               }
            />
            <TunnelHeaderContainer>
               {allCards[0]?.customer?.platform_customers[0]?.stripePaymentMethods?.map(
                  card => {
                     return (
                        <PaymentCard
                           key={card.stripePaymentMethodId}
                           cardData={card}
                           billingAddDisplay="none"
                           margin="16px 80px"
                        />
                     )
                  }
               )}
            </TunnelHeaderContainer>
         </Tunnel>
      </Tunnels>
   )
}

export default TunnelVision
