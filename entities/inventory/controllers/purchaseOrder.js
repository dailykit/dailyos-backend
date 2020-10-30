import { StatusCodes } from 'http-status-codes'
import { client } from '../../../lib/graphql'
import {
   CREATE_BULK_ITEM_HISTORY,
   CREATE_PACKAGING_HISTORY
} from '../graphql/mutations'
import { updatePackagingHistoryStatus, updateBulktItemHistory } from './utils'

// Done
// test -> passes for bulk item. packaging pending...
export const handlePurchaseOrderCreateUpdate = async (req, res, next) => {
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
            await client.request(CREATE_PACKAGING_HISTORY, {
               object: {
                  packagingId,
                  purchaseOrderItemId: id,
                  quantity: orderQuantity
               }
            })
            res.status(StatusCodes.CREATED).json({
               ok: true,
               message: 'packaging history created.'
            })
            return
         }

         // update the packagingHistory's status to COMPLETED
         if (status === 'COMPLETED') {
            await updatePackagingHistoryStatus(packagingId, status)
            res.status(StatusCodes.OK).json({
               ok: true,
               message: `status updated to ${status}`
            })
            return
         }

         // if status == CANCELLED, mark bulkItemHistory's status -> 'Cancelled'
         if (status === 'CANCELLED') {
            await updatePackagingHistoryStatus(packagingId, status)
            res.status(StatusCodes.OK).json({
               ok: true,
               message: `status updated to ${status}`
            })
            return
         }
      }

      if (status === 'PENDING' && mode === 'INSERT') {
         await client.request(CREATE_BULK_ITEM_HISTORY, {
            objects: [
               {
                  bulkItemId,
                  quantity: orderQuantity,
                  status: 'PENDING',
                  purchaseOrderItemId: id
               }
            ]
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item history created'
         })
         return
      }

      // update the bulkItemHistory's status to COMPLETED

      if (status === 'COMPLETED') {
         await updateBulktItemHistory(bulkItemId, status)

         res.status(StatusCodes.OK).json({
            ok: true,
            message: `bulk item history marked ${status}`
         })
         return
      }

      // if status == CANCELLED, mark bulkItemHistory's status -> 'Cancelled'
      if (status === 'CANCELLED') {
         await updateBulktItemHistory(bulkItemId, status)
         res.status(StatusCodes.OK).json({
            ok: true,
            message: `bulk item history marked ${status}`
         })
         return
      }
   } catch (error) {
      next(error)
   }
}
