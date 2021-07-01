import React from 'react'
import { DashboardTile, Text, Flex } from '@dailykit/ui'

import { StyledHome, StyledCardList } from './styled'
import { Tooltip } from '../../../../shared/components'
import { useTabs } from '../../../../shared/providers'

export const Home = () => {
   const { addTab } = useTabs()

   return (
      <StyledHome>
         <Flex container alignItems="center">
            <Text as="h1">Subscription App</Text>
            <Tooltip identifier="app_subscription_heading" />
         </Flex>
         <StyledCardList>
            <DashboardTile
               title="Menu"
               count="0"
               conf=""
               onClick={() => addTab('Menu', '/subscription/menu')}
            />
            <DashboardTile
               title="Subscriptions"
               count="0"
               conf=""
               onClick={() =>
                  addTab('Subscriptions', '/subscription/subscriptions')
               }
            />
            <DashboardTile
               title="Add On Menu"
               count="0"
               conf=""
               onClick={() => addTab('Add On Menu', '/subscription/addon-menu')}
            />
         </StyledCardList>
      </StyledHome>
   )
}
