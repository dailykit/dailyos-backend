import { client } from '../../../lib/graphql'
import {
   CREATE_BULK_ITEM_HISTORY,
   CREATE_SACHET_ITEM_HISTORY,
   UPDATE_BULK_ITEM_HISTORY,
   UPDATE_SACHET_ITEM_HISTORY
} from '../graphql/mutations'

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
