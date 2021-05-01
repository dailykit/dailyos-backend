import { client } from '../../../../lib/graphql'
import {
   UPDATE_BULK_ITEM_HISTORY,
   UPDATE_PACKAGING,
   UPDATE_PACKAGING_HISTORY
} from '../../graphql/mutations'

export const updateBulktItemHistory = (bulkItemId, status) => {
   return client.request(UPDATE_BULK_ITEM_HISTORY, {
      bulkItemId,
      set: { status }
   })
}

export const updatePackagingHistoryStatus = (purchaseOrderId, status) => {
   return client.request(UPDATE_PACKAGING_HISTORY, {
      id: purchaseOrderId,
      set: { status }
   })
}

export const updatePackaging = (packagingId, set) => {
   return client.request(UPDATE_PACKAGING, {
      packagingId,
      set
   })
}

export const getCalculatedValue = (sourceUnit, targetUnit, conversions) => {
   try {
      const directCustomConversions = conversions.custom
      const otherCustomConversions = conversions.others.custom
      const otherStandardConversions = conversions.others.standard

      const allConversions = [
         ...Object.values(directCustomConversions),
         ...Object.values(otherCustomConversions),
         ...Object.values(otherStandardConversions)
      ]

      console.log(sourceUnit, targetUnit)
      console.log(allConversions)

      const result = allConversions.find(
         ({ toUnitName, fromUnitName }) =>
            toUnitName === targetUnit && fromUnitName === sourceUnit
      )

      if (result) {
         return { error: null, value: result.equivalentValue }
      }

      return { error: 'Not found!', value: null }
   } catch (error) {
      return { error: error.message, value: null }
   }
}
