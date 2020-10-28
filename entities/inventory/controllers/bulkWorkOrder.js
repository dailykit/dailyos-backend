import { client } from '../../../lib/graphql'
import {
   CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER,
   UPDATE_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID
} from '../graphql/mutations'
import { GET_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID } from '../graphql/queries'

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
