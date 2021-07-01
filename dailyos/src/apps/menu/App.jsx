import React from 'react'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './views/Listings/tableStyle.css'

import Main from './sections/Main'
import { useTabs } from '../../shared/providers'
import { ErrorBoundary } from '../../shared/components'

const App = () => {
   const { addTab, setRoutes } = useTabs()

   React.useEffect(() => {
      setRoutes([
         {
            id: 1,
            title: 'Home',
            onClick: () => addTab('Home', '/menu'),
         },
         {
            id: 2,
            title: 'Collections',
            onClick: () => addTab('Collections', '/menu/collections'),
         },
         {
            id: 3,
            title: 'Pre-Order Delivery',
            onClick: () =>
               addTab(
                  'Pre-Order Delivery',
                  '/menu/recurrences/PREORDER_DELIVERY'
               ),
         },
         {
            id: 4,
            title: 'Pre-Order Pickup',
            onClick: () =>
               addTab('Pre-Order Pickup', '/menu/recurrences/PREORDER_PICKUP'),
         },
         {
            id: 5,
            title: 'On-Demand Delivery',
            onClick: () =>
               addTab(
                  'On-Demand Delivery',
                  '/menu/recurrences/ONDEMAND_DELIVERY'
               ),
         },
         {
            id: 6,
            title: 'On-Demand Pickup',
            onClick: () =>
               addTab('On-Demand Pickup', '/menu/recurrences/ONDEMAND_PICKUP'),
         },
      ])
   }, [])
   return (
      <ErrorBoundary rootRoute="/apps/menu">
         <Main />
      </ErrorBoundary>
   )
}

export default App
