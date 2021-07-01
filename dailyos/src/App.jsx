import React from 'react'
import gql from 'graphql-tag'
import Loadable from 'react-loadable'
import { Loader, useTunnel } from '@dailykit/ui'
import styled from 'styled-components'
import { useSubscription } from '@apollo/react-hooks'
import { Switch, Route, Link, useLocation } from 'react-router-dom'
import FullOccurrenceReport from './shared/components/FullOccurrenceReport'
import { useTabs } from './shared/providers'
import { isKeycloakSupported } from './shared/utils'
import {
   TabBar,
   Lang,
   RedirectBanner,
   Sidebar,
   AddressTunnel,
} from './shared/components'

const APPS = gql`
   subscription apps {
      apps(order_by: { id: asc }) {
         id
         title
         icon
         route
      }
   }
`

const Safety = Loadable({
   loader: () => import('./apps/safety'),
   loading: Loader,
})
const Inventory = Loadable({
   loader: () => import('./apps/inventory'),
   loading: Loader,
})
const Products = Loadable({
   loader: () => import('./apps/products'),
   loading: Loader,
})
const Menu = Loadable({
   loader: () => import('./apps/menu'),
   loading: Loader,
})
const Settings = Loadable({
   loader: () => import('./apps/settings'),
   loading: Loader,
})

const Order = Loadable({
   loader: () => import('./apps/order'),
   loading: Loader,
})

const CRM = Loadable({
   loader: () => import('./apps/crm'),
   loading: Loader,
})

const Subscription = Loadable({
   loader: () => import('./apps/subscription'),
   loading: Loader,
})

const Insights = Loadable({
   loader: () => import('./apps/insights'),
   loading: Loader,
})

const Brands = Loadable({
   loader: () => import('./apps/brands'),
   loading: Loader,
})
const Content = Loadable({
   loader: () => import('./apps/content'),
   loading: Loader,
})
const Editor = Loadable({
   loader: () => import('./apps/editor'),
   loading: Loader,
})
const Carts = Loadable({
   loader: () => import('./apps/carts'),
   loading: Loader,
})

const App = () => {
   const location = useLocation()
   const { routes, setRoutes } = useTabs()
   const [open, toggle] = React.useState(false)
   const { loading, data: { apps = [] } = {} } = useSubscription(APPS)

   React.useEffect(() => {
      if (location.pathname === '/') {
         setRoutes([])
      }
   }, [location.pathname])

   if (loading) return <Loader />
   return (
      <Layout open={open}>
         <TabBar open={open} />
         <Sidebar open={open} toggle={toggle} links={routes} />
         <main>
            <Switch>
               <Route path="/" exact>
                  <AppList open={open}>
                     {apps.map(app => (
                        <AppItem key={app.id}>
                           <Link to={app.route}>
                              {app.icon && (
                                 <img src={app.icon} alt={app.title} />
                              )}
                              <span>{app.title}</span>
                           </Link>
                        </AppItem>
                     ))}
                  </AppList>
                  <FullOccurrenceReport />
               </Route>
               <Route path="/inventory" component={Inventory} />
               <Route path="/safety" component={Safety} />
               <Route path="/products" component={Products} />
               <Route path="/menu" component={Menu} />
               <Route path="/settings" component={Settings} />
               <Route path="/order" component={Order} />
               <Route path="/crm" component={CRM} />
               <Route path="/subscription" component={Subscription} />
               <Route path="/insights" component={Insights} />
               <Route path="/brands" component={Brands} />
               <Route path="/content" component={Content} />
               <Route path="/editor" component={Editor} />
               <Route path="/carts" component={Carts} />
            </Switch>
         </main>
         {/* {!isKeycloakSupported() && <RedirectBanner />} */}
         <Lang />
      </Layout>
   )
}

export default App

const AppList = styled.ul`
   display: grid;
   margin: 0 auto;
   grid-gap: 16px;
   max-width: 1180px;
   padding-top: 16px;
   width: ${({ open }) =>
      open ? `calc(100vw - 300px)` : `calc(100vw - 40px)`};
   grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`

const AppItem = styled.li`
   height: 48px;
   list-style: none;
   a {
      width: 100%;
      color: #2f256f;
      height: 100%;
      display: flex;
      padding: 0 14px;
      border-radius: 2px;
      align-items: center;
      border: 1px solid #e0e0e0;
      text-decoration: none;
      transition: 0.4s ease-in-out;
      :hover {
         background: #f8f8f8;
      }
      img {
         height: 32px;
         width: 32px;
         margin-right: 14px;
         display: inline-block;
      }
   }
`

const Layout = styled.div`
   display: grid;
   height: 100vh;
   overflow: hidden;
   grid-template-rows: 110px 1fr;
   grid-gap: ${({ open }) => (open ? '0 28px' : '0 20px')};
   grid-template-columns: ${({ open }) => (open ? '250px 1fr' : '48px 1fr')};
   grid-template-areas: ${({ open }) =>
      open ? "'aside head' 'aside main'" : "'aside head' 'main main'"};
   > header {
      grid-area: head;
   }
   > aside {
      grid-area: aside;
      display: ${({ open }) => (open ? 'flex' : 'none')};
   }
   > main {
      grid-area: main;
      overflow-y: auto;
   }
   @media only screen and (max-width: 767px) {
      grid-template-columns: ${({ open }) => (open ? '100vw' : '48px 1fr')};
   }
`
