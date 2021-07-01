import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'

import { BRANDS } from '../../graphql'
import { StyledCardList, StyledHome } from './styled'
import { useTabs } from '../../../../shared/providers'

export const Home = () => {
   const { addTab } = useTabs()
   const {
      loading: loadingBrands,
      data: { brandsAggregate = {} } = {},
   } = useSubscription(BRANDS.AGGREGATE)

   return (
      <StyledHome>
         <h1>Brands</h1>
         <StyledCardList>
            <DashboardTile
               title="Brands"
               conf="All available"
               count={
                  loadingBrands ? '...' : brandsAggregate?.aggregate?.count || 0
               }
               onClick={() => addTab('Brands', '/brands/brands')}
            />
         </StyledCardList>
      </StyledHome>
   )
}
