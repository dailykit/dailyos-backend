import React from 'react'

import Main from './sections/Main'
import { ErrorBoundary } from '../../shared/components'
import { useTabs } from '../../shared/providers'

const App = () => {
   const { addTab, setRoutes } = useTabs()

   React.useEffect(() => {
      setRoutes([
         {
            id: 1,
            title: 'Home',
            onClick: () => addTab('Home', '/subscription'),
         },
         {
            id: 2,
            title: 'Menu',
            onClick: () => addTab('Menu', '/subscription/menu'),
         },
         {
            id: 3,
            title: 'Add On Menu',
            onClick: () => addTab('Add On Menu', '/subscription/addon-menu'),
         },
         {
            id: 4,
            title: 'Subscriptions',
            onClick: () =>
               addTab('Subscriptions', '/subscription/subscriptions'),
         },
      ])
   }, [])

   return (
      <ErrorBoundary rootRoute="/apps/subscription">
         <Main />
      </ErrorBoundary>
   )
}

export default App
