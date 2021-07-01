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
            onClick: () => addTab('Home', '/products'),
         },
         {
            id: 2,
            title: 'Products',
            onClick: () => addTab('Products', '/products/products'),
         },
         {
            id: 3,
            title: 'Recipes',
            onClick: () => addTab('Recipes', '/products/recipes'),
         },
         {
            id: 4,
            title: 'Ingredients',
            onClick: () => addTab('Ingredients', '/products/ingredients'),
         },
      ])
   }, [])
   return (
      <ErrorBoundary rootRoute="/apps/products">
         <Main />
      </ErrorBoundary>
   )
}

export default App
