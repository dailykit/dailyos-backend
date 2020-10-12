export const UPDATE_CART = `
   mutation UpdateCart($id: Int!, $set: crm_orderCart_set_input) {
      updateCartByPK(pk_columns: { id: $id }, _set: $set) {
         id
      }
   }
`
