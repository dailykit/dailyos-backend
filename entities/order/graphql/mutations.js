export const CREATE_CUSTOMER = `
   mutation createCustomer($object: crm_customer_insert_input!) {
      createCustomer(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER = `
   mutation createOrder($object: order_order_insert_input!) {
      createOrder(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_INVENTORY_PRODUCT = `
   mutation createOrderInventoryProduct($object: order_orderInventoryProduct_insert_input!){
      createOrderInventoryProduct(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_MEALKIT_PRODUCT = `
   mutation createOrderMealKitProduct($object: order_orderMealKitProduct_insert_input!){
      createOrderMealKitProduct(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_READY_TO_EAT_PRODUCT = `
   mutation createOrderReadyToEatProduct($object: order_orderReadyToEatProduct_insert_input!){
      createOrderReadyToEatProduct(object: $object) {
         id
      }
   }
`

export const CREATE_ORDER_SACHET = `
   mutation createOrderSachet($object: order_orderSachet_insert_input!){
      createOrderSachet(object: $object){
         id
      }
   }
`

export const UPDATE_CART = `
   mutation updateCart($id: Int_comparison_exp!, $orderId: Int!, $status: String!) {
      updateCart(where: {id: $id}, _set: {orderId: $orderId, status: $status}) {
      returning {
            id
         }
      }
   }
`
