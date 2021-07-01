import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   IconButton,
   PlusIcon,
   RadioGroup,
   Spacer,
   TunnelHeader,
   useTunnel,
   Filler,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   OperationConfig,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { CREATE_SACHET, FETCH_UNITS } from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'
import { StyledTable } from './styled'

const SachetTunnel = ({ state, closeTunnel, openTunnel }) => {
   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )

   const [
      operationConfigTunnels,
      openOperationConfigTunnel,
      closeOperationConfigTunnel,
   ] = useTunnel(4)

   // State
   const [quantity, setQuantity] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [unit, setUnit] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [tracking, setTracking] = React.useState({
      value: true,
   })

   const options = [
      { id: 1, title: 'Atleast 80%', value: '80' },
      { id: 2, title: 'Atleast 95%', value: '95' },
      { id: 3, title: "Don't Weigh", value: '0' },
   ]

   // Subscription
   const { data: { units = [] } = {}, loading, error } = useSubscription(
      FETCH_UNITS,
      {
         onSubscriptionData: data => {
            if (data.subscriptionData.data.units.length) {
               setUnit({
                  ...unit,
                  value: data.subscriptionData.data.units[0].title,
               })
            }
         },
      }
   )

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   // Handlers
   const close = () => {
      ingredientDispatch({
         type: 'CLEAN',
      })
      closeTunnel(1)
   }
   const propagate = (type, val) => {
      if (
         val &&
         !(ingredientState[type].sachetItem || ingredientState[type].bulkItem)
      ) {
         ingredientDispatch({
            type: 'CURRENT_MODE',
            payload: type,
         })
         openTunnel(2)
      }
      ingredientDispatch({
         type: 'MODE',
         payload: {
            mode: type,
            name: 'isLive',
            value: val,
         },
      })
   }
   const selectPackaging = type => {
      ingredientDispatch({
         type: 'CURRENT_MODE',
         payload: type,
      })
      openTunnel(3)
   }
   const selectOperationConfiguration = type => {
      ingredientDispatch({
         type: 'CURRENT_MODE',
         payload: type,
      })
      openOperationConfigTunnel(1)
   }

   // Mutations
   const [createSachet, { loading: inFlight }] = useMutation(CREATE_SACHET, {
      onCompleted: () => {
         toast.success('Sachet added!')
         close()
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const add = () => {
      try {
         if (inFlight) return
         if (!quantity.value) {
            return toast.error('Quantity is required!')
         }
         const object = {
            ingredientId: state.id,
            ingredientProcessingId:
               state.ingredientProcessings[ingredientState.processingIndex].id,
            quantity: quantity.value,
            unit: unit.value,
            tracking: tracking.value,
            modeOfFulfillments: {
               data: [
                  {
                     type: 'realTime',
                     isPublished: ingredientState.realTime.isPublished,
                     isLive: ingredientState.realTime.isLive,
                     position: 0,
                     bulkItemId: ingredientState.realTime.bulkItem?.id || null,
                     sachetItemId: null,
                     accuracy: ingredientState.realTime.accuracy,
                     packagingId:
                        ingredientState.realTime.packaging?.id || null,
                     operationConfigId:
                        ingredientState.realTime.operationConfig?.id || null,
                  },
                  {
                     type: 'plannedLot',
                     isPublished: ingredientState.plannedLot.isPublished,
                     isLive: ingredientState.plannedLot.isLive,
                     position: 1000000,
                     bulkItemId: null,
                     sachetItemId:
                        ingredientState.plannedLot.sachetItem?.id || null,
                     accuracy: ingredientState.plannedLot.accuracy,
                     packagingId:
                        ingredientState.plannedLot.packaging?.id || null,
                     operationConfigId:
                        ingredientState.realTime.operationConfig?.id || null,
                  },
               ],
            },
         }
         createSachet({
            variables: {
               objects: [object],
            },
         })
      } catch (error) {
         toast.error('Something went wrong!')
         logger(error)
      }
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <OperationConfig
            tunnels={operationConfigTunnels}
            openTunnel={openOperationConfigTunnel}
            closeTunnel={closeOperationConfigTunnel}
            onSelect={config =>
               ingredientDispatch({
                  type: 'MODE',
                  payload: {
                     mode: ingredientState.currentMode,
                     name: 'operationConfig',
                     value: config,
                  },
               })
            }
         />
         <TunnelHeader
            title="Add Sachet"
            right={{ action: add, title: inFlight ? 'Adding...' : 'Add' }}
            close={close}
            tooltip={<Tooltip identifier="add_sachet_tunnel" />}
         />
         <TunnelBody>
            {units.length ? (
               <>
                  <Flex maxWidth="300px">
                     <Form.Group>
                        <Form.Label htmlFor="quantity" title="quantity">
                           Quantity*
                        </Form.Label>
                        <Form.TextSelect>
                           <Form.Number
                              id="quantity"
                              name="quantity"
                              value={quantity.value}
                              placeholder="Enter sachet quantity"
                              onChange={e =>
                                 setQuantity({
                                    ...quantity,
                                    value: e.target.value,
                                 })
                              }
                              onBlur={() => {
                                 const { isValid, errors } = validator.quantity(
                                    quantity.value
                                 )
                                 setQuantity({
                                    ...quantity,
                                    meta: {
                                       isTouched: true,
                                       isValid,
                                       errors,
                                    },
                                 })
                              }}
                           />
                           <Form.Select
                              id="unit"
                              name="unit"
                              options={units}
                              value={unit.value}
                              placeholder="Choose unit"
                              defaultValue={unit.value}
                              onChange={e =>
                                 setUnit({ ...unit, value: e.target.value })
                              }
                           />
                        </Form.TextSelect>
                        {quantity.meta.isTouched &&
                           !quantity.meta.isValid &&
                           quantity.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                  </Flex>
                  <Spacer size="24px" />
                  <Flex container maxWidth="300px">
                     <Form.Toggle
                        id="tracking"
                        name="tracking"
                        value={tracking.value}
                        onChange={() =>
                           setTracking({ ...tracking, value: !tracking.value })
                        }
                     >
                        <Flex container>
                           Track Inventory
                           <Tooltip identifier="sachet_tracking_inventory" />
                        </Flex>
                     </Form.Toggle>
                  </Flex>
                  <Spacer size="24px" />
                  <StyledTable cellSpacing={0}>
                     <thead>
                        <tr>
                           <th>
                              <Flex container alignItems="center">
                                 Mode of Fulfillment
                                 <Tooltip identifier="sachet_mof" />
                              </Flex>
                           </th>
                           <th>
                              <Flex container alignItems="center">
                                 Item
                                 <Tooltip identifier="sachet_mode_item" />
                              </Flex>
                           </th>
                           <th>
                              <Flex container alignItems="center">
                                 Accuracy
                                 <Tooltip identifier="sachet_mode_accuracy" />
                              </Flex>
                           </th>
                           <th>
                              <Flex container alignItems="center">
                                 Packaging
                                 <Tooltip identifier="sachet_mode_packaging" />
                              </Flex>
                           </th>
                           <th>
                              <Flex container alignItems="center">
                                 Operational Configuration
                                 <Tooltip identifier="sachet_mode_opconfig" />
                              </Flex>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td>
                              <Flex container>
                                 <Form.Checkbox
                                    id="realTimeIsLive"
                                    name="realTimeIsLive"
                                    value={ingredientState.realTime.isLive}
                                    onChange={() =>
                                       propagate(
                                          'realTime',
                                          !ingredientState.realTime.isLive
                                       )
                                    }
                                 >
                                    Real Time
                                 </Form.Checkbox>
                                 <Tooltip identifier="sachet_real_time" />
                              </Flex>
                           </td>
                           <td>
                              {ingredientState.realTime.bulkItem?.title || '-'}
                           </td>
                           <td>
                              {ingredientState.realTime.bulkItem ? (
                                 <RadioGroup
                                    options={options}
                                    active={3}
                                    onChange={option =>
                                       ingredientDispatch({
                                          type: 'MODE',
                                          payload: {
                                             mode: 'realTime',
                                             name: 'accuracy',
                                             value: option.value,
                                          },
                                       })
                                    }
                                 />
                              ) : (
                                 '-'
                              )}
                           </td>
                           <td>
                              {ingredientState.realTime.bulkItem ? (
                                 <>
                                    {ingredientState.realTime.packaging ? (
                                       <>
                                          {
                                             ingredientState.realTime.packaging
                                                ?.title
                                          }
                                       </>
                                    ) : (
                                       <IconButton
                                          type="ghost"
                                          onClick={() =>
                                             selectPackaging('realTime')
                                          }
                                       >
                                          <PlusIcon color="#07A8E2" />
                                       </IconButton>
                                    )}
                                 </>
                              ) : (
                                 '-'
                              )}
                           </td>
                           <td>
                              {ingredientState.realTime.bulkItem ? (
                                 <>
                                    {ingredientState.realTime
                                       .operationConfig ? (
                                       <>
                                          {`${ingredientState.realTime.operationConfig.station.name} - ${ingredientState.realTime.operationConfig.labelTemplate.name}`}
                                       </>
                                    ) : (
                                       <IconButton
                                          type="ghost"
                                          onClick={() =>
                                             selectOperationConfiguration(
                                                'realTime'
                                             )
                                          }
                                       >
                                          <PlusIcon color="#07A8E2" />
                                       </IconButton>
                                    )}
                                 </>
                              ) : (
                                 '-'
                              )}
                           </td>
                        </tr>
                        <tr>
                           <td>
                              <Flex container>
                                 <Form.Checkbox
                                    id="plannedLotIsLive"
                                    name="plannedLotIsLive"
                                    value={ingredientState.plannedLot.isLive}
                                    onChange={() =>
                                       propagate(
                                          'plannedLot',
                                          !ingredientState.plannedLot.isLive
                                       )
                                    }
                                 >
                                    Planned Lot
                                 </Form.Checkbox>
                                 <Tooltip identifier="sachet_planned_lot" />
                              </Flex>
                           </td>
                           <td>
                              {ingredientState.plannedLot.sachetItem?.title ||
                                 '-'}
                           </td>
                           <td>
                              {ingredientState.plannedLot.sachetItem ? (
                                 <RadioGroup
                                    options={options}
                                    active={3}
                                    onChange={option =>
                                       ingredientDispatch({
                                          type: 'MODE',
                                          payload: {
                                             mode: 'plannedLot',
                                             name: 'accuracy',
                                             value: option.value,
                                          },
                                       })
                                    }
                                 />
                              ) : (
                                 '-'
                              )}
                           </td>
                           <td>
                              {ingredientState.plannedLot.sachetItem ? (
                                 <>
                                    {ingredientState.plannedLot.packaging ? (
                                       <>
                                          {
                                             ingredientState.plannedLot
                                                .packaging?.title
                                          }
                                       </>
                                    ) : (
                                       <IconButton
                                          type="ghost"
                                          onClick={() =>
                                             selectPackaging('plannedLot')
                                          }
                                       >
                                          <PlusIcon color="#07A8E2" />
                                       </IconButton>
                                    )}
                                 </>
                              ) : (
                                 '-'
                              )}
                           </td>
                           <td>
                              {ingredientState.plannedLot.sachetItem ? (
                                 <>
                                    {ingredientState.plannedLot
                                       .operationConfig ? (
                                       <>
                                          {`${ingredientState.plannedLot.operationConfig.station.name} - ${ingredientState.plannedLot.operationConfig.labelTemplate.name}`}
                                       </>
                                    ) : (
                                       <IconButton
                                          type="ghost"
                                          onClick={() =>
                                             selectOperationConfiguration(
                                                'plannedLot'
                                             )
                                          }
                                       >
                                          <PlusIcon color="#07A8E2" />
                                       </IconButton>
                                    )}
                                 </>
                              ) : (
                                 '-'
                              )}
                           </td>
                        </tr>
                     </tbody>
                  </StyledTable>
               </>
            ) : (
               <Filler
                  message="No units found! To start, please add some."
                  height="500px"
               />
            )}
         </TunnelBody>
      </>
   )
}

export default SachetTunnel
