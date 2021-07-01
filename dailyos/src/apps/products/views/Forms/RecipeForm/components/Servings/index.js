import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Select,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { DELETE_SIMPLE_RECIPE_YIELD } from '../../../../../graphql'
import { ServingsTunnel } from '../../tunnels'

const Servings = ({ state }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const options =
      state.simpleRecipeYields?.map(option => {
         return {
            id: option.id,
            title: option.yield.serving,
         }
      }) || []

   // Mutation
   const [deleteYield] = useMutation(DELETE_SIMPLE_RECIPE_YIELD, {
      onCompleted: () => {
         toast.success('Deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const remove = serving => {
      const confirmed = window.confirm(
         `Are you sure you want to delete serving - ${serving.title}?`
      )
      if (confirmed)
         deleteYield({
            variables: {
               id: serving.id,
            },
         })
   }

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <ServingsTunnel state={state} closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Flex container alignItems="center">
            <Text as="subtitle">Servings</Text>
            <Tooltip identifier="recipe_servings" />
         </Flex>
         {options.length ? (
            <Select
               options={options}
               addOption={() => openTunnel(1)}
               placeholder="Add Servings"
               removeOption={remove}
            />
         ) : (
            <ButtonTile
               type="secondary"
               text="Add Servings"
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}

export default Servings
