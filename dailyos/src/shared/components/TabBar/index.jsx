import { useSubscription } from '@apollo/react-hooks'
import { Avatar, Flex } from '@dailykit/ui'
import gql from 'graphql-tag'
import React from 'react'
import { useAuth, useTabs } from '../../providers'
import Tabs from '../Tabs'
import Logo from './Logo'
import Styles from './styled'
import TabStatus from './TabStatus'
export const TabBar = ({ open }) => {
   const { tabs } = useTabs()
   const { user } = useAuth()
   const USERS = gql`
      subscription users($where: settings_user_bool_exp!) {
         users: settings_user(where: $where) {
            id
            email
            firstName
            lastName
         }
      }
   `
   const fullName = (f, l) => {
      let name = ''
      if (f) {
         name += f
      }
      if (l) {
         name += ` ${l}`
      }
      return name
   }
   const { data: { users = [] } = {} } = useSubscription(USERS, {
      skip: !user?.email,
      variables: {
         where: {
            email: { _eq: user?.email },
         },
      },
   })
   return (
      <Styles.Header>
         <Flex container alignItems="center">
            <Logo />
            {tabs.length ? <TabStatus /> : null}
            <Flex margin="0 16px 0 auto">
               {users[0]?.firstName && (
                  <Avatar
                     url=""
                     title={fullName(users[0]?.firstName, users[0]?.lastName)}
                  />
               )}
            </Flex>
         </Flex>
         <Tabs open={open} />
      </Styles.Header>
   )
}
