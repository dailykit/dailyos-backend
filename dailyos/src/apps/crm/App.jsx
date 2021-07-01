import React from 'react'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './views/tableStyle.css'

import Main from './sections/Main'
import Sidebar from './sections/Sidebar'
import BrandContext from './context/Brand'
import { useTabs } from '../../shared/providers'
import { ErrorBoundary } from '../../shared/components'

const App = () => {
   const [context, setContext] = React.useState({ brandId: 0, brandName: '' })
   const { addTab, setRoutes } = useTabs()

   React.useEffect(() => {
      setRoutes([
         {
            id: 1,
            title: 'Home',
            onClick: () => addTab('Home', '/crm'),
         },
         {
            id: 2,
            title: 'Customers',
            onClick: () => addTab('Customers', '/crm/customers'),
         },
         {
            id: 3,
            title: 'Coupons',
            onClick: () => addTab('Coupons', '/crm/coupons'),
         },
         {
            id: 4,
            title: 'Campaign',
            onClick: () => addTab('Campaign', '/crm/campaign'),
         },
      ])
   }, [])
   return (
      <ErrorBoundary rootRoute="/apps/crm">
         <BrandContext.Provider value={[context, setContext]}>
            <Sidebar />
            <Main />
         </BrandContext.Provider>
      </ErrorBoundary>
   )
}

export default App
