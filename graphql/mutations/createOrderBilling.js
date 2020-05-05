export const CREATE_ORDER_BILLING = `
   mutation createOrderBilling($object: order_orderBilling_insert_input!) {
      createOrderBilling(object: $object) {
         id
      }
   }
`
