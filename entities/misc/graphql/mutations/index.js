export const UPDATE_CART = `
   mutation updateCart($id: Int!, $set: order_cart_set_input) {
      updateCart(pk_columns: { id: $id }, _set: $set) {
         id
      }
   }
`
