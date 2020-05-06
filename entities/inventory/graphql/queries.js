export const GET_BULK_ITEM = `
   query BulkItem ($id: Int!) {
      bulkItem(id: 2) {
         onHand
         awaiting
         committed
      }
   }

`
export const GET_BULK_ITEM_HISTORIES = `



`
