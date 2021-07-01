import React, { useContext } from 'react'
import { DashboardTile, Text } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import BrandContext from '../../context/Brand'
// State

import { useTabs } from '../../../../shared/providers'
import { StyledHome, StyledCardList, StyledHeader } from './styled'
import { CUSTOMERS_COUNT, COUPON_TOTAL, CAMPAIGN_TOTAL } from '../../graphql'

const Home = () => {
   const [context, setContext] = useContext(BrandContext)
   const { addTab } = useTabs()
   // const { t } = useTranslation()
   const { data: customersCount } = useSubscription(CUSTOMERS_COUNT, {
      variables: {
         brandId: context.brandId,
      },
   })
   const { data: couponTotal } = useSubscription(COUPON_TOTAL)
   const { data: campaignTotal } = useSubscription(CAMPAIGN_TOTAL)

   const [search, setSearch] = React.useState('')
   return (
      <StyledHome>
         <StyledHeader>
            <Text as="h1">Customer Relation Manager</Text>
         </StyledHeader>

         <StyledCardList>
            <DashboardTile
               title="Customers"
               count={customersCount?.customers_aggregate.aggregate.count || 0}
               onClick={() => addTab('Customers', '/crm/customers')}
            />
            <DashboardTile
               title="All Coupons"
               count={couponTotal?.couponsAggregate?.aggregate?.count || 0}
               onClick={() => addTab('Coupons', '/crm/coupons')}
            />
            <DashboardTile
               title="All Campaign"
               count={campaignTotal?.campaignsAggregate?.aggregate?.count || 0}
               onClick={() => addTab('Campaign', '/crm/campaign')}
            />
         </StyledCardList>
      </StyledHome>
   )
}

export default Home
