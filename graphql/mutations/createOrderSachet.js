export const CREATE_ORDER_SACHET = `
   mutation createOrderSachet($object: order_orderSachet_insert_input!){
      createOrderSachet(object: $object){
         id
      }
   }
`
