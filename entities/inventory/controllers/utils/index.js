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

export const updatePackagingHistoryStatus = (packagingId, status) => {
   return client.request(UPDATE_PACKAGING_HISTORY, {
      packagingId,
      set: { status }
   })
}

export const updatePackaging = (packagingId, set) => {
   return client.request(UPDATE_PACKAGING, {
      packagingId,
      set
   })
}
