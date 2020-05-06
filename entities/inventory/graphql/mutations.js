export const CREATE_SACHET_ITEM_HISTORY = `
   mutation CreatSachetItemHistory ($sachetItemId: Int!, $quantity: Int!, $status: String!, orderSachetId: Int! ) {
      createSachetItemHistory (objects:{sachetItemId: $sachetItemId, quantity: $quantity, status: $status, orderSachetId: $orderSachetId}) {
      returning {
         id
      }
      }
   }
`

export const CREATE_BULK_ITEM_HISTORY_FOR_ORDER_SACHET_ID = `
mutation CreateBulkItemHistory ($bulkItemId: Int!, $quantity: Int!, $status: String!, $orderSachetId: Int! ) {
   createSachetItemHistory (objects:{bulkItemId: $bulkItemId, quantity: $quantity, status: $status, orderSachetId: $orderSachetId}) {
   returning {
      id
   }
   }
}
`

export const CREATE_BULK_ITEM_HISTORY_FOR_BULK_WORK_ORDER = `
mutation CreateBulkItemHistory ($bulkItemId: Int!, $quantity: Int!, $status: String!, $bulkWorkOrderId: Int! ) {
   createSachetItemHistory (objects:{bulkItemId: $bulkItemId, quantity: $quantity, status: $status, bulkWorkOrderId: $bulkWorkOrderId}) {
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
