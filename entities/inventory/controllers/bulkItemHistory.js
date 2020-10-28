import { StatusCodes } from 'http-status-codes'
import { client } from '../../../lib/graphql'
import { UPDATE_BULK_ITEM } from '../graphql/mutations'
import { GET_BULK_ITEM } from '../graphql/queries'

// Done
// test -> passes
export const handleBulkItemHistory = async (req, res) => {
   try {
      const { bulkItemId, quantity, status } = req.body.event.data.new
      const oldBulkItem = req.body.event.data.old

      // fetch the bulkItem (with id === bulkItemId)
      const bulkItemData = await client.request(GET_BULK_ITEM, {
         id: bulkItemId
      })

      if (status === 'PENDING' && quantity < 0) {
         // update bulkItem's commited field -> +|quantity|
         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               committed: bulkItemData.bulkItem.committed + Math.abs(quantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
      }

      if (status === 'COMPLETED' && quantity < 0) {
         // set bulkItem' commited -> - |quantity|
         //               on-hand -> - |quantity|
         //               consumed -> + |quantity|

         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               committed: bulkItemData.bulkItem.committed - Math.abs(quantity),
               onHand: bulkItemData.bulkItem.onHand - Math.abs(quantity),
               consumed: bulkItemData.bulkItem.consumed + Math.abs(quantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
      }

      if (status === 'PENDING' && quantity > 0) {
         // set bulkItem's awaiting -> + |quantity|
         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               awaiting: bulkItemData.bulkItem.awaiting + Math.abs(quantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
      }

      if (status === 'COMPLETED' && quantity > 0) {
         // set bulkItem's onHand -> + |quantity|
         // set bulkItem's awaiting -> - |awaiting|

         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               awaiting: bulkItemData.bulkItem.awaiting - Math.abs(quantity),
               onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
      }

      if (
         status === 'CANCELLED' &&
         oldBulkItem &&
         oldBulkItem.status === 'PENDING'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  committed:
                     bulkItemData.bulkItem.committed - Math.abs(quantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
         }

         if (quantity > 0) {
            // set bulkItem's awaiting -> - |quantity|
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  awaiting: bulkItemData.bulkItem.awaiting - Math.abs(quantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
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
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity),
                  consumed: bulkItemData.bulkItem.consumed - Math.abs(quantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
         }

         if (quantity > 0) {
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand - Math.abs(quantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
         }
      }

      if (
         status === 'PENDING' &&
         oldBulkItem &&
         oldBulkItem.status === 'COMPLETED'
      ) {
         if (quantity > 0) {
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand - Math.abs(quantity),
                  awaiting: bulkItemData.bulkItem.awaiting + Math.abs(quantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
         }

         if (quantity < 0) {
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity),
                  consumed: bulkItemData.bulkItem.consumed - Math.abs(quantity),
                  committed:
                     bulkItemData.bulkItem.committed + Math.abs(quantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
         }
      }
   } catch (error) {
      res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
         ok: false,
         message: error.message,
         stack: error.stack
      })
   }
}
