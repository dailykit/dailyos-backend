export const CREATE_ORDER_MEALKIT_PRODUCT = `
   mutation createOrderMealKitProduct($object: order_orderMealKitProduct_insert_input!){
      createOrderMealKitProduct(object: $object) {
         id
      }
   }
`
