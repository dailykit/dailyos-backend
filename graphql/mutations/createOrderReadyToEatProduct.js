export const CREATE_ORDER_READY_TO_EAT_PRODUCT = `
   mutation createOrderReadyToEatProduct($object: order_orderReadyToEatProduct_insert_input!){
      createOrderReadyToEatProduct(object: $object) {
         id
      }
   }
`
