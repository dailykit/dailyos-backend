import { StatusCodes } from 'http-status-codes'
import { client } from '../../../lib/graphql'
import {
   CREATE_BULK_ITEM_HISTORY,
   CREATE_PACKAGING_HISTORY
} from '../graphql/mutations'

// Done
// test -> passes
export const handlePurchaseOrderCreateUpdate = async (req, res) => {
   try {
      const {
         id,
         bulkItemId,
         orderQuantity,
         status,
         packagingId
      } = req.body.event.data.new
      const mode = req.body.event.op
      // create bulkItemHistory if status is pending

      // cases if packagingId is available.
      if (packagingId) {
         if (status === 'PENDING' && (mode === 'INSERT' || mode === 'MANUAL')) {
            // create packagingHistory with PENDING status
            client.request(CREATE_PACKAGING_HISTORY, {
               object: {
                  packagingId,
                  purchaseOrderItemId: id,
                  quantity: orderQuantity
               }
            })
         }

         // update the packagingHistory's status to COMPLETED
         if (status === 'COMPLETED')
            updatePackagingHistoryStatus(packagingId, status)

         // if status == CANCELLED, mark bulkItemHistory's status -> 'Cancelled'
         if (status === 'CANCELLED')
            updatePackagingHistoryStatus(packagingId, status)

         return
      }

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

      if (status === 'COMPLETED') updateBulktItemHistory(bulkItemId, status)

      // if status == CANCELLED, mark bulkItemHistory's status -> 'Cancelled'
      if (status === 'CANCELLED') updateBulktItemHistory(bulkItemId, status)
   } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
         ok: false,
         message: error.message,
         error: error.stack
      })
   }
}
