export const CREATE_SACHET_ITEM_HISTORY = `
   mutation CreatSachetItemHistory ($objects: [inventory_sachetItemHistory_insert_input!]!) {
      createSachetItemHistory (objects: $objects) {
         returning {
            id
         }
      }
   }
`

export const UPDATE_SACHET_ITEM_HISTORY_WITH_SACHET_WORK_ORDER_ID = `
   mutation UpdateSachetItemHistory(
      $sachetWorkOrderId: Int!
      $set: inventory_sachetItemHistory_set_input!
   ) {
      updateSachetItemHistory(
         where: { sachetWorkOrderId: { _eq: $sachetWorkOrderId } }
         _set: $set
      ) {
         affected_rows
      }
   }
`

export const UPDATE_SACHET_ITEM_HISTORY = `
   mutation UpdateSachetItemHistory(
      $where: inventory_sachetItemHistory_bool_exp!
      $set: inventory_sachetItemHistory_set_input!
   ) {
      updateSachetItemHistory(
         where: $where
         _set: $set
      ) {
         affected_rows
      }
   }
`

export const CREATE_BULK_ITEM_HISTORY = `
   mutation CreateBulkItemHistory(
      $objects: [inventory_bulkItemHistory_insert_input!]!
   ) {
      createBulkItemHistory(
         objects: $objects
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
      $quantity: numeric!
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
   mutation UpdateBulkItem ($where: inventory_bulkItem_bool_exp!, $set: inventory_bulkItem_set_input){
      updateBulkItem (where: $where, _set: $set) {
      affected_rows 
      returning {
         id
      }
      }
   }
`
export const UPDATE_BULK_ITEM_HISTORY = `
   mutation UpdateBulkItemHistory($bulkItemId: Int!, $set: inventory_bulkItemHistory_set_input) {
      updateBulkItemHistory(where: {bulkItemId:{_eq: $bulkItemId}}, _set: $set) {
         affected_rows
         returning {
            id
         }
      }
   }
`

export const UPDATE_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID = `
   mutation UpdateBulkItemHistory ($bulkWorkOrderId: Int!, $set: inventory_bulkItemHistory_set_input) {
      updateBulkItemHistory(
         where: { bulkWorkOrderId: { _eq: $bulkWorkOrderId } }
         _set: $set
      ) {
         affected_rows
      }
   }
`

export const UPDATE_BULK_ITEM_HISTORY_WITH_SACHET_ORDER_ID = `
   mutation UpdateBulkItemHistory ($sachetWorkOrderId: Int!, $set: inventory_bulkItemHistory_set_input) {
      updateBulkItemHistory(
         where: { sachetWorkOrderId: { _eq: $sachetWorkOrderId } }
         _set: $set
      ) {
         affected_rows
      }
   }
`

export const UPDATE_SACHET_ITEM = `
   mutation UpdateSachetItem(
      $where: inventory_sachetItem_bool_exp!
      $set: inventory_sachetItem_set_input
   ) {
      updateSachetItem(where: $where, _set: $set) {
         affected_rows
         returning {
            id
         }
      }
   }
`
