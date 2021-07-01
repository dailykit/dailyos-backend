import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Checkbox,
   IconButton,
   Text,
   Form,
   Flex,
   Spacer,
   Collapsible,
   ComboButton,
} from '@dailykit/ui'
import { toast } from 'react-toastify'

import { StyledTable } from './styled'
import { Container, Grid } from '../styled'
import { UPDATE_MODE } from '../../../../../graphql'
import { IngredientContext } from '../../../../../context/ingredient'
import { currencyFmt, logger } from '../../../../../../../shared/utils'
import { CloseIcon, EditIcon, TickIcon } from '../../../../../assets/icons'
import {
   DragNDrop,
   Nutrition,
   Tooltip,
} from '../../../../../../../shared/components'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'

const Sachet = ({ state, openNutritionTunnel, openEditSachetTunnel }) => {
   const { initiatePriority } = useDnd()

   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )

   const [sachet, setSachet] = React.useState(
      state.ingredientProcessings[ingredientState.processingIndex]
         .ingredientSachets[ingredientState.sachetIndex]
   )

   React.useEffect(() => {
      if (
         state.ingredientProcessings[ingredientState.processingIndex]
            .ingredientSachets[ingredientState.sachetIndex]
      ) {
         setSachet(
            state.ingredientProcessings[ingredientState.processingIndex]
               .ingredientSachets[ingredientState.sachetIndex]
         )
      } else {
         setSachet(
            state.ingredientProcessings[ingredientState.processingIndex]
               .ingredientSachets[0]
         )
      }
   }, [state, ingredientState.processingIndex, ingredientState.sachetIndex])

   React.useEffect(() => {
      if (sachet.modeOfFulfillments.length) {
         initiatePriority({
            tablename: 'modeOfFulfillment',
            schemaname: 'ingredient',
            data: sachet.modeOfFulfillments,
         })
      }
   }, [sachet])

   // Mutation
   const [updateMode] = useMutation(UPDATE_MODE, {
      onCompleted: () => {
         toast.success('Mode updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const setLive = (mode, val) => {
      if (val) {
         if (!(mode.operationConfig && (mode.bulkItem || mode.sachetItem))) {
            return toast.error('Mode not configured!')
         }
      }
      return updateMode({
         variables: {
            id: mode.id,
            set: {
               isLive: val,
            },
         },
      })
   }
   const editMOF = mode => {
      ingredientDispatch({
         type: 'EDIT_MODE',
         payload: {
            ...mode,
            packaging: mode.packaging
               ? {
                    ...mode.packaging,
                    title: mode.packaging.name,
                 }
               : null,
            labelTemplate: mode.labelTemplate
               ? {
                    ...mode.labelTemplate,
                    title: mode.labelTemplate.name,
                 }
               : null,
            bulkItem: mode.bulkItem
               ? {
                    ...mode.bulkItem,
                    title: `${mode.bulkItem.supplierItem.name} ${mode.bulkItem.processingName}`,
                 }
               : null,
            sachetItem: mode.sachetItem
               ? {
                    ...mode.sachetItem,
                    title: `${mode.sachetItem.bulkItem.supplierItem.name}  ${mode.sachetItem.bulkItem.processingName} ${mode.sachetItem.unitSize} ${mode.sachetItem.unit}`,
                 }
               : null,
         },
      })
      ingredientDispatch({
         type: 'CURRENT_MODE',
         payload: mode.type,
      })
      openEditSachetTunnel(2)
   }

   const renderModeType = type => {
      switch (type) {
         case 'realTime':
            return 'Real Time'
         case 'plannedLot':
            return 'Planned Lot'
         default:
            return 'Invalid mode!'
      }
   }

   const renderItemName = mode => {
      if (!mode.sachetItem && !mode.bulkItem) return 'No item linked!'
      switch (mode.type) {
         case 'realTime':
            return `${mode.bulkItem.supplierItem.name} ${mode.bulkItem.processingName}`
         case 'plannedLot':
            return `${mode.sachetItem.bulkItem.supplierItem.name} ${mode.sachetItem.bulkItem.processingName} ${mode.sachetItem.unitSize} ${mode.sachetItem.unit}`
         default:
            return 'Invalid mode!'
      }
   }

   return (
      <>
         <Container bottom="32">
            <Grid>
               <Flex container alignItems="center">
                  <span>
                     {sachet.tracking ? (
                        <TickIcon color="#00A7E1" stroke={2} size={20} />
                     ) : (
                        <CloseIcon color="#FF5A52" size={20} />
                     )}
                  </span>
                  <Spacer xAxis size="8px" />
                  <Text as="title">Tracking Inventory</Text>
               </Flex>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Flex container alignItems="center">
                     <Text as="subtitle">Active: </Text>{' '}
                     <Text as="title">
                        {sachet.liveModeOfFulfillment?.type === 'realTime' &&
                           'Real Time'}
                        {sachet.liveModeOfFulfillment?.type === 'plannedLot' &&
                           'Planned Lot'}
                     </Text>
                  </Flex>
                  <IconButton
                     type="ghost"
                     onClick={() => openEditSachetTunnel(1)}
                  >
                     <EditIcon color="#00A7E1" />
                  </IconButton>
               </Flex>
            </Grid>
         </Container>
         <DragNDrop
            list={sachet.modeOfFulfillments}
            droppableId="mofDroppableId"
            tablename="modeOfFulfillment"
            schemaname="ingredient"
         >
            {sachet.modeOfFulfillments?.map(mode => (
               <Collapsible
                  key={mode.id}
                  isDraggable
                  title={renderModeType(mode.type)}
                  head={
                     <Flex
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                     >
                        <Flex container alignItems="center">
                           <Flex>
                              <Text as="subtitle">Item</Text>
                              <Text as="p">{renderItemName(mode)}</Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Cost</Text>
                              <Text as="p">
                                 {currencyFmt(
                                    Number(mode.cost.toFixed(2)) || 0
                                 )}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Accuracy</Text>
                              <Text as="p">
                                 {mode.accuracy
                                    ? `Atleast ${mode.accuracy} %`
                                    : "Don't Weigh"}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                        </Flex>
                        <Flex container alignItems="center">
                           {mode.isLive ? (
                              <ComboButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => setLive(mode, !mode.isLive)}
                              >
                                 <CloseIcon
                                    color="#36B6E2"
                                    size={14}
                                    stroke={1.5}
                                 />
                                 Make Unavailable
                              </ComboButton>
                           ) : (
                              <ComboButton
                                 type="outline"
                                 size="sm"
                                 onClick={() => setLive(mode, !mode.isLive)}
                              >
                                 <TickIcon
                                    color="#36B6E2"
                                    size={14}
                                    stroke={1.5}
                                 />
                                 Make Available
                              </ComboButton>
                           )}
                           <Spacer xAxis size="24px" />
                           <IconButton
                              type="ghost"
                              onClick={() => editMOF(mode)}
                           >
                              <EditIcon color="#00A7E1" />
                           </IconButton>
                        </Flex>
                     </Flex>
                  }
                  body={
                     <Flex
                        container
                        alignItems="center"
                        height="60px"
                        margin="8px 0 0 0"
                        width="100%"
                     >
                        <Flex container alignItems="center">
                           <Flex>
                              <Text as="subtitle">Packaging</Text>
                              <Text as="p">{mode.packaging?.name || '-'}</Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Station</Text>
                              <Text as="p">
                                 {mode.operationConfig?.station?.name || '-'}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Label Template</Text>
                              <Text as="p">
                                 {mode.operationConfig?.labelTemplate?.name ||
                                    '-'}
                              </Text>
                           </Flex>
                        </Flex>
                     </Flex>
                  }
               />
            ))}
         </DragNDrop>
         <Container top="32">
            <Flex container maxWidth="200px">
               <Text as="subtitle"> Cost </Text>
               <Tooltip identifier="sachet_cost" />
            </Flex>
            <Text as="p">{currencyFmt(Number(sachet.cost) || 0)}</Text>
         </Container>
         <Container top="32">
            <Flex container maxWidth="200px">
               <Text as="subtitle"> Nutrition </Text>
               <Tooltip identifier="sachet_nutritional_info" />
            </Flex>
            {sachet.nutritionalInfo ? (
               <Nutrition data={sachet.nutritionalInfo} vertical />
            ) : (
               <ButtonTile
                  type="secondary"
                  text="Add Nutritional Values"
                  onClick={() => openNutritionTunnel(1)}
               />
            )}
         </Container>
      </>
   )
}

export default Sachet
