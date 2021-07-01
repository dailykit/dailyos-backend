import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import '../../shared/styled/tableStyles.css'

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
            onClick: () => addTab('Home', '/inventory'),
         },
         {
            id: 2,
            title: 'Suppliers',
            onClick: () => addTab('Suppliers', '/inventory/suppliers'),
         },
         {
            id: 3,
            title: 'Supplier Items',
            onClick: () => addTab('Supplier Items', '/inventory/items'),
         },
         {
            id: 4,
            title: 'Work Orders',
            onClick: () => addTab('Work Orders', '/inventory/work-orders'),
         },
         {
            id: 5,
            title: 'Purchase Orders',
            onClick: () =>
               addTab('Purchase Orders', '/inventory/purchase-orders'),
         },
         {
            id: 6,
            title: 'Packagings',
            onClick: () => addTab('Packagings', '/inventory/packagings'),
         },
      ])
   }, [])
   return (
      <ErrorBoundary rootRoute="/apps/inventory">
         <Main />
      </ErrorBoundary>
   )
}

export default App
