import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import {
   Text,
   IconButton,
   Spacer,
   PlusIcon,
   Tunnels,
   Tunnel,
   TunnelHeader,
   useTunnel,
} from '@dailykit/ui'

import { ImageContainer } from './styled'
import { BRANDS } from '../../../../../../../graphql'
import { EditIcon } from '../../../../../../../../../shared/assets/icons'
import {
   AssetUploader,
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const BrandLogo = ({ update }) => {
   const params = useParams()
   const [url, setUrl] = React.useState('')
   const [settingId, setSettingId] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const { loading, error } = useSubscription(BRANDS.ONDEMAND_SETTING, {
      variables: {
         identifier: { _eq: 'Brand Logo' },
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
            if ('url' in brand.value) {
               setUrl(brand.value.url)
            }
         }
      },
   })

   const updateSetting = (data = {}) => {
      if ('url' in data) {
         update({ id: settingId, value: { url: data.url } })
      }
      closeTunnel(1)
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Brand Logo">
         <Flex container alignItems="flex-start">
            <Text as="h3">Logo</Text>
            <Tooltip identifier="brand_logo_info" />
         </Flex>
         <Spacer size="16px" />
         {url ? (
            <ImageContainer width="120px" height="120px">
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => openTunnel(1)}
                  >
                     <EditIcon />
                  </IconButton>
               </div>
               <img src={url} alt="Brand Logo" />
            </ImageContainer>
         ) : (
            <ImageContainer width="120px" height="120px" noThumb>
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => openTunnel(1)}
                  >
                     <PlusIcon />
                  </IconButton>
               </div>
            </ImageContainer>
         )}
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <TunnelHeader
                  title="Add Brand Logo"
                  close={() => closeTunnel(1)}
               />
               <Flex padding="16px">
                  <AssetUploader
                     onAssetUpload={data => updateSetting(data)}
                     onImageSelect={data => updateSetting(data)}
                  />
               </Flex>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
