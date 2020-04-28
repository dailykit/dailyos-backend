export const CREATE_ORDER_INVENTORY_PRODUCT = `
mutation createOrderInventoryProduct($object: order_orderInventoryProduct_insert_input!){
   createOrderInventoryProduct(object: $object) {
      id
   }
}
`
