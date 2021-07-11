import { client } from '../../../lib/graphql'
import { UPDATE_SACHET_ITEM } from '../graphql/mutations'
import { GET_SACHET_ITEM } from '../graphql/queries'

// Done
// test -> passes
export const handleSachetItemHistory = async (req, res, next) => {
   try {
      const { quantity, status, sachetItemId } = req.body.event.data.new
      const oldSachetItem = req.body.event.data.old

      // fetch the bulkItem (with id === sachetItemId)
      const sachetItemData = await client.request(GET_SACHET_ITEM, {
         id: sachetItemId
      })

      if (
         status === 'CANCELLED' &&
         oldSachetItem &&
         oldSachetItem.status === 'PENDING'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  committed:
                     sachetItemData.sachetItem.committed - Math.abs(quantity)
               }
            })
            res.status(200).json({
               ok: true,
               message: 'sachet item updated'
            })
            return
         }

         if (quantity > 0) {
            // set bulkItem's awaiting -> - |quantity|
            await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  awaiting:
                     sachetItemData.sachetItem.awaiting - Math.abs(quantity)
               }
            })
            res.status(200).json({
               ok: true,
               message: 'sachet item updated'
            })
            return
         }
      }

      if (
         status === 'CANCELLED' &&
         oldSachetItem &&
         oldSachetItem.status === 'COMPLETED'
      ) {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand + Math.abs(quantity),
                  consumed:
                     sachetItemData.sachetItem.consumed - Math.abs(quantity)
               }
            })
            res.status(200).json({
               ok: true,
               message: 'sachet item updated'
            })
            return
         }

         if (quantity > 0) {
            await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand - Math.abs(quantity)
               }
            })
            res.status(200).json({
               ok: true,
               message: 'sachet item updated'
            })
            return
         }
      }

      if (
         status === 'PENDING' &&
         oldSachetItem &&
         oldSachetItem.status === 'COMPLETED'
      ) {
         if (quantity > 0) {
            await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand - Math.abs(quantity),
                  awaiting:
                     sachetItemData.sachetItem.awaiting + Math.abs(quantity)
               }
            })
            res.status(200).json({
               ok: true,
               message: 'sachet item updated'
            })
            return
         }

         if (quantity < 0) {
            await client.request(UPDATE_SACHET_ITEM, {
               where: { id: { _eq: sachetItemId } },
               set: {
                  onHand: sachetItemData.sachetItem.onHand + Math.abs(quantity),
                  consumed:
                     sachetItemData.sachetItem.consumed - Math.abs(quantity),
                  committed:
                     sachetItemData.sachetItem.committed + Math.abs(quantity)
               }
            })
            res.status(200).json({
               ok: true,
               message: 'sachet item updated'
            })
            return
         }
      }

      if (status === 'PENDING' && quantity < 0) {
         // update bulkItem's commited field -> +|quantity|
         await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               committed:
                  sachetItemData.sachetItem.committed + Math.abs(quantity)
            }
         })
         res.status(200).json({
            ok: true,
            message: 'sachet item updated'
         })
         return
      }

      if (status === 'COMPLETED' && quantity < 0) {
         // set bulkItem' commited -> - |quantity|
         //               on-hand -> - |quantity|
         //               consumed -> + |quantity|

         await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               committed:
                  sachetItemData.sachetItem.committed - Math.abs(quantity),
               onHand: sachetItemData.sachetItem.onHand - Math.abs(quantity),
               consumed: sachetItemData.sachetItem.consumed + Math.abs(quantity)
            }
         })
         res.status(200).json({
            ok: true,
            message: 'sachet item updated'
         })
         return
      }

      if (status === 'PENDING' && quantity > 0) {
         // set bulkItem's awaiting -> + |quantity|

         await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               awaiting: sachetItemData.sachetItem.awaiting + Math.abs(quantity)
            }
         })
         res.status(200).json({
            ok: true,
            message: 'sachet item updated'
         })
         return
      }

      if (status === 'COMPLETED' && quantity > 0) {
         // set bulkItem's onHand -> + |quantity|
         // set bulkItem's awaiting -> - |awaiting|

         await client.request(UPDATE_SACHET_ITEM, {
            where: { id: { _eq: sachetItemId } },
            set: {
               awaiting:
                  sachetItemData.sachetItem.awaiting - Math.abs(quantity),
               onHand: sachetItemData.sachetItem.onHand + Math.abs(quantity)
            }
         })
         res.status(200).json({
            ok: true,
            message: 'sachet item updated'
         })
         return
      }
   } catch (error) {
      next(error)
   }
}
