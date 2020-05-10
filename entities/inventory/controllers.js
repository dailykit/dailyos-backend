import { client } from '../../lib/graphql'
import {
   CREATE_SACHET_ITEM_HISTORY,
   CREATE_BULK_ITEM_HISTORY,
   CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
   UPDATE_BULK_ITEM,
   UPDATE_SACHET_ITEM,
   UPDATE_BULK_ITEM_HISTORY,
   UPDATE_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID,
   UPDATE_BULK_ITEM_HISTORY_WITH_SACHET_ORDER_ID,
   UPDATE_SACHET_ITEM_HISTORY_WITH_SACHET_WORK_ORDER_ID,
   UPDATE_SACHET_ITEM_HISTORY
} from './graphql/mutations'
import {
   GET_BULK_ITEM,
   GET_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID,
   GET_BULK_ITEM_HISTORIES_WITH_SACHET_WORK_ORDER_ID,
   GET_SACHET_ITEM_HISTORIES,
   GET_SACHET_ITEM
} from './graphql/queries'

// Done
// test -> passes
export const handleOrderSachetCreation = async (req, res) => {
   // req.body contains the whole event
   // req.body.table -> table related details -> schema and table name
   // req.body.trigger.name -> hook name
   // req.body.event -> event details -> {op: 'INSERT' | 'UPDATE', data: {old: {}, new: {}}}

   const {
      sachetItemId,
      bulkItemId,
      quantity,
      status,
      id
   } = req.body.event.data.new

   const oldStatus = req.body.event.data.old

   try {
      if (sachetItemId && status === 'PENDING') {
         // create sachetItemHistory
         const response = await client.request(CREATE_SACHET_ITEM_HISTORY, {
            objects: [
               {
                  sachetItemId,
                  quantity: -1,
                  status: 'PENDING',
                  orderSachetId: id
               }
            ]
         })
      }

      if (bulkItemId && status === 'PENDING') {
         // create bulkItemHistory
         const response = await client.request(CREATE_BULK_ITEM_HISTORY, {
            objects: [
               {
                  bulkItemId,
                  quantity,
                  status: 'PENDING',
                  orderSachetId: id
               }
            ]
         })
      }

      if (bulkItemId && status === 'COMPLETED') {
         // update BulkItemHistory
         const response = await client.request(UPDATE_BULK_ITEM_HISTORY, {
            bulkItemId,
            set: { status }
         })
      }

      if (bulkItemId && status === 'CANCELLED' && oldStatus === 'PENDING') {
         // update BulkItemHistory
         const response = await client.request(UPDATE_BULK_ITEM_HISTORY, {
            bulkItemId,
            set: { status }
         })
      }

      if (sachetItemId && status === 'COMPELETED') {
         // update sachetItemHistory

         const response = await client.request(UPDATE_SACHET_ITEM_HISTORY, {
            where: { orderSachetId: { _eq: id } },
            set: { status }
         })
      }

      if (sachetItemId && status === 'CANCELLED' && oldStatus === 'PENDING') {
         // update sachetItemHistory
         const response = await client.request(UPDATE_SACHET_ITEM_HISTORY, {
            where: { orderSachetId: { _eq: id } },
            set: { status }
         })
      }
   } catch (error) {
      throw error
   }
}

// Done
// test -> passes
export const handleBulkItemHistory = async (req, res) => {
   const { bulkItemId, quantity, status } = req.body.event.data.new
   const oldBulkItem = req.body.event.data.old

   try {
      // fetch the bulkItem (with id === bulkItemId)
      const bulkItemData = await client.request(GET_BULK_ITEM, {
         id: bulkItemId
      })

      if (status === 'PENDING' && quantity < 0) {
         // update bulkItem's commited field -> +|quantity|
         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               committed: bulkItemData.bulkItem.committed + Math.abs(quantity)
            }
         })
      }

      if (status === 'COMPLETED' && quantity < 0) {
         // set bulkItem' commited -> - |quantity|
         //               on-hand -> - |quantity|
         //               consumed -> + |quantity|

         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               committed: bulkItemData.bulkItem.committed - Math.abs(quantity),
               onHand: bulkItemData.bulkItem.onHand - Math.abs(quantity),
               consumed: bulkItemData.bulkItem.consumed + Math.abs(quantity)
            }
         })
      }

      if (status === 'PENDING' && quantity > 0) {
         // set bulkItem's awaiting -> + |quantity|
         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               awaiting: bulkItemData.bulkItem.awaiting + Math.abs(quantity)
            }
         })
      }

      if (status === 'COMPLETED' && quantity > 0) {
         // set bulkItem's onHand -> + |quantity|
         // set bulkItem's awaiting -> - |awaiting|

         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               awaiting: bulkItemData.bulkItem.awaiting - Math.abs(quantity),
               onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity)
            }
         })
      }

      if (
         status === 'CANCELLED' &&
         oldBulkItem &&
         oldBulkItem.status === 'PENDING'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            const response = await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  committed:
                     bulkItemData.bulkItem.committed - Math.abs(quantity)
               }
            })
         }

         if (quantity > 0) {
            // set bulkItem's awaiting -> - |quantity|
            const response = await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  awaiting: bulkItemData.bulkItem.awaiting - Math.abs(quantity)
               }
            })
         }
      }

      if (
         status === 'CANCELLED' &&
         oldBulkItem &&
         oldBulkItem.status === 'COMPLETED'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            const response = await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity),
                  consumed: bulkItemData.bulkItem.consumed - Math.abs(quantity)
               }
            })
         }

         if (quantity > 0) {
            const response = await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand - Math.abs(quantity)
               }
            })
         }
      }

      if (
         status === 'PENDING' &&
         oldBulkItem &&
         oldBulkItem.status === 'COMPLETED'
      ) {
         if (quantity > 0) {
            const response = await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand - Math.abs(quantity),
                  awaiting: bulkItemData.bulkItem.awaiting + Math.abs(quantity)
               }
            })
         }

         if (quantity < 0) {
            const response = await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity),
                  consumed: bulkItemData.bulkItem.consumed - Math.abs(quantity),
                  committed:
                     bulkItemData.bulkItem.committed + Math.abs(quantity)
               }
            })
         }
      }
   } catch (error) {
      throw error
   }
}

// Done
// test -> passes
export const handleSachetItemHistory = async (req, res) => {
   const { id, quantity, status, sachetItemId } = req.body.event.data.new
   const oldSachetItem = req.body.event.data.old

   try {
      // fetch the bulkItem (with id === sachetItemId)
      const sachetItemData = await client.request(GET_SACHET_ITEM, {
         id: sachetItemId
      })

      if (status === 'PENDING' && quantity < 0) {
         // update bulkItem's commited field -> +|quantity|
         const response = await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               committed:
                  sachetItemData.sachetItem.committed + Math.abs(quantity)
            }
         })
      }

      if (status === 'COMPLETED' && quantity < 0) {
         // set bulkItem' commited -> - |quantity|
         //               on-hand -> - |quantity|
         //               consumed -> + |quantity|

         const response = await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               committed:
                  sachetItemData.sachetItem.committed - Math.abs(quantity),
               onHand: sachetItemData.sachetItem.onHand - Math.abs(quantity),
               consumed: sachetItemData.sachetItem.consumed + Math.abs(quantity)
            }
         })
      }

      if (status === 'PENDING' && quantity > 0) {
         // set bulkItem's awaiting -> + |quantity|

         const response = await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               awaiting: sachetItemData.sachetItem.awaiting + Math.abs(quantity)
            }
         })
      }

      if (status === 'COMPLETED' && quantity > 0) {
         // set bulkItem's onHand -> + |quantity|
         // set bulkItem's awaiting -> - |awaiting|

         const response = await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               awaiting:
                  sachetItemData.sachetItem.awaiting - Math.abs(quantity),
               onHand: sachetItemData.sachetItem.onHand + Math.abs(quantity)
            }
         })
      }

      if (
         status === 'CANCELLED' &&
         oldSachetItem &&
         oldSachetItem.status === 'PENDING'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            const response = await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  committed:
                     sachetItemData.sachetItem.committed - Math.abs(quantity)
               }
            })
         }

         if (quantity > 0) {
            // set bulkItem's awaiting -> - |quantity|
            const response = await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  awaiting:
                     sachetItemData.sachetItem.awaiting - Math.abs(quantity)
               }
            })
         }
      }

      if (
         status === 'CANCELLED' &&
         oldSachetItem &&
         oldSachetItem.status === 'COMPLETED'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            const response = await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand + Math.abs(quantity),
                  consumed:
                     sachetItemData.sachetItem.consumed - Math.abs(quantity)
               }
            })
         }

         if (quantity > 0) {
            const response = await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand - Math.abs(quantity)
               }
            })
         }
      }

      if (
         status === 'PENDING' &&
         oldSachetItem &&
         oldSachetItem.status === 'COMPLETED'
      ) {
         if (quantity > 0) {
            const response = await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand - Math.abs(quantity),
                  awaiting:
                     sachetItemData.sachetItem.awaiting + Math.abs(quantity)
               }
            })
         }

         if (quantity < 0) {
            const response = await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand + Math.abs(quantity),
                  consumed:
                     sachetItemData.sachetItem.consumed - Math.abs(quantity),
                  committed:
                     sachetItemData.sachetItem.committed + Math.abs(quantity)
               }
            })
         }
      }
   } catch (error) {
      throw error
   }
}

// Done
// test -> passes
export const handlePurchaseOrderCreateUpdate = async (req, res) => {
   const { id, bulkItemId, orderQuantity, status } = req.body.event.data.new
   const mode = req.body.event.op
   // create bulkItemHistory if status is pending

   try {
      if (status === 'PENDING' && mode === 'INSERT') {
         const response = await client.request(CREATE_BULK_ITEM_HISTORY, {
            objects: [
               {
                  bulkItemId,
                  quantity: orderQuantity,
                  status: 'PENDING',
                  purchaseOrderItemId: id
               }
            ]
         })
      }

      // update the bulkItemHistory's status to COMPLETED

      if (status === 'COMPLETED') {
         const response = await client.request(UPDATE_BULK_ITEM_HISTORY, {
            bulkItemId,
            set: { status }
         })
      }

      // if status == CANCELLED, mark bulkItemHistory's status -> 'Cancelled'

      if (status === 'CANCELLED') {
         const response = await client.request(UPDATE_BULK_ITEM_HISTORY, {
            bulkItemId,
            set: { status }
         })
      }
   } catch (error) {
      throw error
   }
}

// Done
// test -> passes -> finally
export const handleBulkWorkOrderCreateUpdate = async (req, res) => {
   const {
      id: bulkWorkOrderId,
      inputBulkItemId,
      outputBulkItemId,
      inputQuantity,
      outputQuantity,
      status
   } = req.body.event.data.new

   try {
      // fetch the bulkItemHistory (2) usin bulkWorkOrderId [length 2]
      // will return an array of length 2
      const bulkItemHistories = await client.request(
         GET_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID,
         {
            bulkWorkOrderId
         }
      )

      if (
         bulkItemHistories &&
         bulkItemHistories.bulkItemHistories &&
         bulkItemHistories.bulkItemHistories.length
      ) {
         // mark the [bulkItemHistory].length = 2 -> COMPLETE or CANCELLED
         const response = await client.request(
            UPDATE_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID,
            {
               bulkWorkOrderId,
               set: { status }
            }
         )
      } else {
         // create 2 bulkItemHistory for input and for output

         const outputBulkItemHistoryResponse = await client.request(
            CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
            {
               bulkItemId: outputBulkItemId,
               quantity: outputQuantity,
               status: 'PENDING',
               bulkWorkOrderId: bulkWorkOrderId
            }
         )

         const inputBulkItemHistoryResponse = await client.request(
            CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
            {
               bulkItemId: inputBulkItemId,
               quantity: -inputQuantity,
               status: 'PENDING',
               bulkWorkOrderId: bulkWorkOrderId
            }
         )
      }
   } catch (error) {
      throw error
   }
}

// Done
// test -> passes
export const handleSachetWorkOrderCreateUpdate = async (req, res) => {
   const {
      id: sachetWorkOrderId,
      inputBulkItemId,
      outputSachetItemId,
      inputQuantity,
      outputQuantity,
      status
   } = req.body.event.data.new

   try {
      // fetch sachetItemHistory( for output ) and bulkItemHistory( for input ) using sachetWorkOrderId
      // will return an array of length 1
      const sachetHistoryResponse = await client.request(
         GET_SACHET_ITEM_HISTORIES,
         {
            sachetWorkOrderId
         }
      )

      const bulkHistoryResponse = await client.request(
         GET_BULK_ITEM_HISTORIES_WITH_SACHET_WORK_ORDER_ID,
         { sachetWorkOrderId }
      )

      if (
         sachetHistoryResponse &&
         bulkHistoryResponse &&
         bulkHistoryResponse.bulkItemHistories &&
         sachetHistoryResponse.sachetItemHistories &&
         bulkHistoryResponse.bulkItemHistories.length &&
         sachetHistoryResponse.sachetItemHistories.length
      ) {
         // mark both (bulk and sachet) to status
         // run mutation for updating sachetItemHistory

         const updateSachetHistoryResponse = await client.request(
            UPDATE_SACHET_ITEM_HISTORY_WITH_SACHET_WORK_ORDER_ID,
            {
               sachetWorkOrderId,
               set: { status, quantity: outputQuantity }
            }
         )

         // run mutation for updating bulkItemHistory
         const updateBulkHistoryResponse = await client.request(
            UPDATE_BULK_ITEM_HISTORY_WITH_SACHET_ORDER_ID,
            {
               sachetWorkOrderId,
               set: { status, quantity: -inputQuantity }
            }
         )
      } else {
         // create sachetItemHistory and bulkItemHistory if doesn't exists
         const sachetItemHistoryResponse = await client.request(
            CREATE_SACHET_ITEM_HISTORY,
            {
               objects: [
                  {
                     quantity: outputQuantity,
                     status: 'PENDING',
                     sachetItemId: outputSachetItemId,
                     sachetWorkOrderId
                  }
               ]
            }
         )

         const bulkItemHistoryResponse = await client.request(
            CREATE_BULK_ITEM_HISTORY,
            {
               objects: [
                  {
                     quantity: -inputQuantity,
                     status: 'PENDING',
                     bulkItemId: inputBulkItemId,
                     sachetWorkOrderId
                  }
               ]
            }
         )
      }
   } catch (error) {
      throw error
   }
}
