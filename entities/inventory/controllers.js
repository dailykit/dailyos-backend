import { client } from '../../lib/graphql'
import {
   CREATE_SACHET_ITEM_HISTORY,
   CREATE_BULK_ITEM_HISTORY_FOR_ORDER_SACHET_ID,
   CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
   UPDATE_BULK_ITEM,
   UPDATE_BULK_ITEM_HISTORY,
} from './graphql/mutations'
import { GET_BULK_ITEM } from './graphql/queries'

// Done
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
      id,
   } = req.body.event.data.new

   if (sachetItemId && status === 'PENDING') {
      // create sachetItemHistory
      const response = await client.request(CREATE_SACHET_ITEM_HISTORY, {
         sachetItemId,
         quantity: -1,
         status: 'PENDING',
         orderSachetId: id,
      })
   }

   if (bulkItemId && status === 'PENDING') {
      // create bulkItemHistory
      const response = await client.request(
         CREATE_BULK_ITEM_HISTORY_FOR_ORDER_SACHET_ID,
         {
            bulkItemId,
            quantity,
            status: 'PENDING',
            orderSachetId: id,
         }
      )
   }
}

// Done
export const handleBulkItemHistory = async (req, res) => {
   const { bulkItemId, quantity, status } = req.body.event.data.new

   // fetch the bulkItem (with id === bulkItemId)
   const {
      data: { bulkItem },
   } = await client.request(GET_BULK_ITEM, { id: bulkItemId })

   if (status === 'PENDING' && quantity < 0) {
      // update bulkItem's commited field -> +|quantity|
      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: bulkItemId } },
         set: { committed: bulkItem.committed + Math.abs(quantity) },
      })
   }

   if (status === 'COMPLETED' && quantity < 0) {
      // set bulkItem' commited -> - |quantity|
      //               on-hand -> - |quantity|
      //               consumed -> + |quantity|

      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: bulkItemId } },
         set: {
            committed: bulkItem.committed - Math.abs(quantity),
            onHand: bulkItem.onHand - Math.abs(quantity),
            consumed: bulkItem.consumed + Math.abs(quantity),
         },
      })
   }

   if (status === 'PENDING' && quantity > 0) {
      // set bulkItem's awaiting -> + |quantity|
      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: bulkItemId } },
         set: { awaiting: bulkItem.awaiting + Math.abs(quantity) },
      })
   }

   if (status === 'COMPLETED' && quantity > 0) {
      // set bulkItem's onHand -> + |quantity|
      // set bulkItem's awaiting -> - |awaiting|

      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: bulkItemId } },
         set: {
            awaiting: bulkItem.awaiting - Math.abs(quantity),
            onHand: bulkItem.onHand + Math.abs(quantity),
         },
      })
   }

   if (status === 'CANCELLED') {
      if (quantity < 0) {
         // set bulkItem's committed -> - |quantity|
         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: { committed: bulkItem.committed - Math.abs(quantity) },
         })
      }

      if (quantity > 0) {
         // set bulkItem's awaiting -> - |quantity|
         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: { awaiting: bulkItem.awaiting - Math.abs(quantity) },
         })
      }
   }
}

// Done
export const handleSachetItemHistory = async (req, res) => {
   const { id, quantity, status, sachetItemId } = req.body.event.data.new

   // fetch the bulkItem (with id === sachetItemId)
   const {
      data: { bulkItem },
   } = await client.request(GET_BULK_ITEM, { id: sachetItemId })

   if (status === 'PENDING' && quantity < 0) {
      // update bulkItem's commited field -> +|quantity|
      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: sachetItemId } },
         set: { committed: bulkItem.committed + Math.abs(quantity) },
      })
   }

   if (status === 'COMPLETED' && quantity < 0) {
      // set bulkItem' commited -> - |quantity|
      //               on-hand -> - |quantity|
      //               consumed -> + |quantity|

      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: sachetItemId } },
         set: {
            committed: bulkItem.committed - Math.abs(quantity),
            onHand: bulkItem.onHand - Math.abs(quantity),
            consumed: bulkItem.consumed + Math.abs(quantity),
         },
      })
   }

   if (status === 'PENDING' && quantity > 0) {
      // set bulkItem's awaiting -> + |quantity|

      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: sachetItemId } },
         set: { awaiting: bulkItem.awaiting + Math.abs(quantity) },
      })
   }

   if (status === 'COMPLETED' && quantity > 0) {
      // set bulkItem's onHand -> + |quantity|
      // set bulkItem's awaiting -> - |awaiting|

      const response = await client.request(UPDATE_BULK_ITEM, {
         where: { id: { _eq: sachetItemId } },
         set: {
            awaiting: bulkItem.awaiting - Math.abs(quantity),
            onHand: bulkItem.onHand + Math.abs(quantity),
         },
      })
   }

   if (status === 'CANCELLED') {
      if (quantity < 0) {
         // set bulkItem's committed -> - |quantity|
         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: { committed: bulkItem.committed - Math.abs(quantity) },
         })
      }

      if (quantity > 0) {
         // set bulkItem's awaiting -> - |quantity|
         const response = await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: { awaiting: bulkItem.awaiting - Math.abs(quantity) },
         })
      }
   }
}

// Done
export const handlePurchaseOrderCreateUpdate = async (req, res) => {
   const { id, bulkItemId, orderQuantity, status } = req.body.event.data.new
   // create bulkItemHistory if status is pending

   if (status === 'PENDING') {
      const response = await client.request(
         CREATE_BULK_ITEM_HISTORY_FOR_ORDER_SACHET_ID,
         {
            bulkItemId,
            quantity,
            status: 'PENDING',
            orderSachetId: id,
         }
      )
   }

   // update the bulkItemHistory's status to COMPLETED

   if (status === 'COMPLETED') {
      const response = await client.request(UPDATE_BULK_ITEM_HISTORY, {
         bulkItemId,
         set: { status },
      })
   }

   // if status == CANCELLED, mark bulkItemHistory's status -> 'Cancelled'

   if (status === 'CANCELLED') {
      const response = await client.request(UPDATE_BULK_ITEM_HISTORY, {
         bulkItemId,
         set: { status },
      })
   }
}

export const handleBulkWorkOrderCreateUpdate = async (req, res) => {
   const {
      id: bulkWorkOrderId,
      inputBulkItemId,
      outputBulkItemId,
      inputQuantity,
      outputQuantity,
      status,
   } = req.body.event.data.new

   // create 2 bulkItemHistory for input and for output

   const outputBulkItemHistoryResponse = await client.request(
      CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
      {
         bulkItemId: outputBulkItemId,
         quantity: outputQuantity,
         status: 'PENDING',
         bulkWorkOrderId: bulkWorkOrderId,
      }
   )

   const inputBulkItemHistoryResponse = await client.request(
      CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
      {
         bulkItemId: inputBulkItemId,
         quantity: inputQuantity,
         status: 'PENDING',
         bulkWorkOrderId: bulkWorkOrderId,
      }
   )

   // fetch the bulkItemHistory (2) usin bulkWorkOrderId [length 2]
   const bulkItemHistory = await client.request()
   // mark the [bulkItemHistory].length = 2 -> COMPLETE or CANCELLED
}

export const handleSachetWorkOrderCreateUpdate = (req, res) => {
   const {
      id: sachetWorkOrderId,
      inputBulkItemId,
      outputSachetItemId,
      inputQuantity,
      outputQuantity,
      status,
   } = req.body.event.data.new

   // create sachetItemHistory
   // fetch sachetItemHistory( for output ) and bulkItemHistory( for input ) using sachetWorkOrderId
   // mark both (bulk and sachet) to
}
