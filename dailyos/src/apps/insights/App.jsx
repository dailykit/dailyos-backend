import React from 'react'

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
            onClick: () => addTab('Home', '/insights'),
         },
         {
            id: 2,
            title: 'Recipe Insights',
            onClick: () => addTab('Recipe Insights', '/insights/recipe'),
         },
      ])
   }, [])
   return (
      <ErrorBoundary rootRoute="/apps/insights">
         <Main />
      </ErrorBoundary>
   )
}

export default App
