import { client } from '../../../lib/graphql'
import {
   CREATE_BULK_ITEM_HISTORY,
   CREATE_SACHET_ITEM_HISTORY,
   UPDATE_BULK_ITEM_HISTORY_WITH_SACHET_ORDER_ID,
   UPDATE_SACHET_ITEM_HISTORY_WITH_SACHET_WORK_ORDER_ID
} from '../graphql/mutations'
import {
   GET_BULK_ITEM_HISTORIES_WITH_SACHET_WORK_ORDER_ID,
   GET_SACHET_ITEM_HISTORIES
} from '../graphql/queries'

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
