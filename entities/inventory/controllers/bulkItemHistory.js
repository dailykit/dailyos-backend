import { StatusCodes } from 'http-status-codes'
import { client } from '../../../lib/graphql'
import {
   UPDATE_BULK_ITEM,
   UPDATE_BULK_ITEM_HISTORY_WITH_ID
} from '../graphql/mutations'
import { GET_BULK_ITEM } from '../graphql/queries'
import { getCalculatedValue } from './utils'

// Done
// test -> passes
export const handleBulkItemHistory = async (req, res, next) => {
   try {
      const { bulkItemId, quantity, status, unit, id } = req.body.event.data.new
      const oldBulkItem = req.body.event.data.old

      // fetch the bulkItem (with id === bulkItemId)
      const bulkItemData = await client.request(GET_BULK_ITEM, {
         id: bulkItemId,
         from: unit,
         quantity: quantity
      })

      console.log(bulkItemData)

      // handle unit conversion
      const [conversions] = bulkItemData.bulkItem.unit_conversions
      const { error, value: calculatedQuantity } = getCalculatedValue(
         unit,
         bulkItemData.bulkItem.unit,
         conversions.data.result
      )

      if (error) {
         await client.request(UPDATE_BULK_ITEM_HISTORY_WITH_ID, {
            id,
            set: {
               isResolved: false
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'Failed to resolve units!'
         })
         return
      }

      // conversion found
      await client.request(UPDATE_BULK_ITEM_HISTORY_WITH_ID, {
         id,
         set: {
            isResolved: true
         }
      })

      if (
         status === 'CANCELLED' &&
         oldBulkItem &&
         oldBulkItem.status === 'PENDING'
      ) {
         if (calculatedQuantity < 0) {
            // set bulkItem's committed -> - |quantity|
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  committed:
                     bulkItemData.bulkItem.committed -
                     Math.abs(calculatedQuantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
            return
         }

         if (calculatedQuantity > 0) {
            // set bulkItem's awaiting -> - |quantity|
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  awaiting:
                     bulkItemData.bulkItem.awaiting -
                     Math.abs(calculatedQuantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
            return
         }
      }

      if (
         status === 'CANCELLED' &&
         oldBulkItem &&
         oldBulkItem.status === 'COMPLETED'
      ) {
         if (calculatedQuantity < 0) {
            // set bulkItem's committed -> - |quantity|
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand:
                     bulkItemData.bulkItem.onHand +
                     Math.abs(calculatedQuantity),
                  consumed:
                     bulkItemData.bulkItem.consumed -
                     Math.abs(calculatedQuantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
            return
         }

         if (calculatedQuantity > 0) {
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand:
                     bulkItemData.bulkItem.onHand - Math.abs(calculatedQuantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
            return
         }
      }

      if (
         status === 'PENDING' &&
         oldBulkItem &&
         oldBulkItem.status === 'COMPLETED'
      ) {
         if (calculatedQuantity > 0) {
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand:
                     bulkItemData.bulkItem.onHand -
                     Math.abs(calculatedQuantity),
                  awaiting:
                     bulkItemData.bulkItem.awaiting +
                     Math.abs(calculatedQuantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
            return
         }

         if (calculatedQuantity < 0) {
            await client.request(UPDATE_BULK_ITEM, {
               where: { id: { _eq: bulkItemId } },
               set: {
                  onHand:
                     bulkItemData.bulkItem.onHand +
                     Math.abs(calculatedQuantity),
                  consumed:
                     bulkItemData.bulkItem.consumed -
                     Math.abs(calculatedQuantity),
                  committed:
                     bulkItemData.bulkItem.committed +
                     Math.abs(calculatedQuantity)
               }
            })
            res.status(StatusCodes.OK).json({
               ok: true,
               message: 'bulk item updated'
            })
            return
         }
      }

      if (status === 'PENDING' && calculatedQuantity < 0) {
         // update bulkItem's commited field -> +|quantity|
         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               committed:
                  bulkItemData.bulkItem.committed + Math.abs(calculatedQuantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
         return
      }

      if (status === 'COMPLETED' && calculatedQuantity < 0) {
         // set bulkItem' commited -> - |quantity|
         //               on-hand -> - |quantity|
         //               consumed -> + |quantity|

         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               committed:
                  bulkItemData.bulkItem.committed -
                  Math.abs(calculatedQuantity),
               onHand:
                  bulkItemData.bulkItem.onHand - Math.abs(calculatedQuantity),
               consumed:
                  bulkItemData.bulkItem.consumed + Math.abs(calculatedQuantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })

         return
      }

      if (status === 'PENDING' && calculatedQuantity > 0) {
         // set bulkItem's awaiting -> + |quantity|
         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               awaiting:
                  bulkItemData.bulkItem.awaiting + Math.abs(calculatedQuantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
         return
      }

      if (status === 'COMPLETED' && calculatedQuantity > 0) {
         // set bulkItem's onHand -> + |quantity|
         // set bulkItem's awaiting -> - |awaiting|

         await client.request(UPDATE_BULK_ITEM, {
            where: { id: { _eq: bulkItemId } },
            set: {
               awaiting:
                  bulkItemData.bulkItem.awaiting - Math.abs(calculatedQuantity),
               onHand:
                  bulkItemData.bulkItem.onHand + Math.abs(calculatedQuantity)
            }
         })
         res.status(StatusCodes.OK).json({
            ok: true,
            message: 'bulk item updated'
         })
         return
      }
   } catch (error) {
      console.log(error)
      next(error)
   }
}
