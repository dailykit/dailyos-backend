export const UPDATE_MODE = `
   mutation UpdateModeOfFulFillment(
      $id: Int!
      $set: ingredient_modeOfFulfillment_set_input
   ) {
      updateModeOfFulfillment(pk_columns: { id: $id }, _set: $set) {
         id
      }
   }
`

export const UPDATE_INGREDIENT_SACHET = `
   mutation UpdateIngredientSachet(
      $id: Int!
      $set: ingredient_ingredientSachet_set_input
   ) {
      updateIngredientSachet(where: { id: { _eq: $id } }, _set: $set) {
         returning {
            liveMOF
            id
         }
      }
   }
`
