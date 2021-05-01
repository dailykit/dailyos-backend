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
      let allConversions = []

      const directCustomConversions = conversions.custom
      const directStandardConversions = conversions.standard
      const otherCustomConversions = conversions.others
         ? conversions.others.custom
         : null
      const otherStandardConversions = conversions.others
         ? conversions.others.standard
         : null

      if (directCustomConversions) {
         allConversions = [
            ...allConversions,
            ...Object.values(directCustomConversions)
         ]
      }
      if (directStandardConversions) {
         allConversions = [
            ...allConversions,
            ...Object.values(directStandardConversions)
         ]
      }
      if (otherCustomConversions) {
         allConversions = [
            ...allConversions,
            ...Object.values(otherCustomConversions)
         ]
      }
      if (otherStandardConversions) {
         allConversions = [
            ...allConversions,
            ...Object.values(otherStandardConversions)
         ]
      }

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
