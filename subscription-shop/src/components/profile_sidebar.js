import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useConfig } from '../lib'

export const ProfileSidebar = ({ toggle = true, logout }) => {
   const { configOf } = useConfig()
   const router = useRouter()

   const loyaltyPointsAllowed = configOf(
      'Loyalty Points',
      'rewards'
   )?.isAvailable
   const walletAllowed = configOf('Wallet', 'rewards')?.isAvailable
   const referralsAllowed = configOf('Referral', 'rewards')?.isAvailable

   const [menu] = useState([
      { title: 'Profile', href: '/account/profile/' },
      { title: 'Wallet', href: '/account/wallet/' },
      {
         title: 'Loyalty Points',
         href: '/account/loyalty-points/',
      },
      { title: 'Referrals', href: '/account/referrals/' },
      { title: 'Order History', href: '/account/orders/' },
      { title: 'Manage Addresses', href: '/account/addresses/' },
      { title: 'Manage Cards', href: '/account/cards/' },
   ])

   return (
      <Aside toggle={toggle}>
         <ul>
            {menu.map(node => (
               <Link href={node.href} key={node.href} passHref>
                  <MenuLink
                     css={
                        node.href === `${router.pathname}/` && tw`bg-gray-300`
                     }
                  >
                     {node.title}
                  </MenuLink>
               </Link>
            ))}
            <button
               css={tw`text-red-600 rounded pl-3 py-1 md:hidden block`}
               onClick={logout}
            >
               Logout
            </button>
         </ul>
      </Aside>
   )
}

const MenuLink = styled.a`
   ${tw`pl-3 flex items-center w-full h-12`}
`
const Aside = styled.aside(
   ({ toggle }) => css`
      ${tw`bg-gray-100 border-r block z-30`}
      ${toggle
         ? tw`hidden md:block`
         : tw`block md:hidden md:static absolute top-16 right-0 bottom-0 left-0`}
       ${!toggle &&
      `
            left: -100px;
            animation: slide 0.5s forwards;
            @keyframes slide {
               100% { left: 0; }
            }
         `}
   `
)
