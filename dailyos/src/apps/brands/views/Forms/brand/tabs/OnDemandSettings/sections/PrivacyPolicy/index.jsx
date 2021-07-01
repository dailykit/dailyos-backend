import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import {
   Text,
   Spacer,
   Tunnels,
   Tunnel,
   useTunnel,
   TextButton,
} from '@dailykit/ui'

import { RichTextEditorTunnel } from '../../../../Tunnels'
import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const PrivacyPolicy = ({ update }) => {
   const title = 'Privacy Policy'

   const params = useParams()
   const [text, setText] = React.useState({})
   const [settingId, setSettingId] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const { loading, error } = useSubscription(BRANDS.ONDEMAND_SETTING, {
      variables: {
         identifier: { _eq: 'Privacy Policy' },
         type: { _eq: 'brand' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { storeSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(storeSettings)) {
            const index = storeSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = storeSettings[0]
               setSettingId(id)
               return
            }
            const { brand, id } = storeSettings[index]
            setSettingId(id)
            if (!isNull(brand) && !isEmpty(brand)) {
               setText(brand.value.value || '')
            }
         }
      },
   })

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id={title}>
         <Flex container alignItems="flex-start">
            <Text as="h3">{title}</Text>
            <Tooltip identifier="brand_privacy_policy" />
         </Flex>
         <Spacer size="16px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <TextButton size="sm" type="outline" onClick={() => openTunnel(1)}>
               Update
            </TextButton>
         </Flex>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <RichTextEditorTunnel
                  title={title}
                  update={update}
                  text={text}
                  settingId={settingId}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
