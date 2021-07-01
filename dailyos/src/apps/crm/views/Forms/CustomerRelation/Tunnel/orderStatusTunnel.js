import React, { useContext } from 'react'
import { Tunnels, Tunnel, TunnelHeader, Text } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { STATUS } from '../../../../graphql'
import { TunnelHeaderContainer, StyledDiv } from './styled'
import { logger } from '../../../../../../shared/utils'
import { Tooltip, InlineLoader } from '../../../../../../shared/components'
import { useTabs } from '../../../../../../shared/providers'
import BrandContext from '../../../../context/Brand'

const OrderStatus = ({ tunnels, closeTunnel }) => {
   const [context, setContext] = useContext(BrandContext)
   const { tab } = useTabs()
   const {
      loading: listLoading,
      data: { brand: { brand_Orders: statusData = [] } = {} } = {},
   } = useQuery(STATUS, {
      variables: {
         oid: tab.data.oid,
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
               title="Order Status"
               close={() => closeTunnel(1)}
               tooltip={
                  <Tooltip identifier="customer_order_status_tunnelHeader" />
               }
            />
            <TunnelHeaderContainer>
               <StyledDiv>
                  <Text as="h2">
                     {`Order Id: ${statusData[0]?.id || 'N/A'}`}
                  </Text>
               </StyledDiv>
               <StyledDiv>
                  <Text as="h2">
                     {`Status: ${statusData[0]?.cart?.status || 'N/A'}`}
                  </Text>
               </StyledDiv>
            </TunnelHeaderContainer>
         </Tunnel>
      </Tunnels>
   )
}

export default OrderStatus
