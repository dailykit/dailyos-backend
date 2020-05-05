export const CREATE_ORDER = `
   mutation createOrder($object: order_order_insert_input!) {
      createOrder(object: $object) {
         id
      }
   }
`
