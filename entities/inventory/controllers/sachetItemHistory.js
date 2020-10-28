import { client } from '../../../lib/graphql'
import { UPDATE_SACHET_ITEM } from '../graphql/mutations'
import { GET_SACHET_ITEM } from '../graphql/queries'

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
