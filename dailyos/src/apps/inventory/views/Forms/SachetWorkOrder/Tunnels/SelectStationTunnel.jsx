import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { NO_STATIONS } from '../../../../constants/infoMessages'
import {
   STATIONS_SUBSCRIPTION,
   UPDATE_SACHET_WORK_ORDER,
} from '../../../../graphql'
import { TunnelWrapper } from '../../utils/TunnelWrapper'

const address = 'apps.inventory.views.forms.sachetworkorder.tunnels.'

const onError = error => {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function SelectStationTunnel({ close, state }) {
   const { t } = useTranslation()

   const [search, setSearch] = React.useState('')
   const [data, setData] = React.useState([])

   const [list, current, selectOption] = useSingleList(data)

   const { loading, error } = useSubscription(STATIONS_SUBSCRIPTION, {
      onSubscriptionData: input => {
         const data = input.subscriptionData.data.stations
         setData(data)
      },
   })

   const [updateSachetWorkOrder] = useMutation(UPDATE_SACHET_WORK_ORDER, {
      onCompleted: () => {
         toast.info('Work Order updated successfully!')
         close(1)
      },
      onError,
   })

   const handleSave = option => {
      updateSachetWorkOrder({
         variables: {
            id: state.id,
            set: {
               stationId: option.id,
            },
         },
      })
   }

   if (error) {
      logger(error)
      return <ErrorState />
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select station'))}
            close={() => close(1)}
            description="select staion for this work order"
            tooltip={
               <Tooltip identifier="bulk-work-order-select-station-tunnel" />
            }
         />
         <TunnelWrapper>
            {list.length ? (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat("type what you're looking for")
                     )}
                  />
                  <ListHeader type="SSL1" label="station" />
                  <ListOptions>
                     {list
                        .filter(option =>
                           option.name.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="SSL1"
                              key={option.id}
                              title={option.name}
                              isActive={option.id === current.id}
                              onClick={() => handleSave(option)}
                           />
                        ))}
                  </ListOptions>
               </List>
            ) : (
               <Filler message={NO_STATIONS} />
            )}
         </TunnelWrapper>
      </>
   )
}
