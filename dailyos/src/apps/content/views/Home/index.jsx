import React, { useContext } from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   WEBSITE_TOTAL_PAGES,
   FOLD_AGGREGATE,
   MENU_AGGREGATE,
} from '../../graphql'
import BrandContext from '../../context/Brand'
import { StyledCardList, StyledHome } from './styled'
import { InlineLoader } from '../../../../shared/components'
import { logger } from '../../../../shared/utils'
import { useTabs } from '../../../../shared/providers'

export const Home = () => {
   const { addTab } = useTabs()
   const [context, setContext] = useContext(BrandContext)
   const { websiteId } = context

   // page count subscription
   const {
      data: {
         website_websitePage_aggregate: {
            aggregate: { count: pageCount = 0 } = {},
         } = {},
      } = {},
      loading: pageLoading,
      error: pageError,
   } = useSubscription(WEBSITE_TOTAL_PAGES, {
      variables: {
         websiteId,
      },
   })

   // fold count subscription
   const {
      data: {
         content_subscriptionDivIds_aggregate: {
            aggregate: { count: foldCount = 0 } = {},
         } = {},
      } = {},
      loading: foldLoading,
      error: foldError,
   } = useSubscription(FOLD_AGGREGATE, {})

   // menu count subscription
   const {
      data: {
         website_navigationMenu_aggregate: {
            aggregate: { count: menuCount = 0 } = {},
         } = {},
      } = {},
      loading: menuLoading,
      error: menuError,
   } = useSubscription(MENU_AGGREGATE, {})

   if (foldLoading || pageLoading || menuLoading) {
      return <InlineLoader />
   }
   if (foldError || pageError || menuError) {
      toast.error('Something Went Wrong!')
      logger(foldError || pageError || menuError)
   }

   return (
      <StyledHome>
         <h1>Content App</h1>
         <StyledCardList>
            <DashboardTile
               title="Pages"
               count={pageCount}
               onClick={() => addTab('Pages', '/content/pages')}
            />
            <DashboardTile
               title="Subscription"
               count={foldCount}
               onClick={() => addTab('Subscription', '/content/subscription')}
            />
            <DashboardTile
               title="Navbar Menu"
               count={menuCount}
               onClick={() => addTab('Navbar Menu', '/content/navbarMenu')}
            />
            <DashboardTile
               title="Settings"
               onClick={() => addTab('Settings', '/content/settings')}
            />
            <DashboardTile
               title="Blocks"
               onClick={() => addTab('Blocks', '/content/blocks')}
            />
         </StyledCardList>
      </StyledHome>
   )
}
