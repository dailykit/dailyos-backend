import React from 'react'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './views/Listings/tableStyle.css'

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
            onClick: () => addTab('Home', '/settings'),
         },
         {
            id: 2,
            title: 'Users',
            onClick: () => addTab('Users', '/settings/users'),
         },
         {
            id: 3,
            title: 'Roles',
            onClick: () => addTab('Roles', '/settings/roles'),
         },
         {
            id: 4,
            title: 'Devices',
            onClick: () => addTab('Devices', '/settings/devices'),
         },
         {
            id: 5,
            title: 'Stations',
            onClick: () => addTab('Stations', '/settings/stations'),
         },
         {
            id: 6,
            title: 'Master Lists',
            onClick: () => addTab('Master Lists', '/settings/master-lists'),
         },
         {
            id: 7,
            title: 'Apps',
            onClick: () => addTab('Apps', '/settings/apps'),
         },
      ])
   }, [])

   return (
      <ErrorBoundary rootRoute="/apps/settings">
         <Main />
      </ErrorBoundary>
   )
}

export default App
