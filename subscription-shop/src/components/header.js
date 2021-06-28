import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'

import { useUser } from '../context'
import { isClient, getInitials } from '../utils'
import MenuIcon from '../assets/icons/Menu'

import { ProfileSidebar } from './profile_sidebar'
import { CrossIcon } from '../assets/icons'
import { Loader } from './loader'
import NavigationBar from './navbar'

export const Header = ({ settings, navigationMenus }) => {
   const router = useRouter()
   const { isAuthenticated, user, isLoading } = useUser()

   // const isAuthenticated = false
   // const user = {}
   // const isLoading = false

   const logout = () => {
      isClient && localStorage.removeItem('token')
      if (isClient) {
         window.location.href = window.location.origin + '/subscription'
      }
   }

   const brand = settings['brand']['theme-brand']
   const theme = settings['Visual']['theme-color']

   const [toggle, setToggle] = React.useState(true)
   const [isMobileNavVisible, setIsMobileNavVisible] = React.useState(false)

   console.log('this is route name', router)

   const newNavigationMenus = DataWithChildNodes(navigationMenus)

   return (
      <>
         <Wrapper>
            <Link
               href="/"
               // title={brand?.name || 'Subscription Shop'}
            >
               <Brand>
                  {brand?.logo?.logoMark && (
                     <img
                        tw="h-auto md:h-12"
                        src={brand?.logo?.logoMark}
                        alt={brand?.name || 'Subscription Shop'}
                     />
                  )}
                  {brand?.name && <span tw="ml-2">{brand?.name}</span>}
               </Brand>
            </Link>
            <section tw="flex items-center justify-between">
               <NavigationBar Data={newNavigationMenus} />
               <ul tw="ml-auto px-4 flex space-x-4">
                  {isLoading ? (
                     <li>
                        <Loader inline={true} />
                     </li>
                  ) : isAuthenticated && user?.isSubscriber ? (
                     <li tw="text-gray-800 hidden hidden md:inline-block">
                        <Link href="/menu">Select Menu</Link>
                     </li>
                  ) : (
                     <li tw="text-gray-800 hidden md:inline-block">
                        <Link href="/our-menu">Our Menu</Link>
                     </li>
                  )}
                  {!user?.isSubscriber && (
                     <li tw="hidden md:inline-block">
                        <Link href="/our-plans">Get Started</Link>
                     </li>
                  )}
               </ul>
            </section>
            <section tw="px-4 ml-auto flex justify-center">
               {isLoading ? (
                  <Loader inline={true} />
               ) : isAuthenticated ? (
                  <>
                     {user?.platform_customer?.firstName &&
                        (isClient && window.innerWidth > 786 ? (
                           <Link
                              href="/account/profile/"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ) : (
                           <Link
                              href="#"
                              tw="mr-3 inline-flex items-center justify-center rounded-full h-10 w-10 bg-gray-200"
                              onClick={() => setToggle(!toggle)}
                           >
                              {getInitials(
                                 `${user.platform_customer.firstName} ${user.platform_customer.lastName}`
                              )}
                           </Link>
                        ))}

                     <button
                        css={tw`text-red-600 rounded px-2 py-1`}
                        onClick={logout}
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <Login
                     onClick={() => {
                        if (isClient) {
                           localStorage.setItem(
                              'source-route',
                              window.location.pathname
                           )
                        }
                        // router.push('/[brand]/login')
                     }}
                     bg={theme?.accent}
                  >
                     <Link href="/login" as="/login">
                        Log In
                     </Link>
                  </Login>
               )}
               <button
                  css={tw`rounded px-2 py-1 inline-block md:hidden ml-2`}
                  onClick={() => setIsMobileNavVisible(!isMobileNavVisible)}
               >
                  {isMobileNavVisible ? (
                     <CrossIcon stroke="#111" size={24} />
                  ) : (
                     <MenuIcon />
                  )}
               </button>
            </section>
            {isMobileNavVisible && (
               <section tw="absolute block md:hidden bg-white px-4 w-full top-16 list-none transition-all duration-200 ease-in-out">
                  <li tw="text-gray-800 py-2">
                     <Link href="/how-it-works/">How It Works</Link>
                  </li>
                  {isAuthenticated && user?.isSubscriber ? (
                     <li tw="text-gray-800 py-2">
                        <Link href="/menu">Select Menu</Link>
                     </li>
                  ) : (
                     <li tw="text-gray-800 py-2">
                        <Link href="/our-menu">Our Menu</Link>
                     </li>
                  )}
                  {!user?.isSubscriber && (
                     <li tw="text-gray-800 py-2">
                        <Link href="/our-plans">Get Started</Link>
                     </li>
                  )}
               </section>
            )}
         </Wrapper>
         {isClient && window.innerWidth < 786 && (
            <ProfileSidebar toggle={toggle} logout={logout} />
         )}
      </>
   )
}

const Wrapper = styled.header`
   height: 64px;
   z-index: 1000;
   grid-template-columns: auto 1fr auto;
   ${tw`w-full grid top-0 bg-white fixed border-b items-center`}
`

const Brand = styled.div`
   ${tw`h-full px-6 flex items-center border-r`}
`

const Login = styled.button(
   ({ bg }) => css`
      ${tw`bg-blue-600 text-white rounded px-2 py-1`}
      ${bg && `background-color: ${bg};`}
   `
)
const DataWithChildNodes = dataList => {
   dataList.map(each => {
      const newFilter = dataList.filter(
         x => x.parentNavigationMenuItemId === each.id
      )
      each.childNodes = newFilter
      return each
   })
   return dataList
}
