import React, { useState } from 'react'
import { Tunnels, Tunnel, TunnelHeader } from '@dailykit/ui'

import { useMutation } from '@apollo/react-hooks'
import { CREATE_OPERATION_CONFIG } from '../../graphql'

import {
   AddConfigTunnel,
   ConfigListTunnel,
   LabelTemplatesTunnel,
   StationsTunnel,
} from './Tunnels'

export const OperationConfig = ({
   onSelect,
   tunnels,
   openTunnel,
   closeTunnel,
}) => {
   const [stationId, setStationId] = useState(null)
   const [labelId, setLabelId] = useState(null)
   const [insertOperationConfig] = useMutation(CREATE_OPERATION_CONFIG, {
      onCompleted: data => {
         onSelect(data.insertOperationConfig)
         closeTunnel(2)
         closeTunnel(1)
         setStationId(null)
         setLabelId(null)
      },
   })
   const save = () => {
      if (stationId != null && labelId != null) {
         insertOperationConfig({
            variables: {
               object: {
                  stationId: stationId,
                  labelTemplateId: labelId,
               },
            },
         })
      }
   }
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1}>
            <TunnelHeader
               title="Operation Configs"
               right={{ action: () => openTunnel(2), title: 'Create' }}
               close={() => closeTunnel(1)}
            />
            <ConfigListTunnel closeTunnel={closeTunnel} onSelect={onSelect} />
         </Tunnel>
         <Tunnel layer={2} size="md">
            <TunnelHeader
               title="Create Operation Config"
               close={() => closeTunnel(2)}
               right={{ action: save, title: 'Save' }}
            />
            <AddConfigTunnel
               closeTunnel={closeTunnel}
               openTunnel={openTunnel}
               stationId={stationId}
               labelId={labelId}
            />
         </Tunnel>
         <Tunnel layer={3} size="md">
            <TunnelHeader title="Stations List" close={() => closeTunnel(3)} />
            <StationsTunnel
               closeTunnel={closeTunnel}
               setStationId={setStationId}
            />
         </Tunnel>
         <Tunnel layer={4} size="md">
            <TunnelHeader
               title="Label Templates List"
               close={() => closeTunnel(4)}
            />
            <LabelTemplatesTunnel
               closeTunnel={closeTunnel}
               setLabelId={setLabelId}
            />
         </Tunnel>
      </Tunnels>
   )
}
