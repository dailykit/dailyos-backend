export const CREATE_SACHET_ITEM_HISTORY = `
   mutation CreatSachetItemHistory ($object!) {
      createSachetItemHistory (objects: $object) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_SACHET_ITEM_HISTORY_WITH_SACHET_WORK_ORDER_ID = `
   mutation UpdateSachetItemHistory ($sachetWorkOrderId: Int, $set) {
      updateSachetItemHistory(
         where: { sachetWorkOrderId: $sachetWorkOrderId }
         _set: $set
      ) {
         affected_rows
      }
   }
`

export const CREATE_BULK_ITEM_HISTORY = `
   mutation CreateBulkItemHistory(
      $object
   ) {
      createSachetItemHistory(
         objects: $object
      ) {
         returning {
            id
         }
      }
   }                 
`

export const CREATE_BULK_ITEM_HISTORY_FOR_ORDER_SACHET_ID = `
   mutation CreateBulkItemHistory(
      $bulkItemId: Int!
      $quantity: Int!
      $status: String!
      $orderSachetId: Int!
   ) {
      createSachetItemHistory(
         objects: {
            bulkItemId: $bulkItemId
            quantity: $quantity
            status: $status
            orderSachetId: $orderSachetId
         }
      ) {
         returning {
            id
         }
      }
   }
`

export const CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER = `
   mutation CreateBulkItemHistory(
      $bulkItemId: Int!
      $quantity: Int!
      $status: String!
      $bulkWorkOrderId: Int!
   ) {
      createBulkItemHistory(
         objects: {
            bulkItemId: $bulkItemId
            quantity: $quantity
            status: $status
            bulkWorkOrderId: $bulkWorkOrderId
         }
      ) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_BULK_ITEM = `
   mutation UpdateBulkItem ($where, $set){
      updateBulkItem (where: $where, _set: $set) {
      affected_rows 
      returning {
         id
      }
      }
   }
`
export const UPDATE_BULK_ITEM_HISTORY = `
   mutation UpdateBulkItemHistory($bulkItemId: Int!, $set) {
      updateBulkItemHistory(where: {bulkItemId:{_eq: $bulkItemId}}, _set: $set) {
         affected_rows
         returning {
            id
         }
      }
   }
`

export const UPDATE_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID = `
   mutation UpdateBulkItemHistory ($bulkWorkOrderId: Int!, $set) {
      updateBulkItemHistory(
         where: { bulkWorkOrderId: { _eq: $bulkWorkOrderId } }
         _set: $set
      ) {
         affected_rows
      }
   }
`

export const UPDATE_BULK_ITEM_HISTORY_WITH_SACHET_ORDER_ID = `
   mutation UpdateBulkItemHistory ($sachetWorkOrderId: Int!, $set) {
      updateBulkItemHistory(
         where: { sachetWorkOrderId: { _eq: $sachetWorkOrderId } }
         _set: $set
      ) {
         affected_rows
      }
   }
`
