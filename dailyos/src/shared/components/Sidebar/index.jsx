import React from 'react'
import gql from 'graphql-tag'
import { Flex, IconButton } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import Styles from './styled'
import { InlineLoader } from '../InlineLoader'
import { RoundedMenuIcon, ToggleArrow } from '../../assets/icons'
import { PlusIcon } from '../../assets/icons'
import { RoundedCloseIcon, RectangularIcon } from '../../assets/icons'
import { useLocation } from 'react-router-dom'
import CreateNewItemPanel from './CreateNewItemPanel'
import { useAuth } from '../../providers/auth'

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

export const Sidebar = ({ links, toggle, open }) => {
   const { pathname } = useLocation()
   const { loading, data: { apps = [] } = {} } = useSubscription(APPS)
   const [isCreateNewOpen, setIsCreateNewOpen] = React.useState(false)
   const { user, logout } = useAuth()

   return (
      <>
         {open ? (
            <Styles.Sidebar>
               <Flex
                  flexDirection="column"
                  style={{ borderBottom: '1px solid #EBF1F4' }}
               >
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="space-between"
                     padding={
                        isCreateNewOpen
                           ? '18px 12px 0px 12px'
                           : '18px 12px 16px 12px'
                     }
                  >
                     <Flex
                        container
                        alignItems="center"
                        onClick={() => setIsCreateNewOpen(!isCreateNewOpen)}
                     >
                        <IconButton type="ghost" size="sm">
                           <ToggleArrow
                              size="8px"
                              color="#367BF5"
                              down={isCreateNewOpen}
                           />
                        </IconButton>
                        <IconButton type="ghost" size="sm">
                           <PlusIcon />
                        </IconButton>
                        <Styles.Heading>Create new</Styles.Heading>
                     </Flex>
                     <IconButton
                        type="ghost"
                        size="sm"
                        onClick={() => toggle(false)}
                     >
                        <RoundedCloseIcon />
                     </IconButton>
                  </Flex>
                  {isCreateNewOpen && <CreateNewItemPanel />}
               </Flex>

               {loading ? (
                  <InlineLoader />
               ) : (
                  apps.map(app => (
                     <Styles.AppItem key={app.id} to={app.route}>
                        <Flex container alignItems="center">
                           <IconButton type="ghost" size="sm">
                              <ToggleArrow
                                 down={pathname === app.route && links.length}
                              />
                           </IconButton>
                           {app.icon ? (
                              <Styles.AppIcon src={app.icon} />
                           ) : (
                              <RectangularIcon />
                           )}
                           <Styles.AppTitle>{app.title}</Styles.AppTitle>
                        </Flex>
                        <Styles.Pages>
                           {pathname === app.route &&
                              links?.map(({ id, title, onClick }) => (
                                 <Styles.PageItem onClick={onClick} key={id}>
                                    <RectangularIcon
                                       size="10px"
                                       color="#202020"
                                    />
                                    <span>{title}</span>
                                 </Styles.PageItem>
                              ))}
                        </Styles.Pages>
                     </Styles.AppItem>
                  ))
               )}
               <Styles.Logout type="button" onClick={logout}>
                  Sign Out
               </Styles.Logout>
            </Styles.Sidebar>
         ) : (
            <Styles.Menu
               title="Menu"
               type="button"
               onClick={() => toggle(open => !open)}
            >
               <RoundedMenuIcon />
            </Styles.Menu>
         )}
      </>
   )
}
