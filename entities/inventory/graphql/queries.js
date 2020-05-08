export const GET_BULK_ITEM = `
   query BulkItem($id: Int!) {
      bulkItem(id: 2) {
         onHand
         awaiting
         committed
      }
   }
`
export const GET_BULK_ITEM_HISTORIES_WITH_BULK_WORK_ORDER_ID = `
   query BulkItemHistories ($bulkWorkOrderId){
      bulkItemHistories(where: {bulkWorkOrderId: {_eq: $bulkWorkOrderId}}) {
         id
         status
         quantity
      }
   }
`

export const GET_BULK_ITEM_HISTORIES_WITH_SACHET_WORK_ORDER_ID = `
   query BulkItemHistories ($sachetWorkOrderId){
      bulkItemHistories(where: {sachetWorkOrderId: {_eq: $sachetWorkOrderId}}) {
         id
         status
         quantity
      }
   }
`

export const GET_SACHET_ITEM_HISTORIES = `
   query SachetItemHistories ($sachetWorkOrderId){
   sachetItemHistories(where: {sachetWorkOrderId: {_eq: $sachetWorkOrderId}}) {
      id
      quantity
      status
   }
}
`
