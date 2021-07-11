import { client } from '../../../lib/graphql'
import {
   CREATE_BULK_ITEM_HISTORY,
   CREATE_SACHET_ITEM_HISTORY,
   UPDATE_BULK_ITEM_HISTORY,
   UPDATE_SACHET_ITEM_HISTORY
} from '../graphql/mutations'

// Done
// test -> passes
export const handleOrderSachetCreation = async (req, res, next) => {
   // req.body contains the whole event
   // req.body.table -> table related details -> schema and table name
   // req.body.trigger.name -> hook name
   // req.body.event -> event details -> {op: 'INSERT' | 'UPDATE', data: {old: {}, new: {}}}

   /*
      Three states for status:
      1. PENDING -> initial state
      2. READY -> packed after weighing but not labelled
      3. PACKED -> labelled
   */

   try {
      const { sachetItemId, bulkItemId, displayUnitQuantity, status, id } =
         req.body.event.data.new

      // const oldStatus = req.body.event.data.old

      if (status === 'PENDING') {
         if (sachetItemId) {
            await client.request(CREATE_SACHET_ITEM_HISTORY, {
               objects: [
                  {
                     sachetItemId,
                     quantity: 1,
                     status: 'PENDING',
                     orderSachetId: id
                  }
               ]
            })
         }
         if (bulkItemId) {
            await client.request(CREATE_BULK_ITEM_HISTORY, {
               objects: [
                  {
                     bulkItemId,
                     quantity: displayUnitQuantity,
                     status: 'PENDING',
                     orderSachetId: id
                  }
               ]
            })
         }
         return res.status(StatusCodes.OK).json({
            ok: true,
            message: 'History marked -> PENDING'
         })
      }

      if (status === 'READY') {
         if (sachetItemId) {
            await client.request(UPDATE_SACHET_ITEM_HISTORY, {
               where: { orderSachetId: { _eq: id } },
               set: { status: 'COMPLETED' }
            })
         }
         if (bulkItemId) {
            await client.request(UPDATE_BULK_ITEM_HISTORY, {
               where: { orderSachetId: { _eq: id } },
               set: { status: 'COMPLETED' }
            })
         }
         return res.status(StatusCodes.OK).json({
            ok: true,
            message: 'History marked -> COMPLETED'
         })
      }

      return res.status(StatusCodes.OK).json({
         ok: false,
         message: 'Status not PENDING or READY, no change in history!'
      })
   } catch (error) {
      next(error)
   }
}
