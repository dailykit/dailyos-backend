export const INGREDIENT_SACHET = `
   query IngredientSachet($id: Int!) {
      ingredientSachet(id: $id) {
         liveMOF
         modeOfFulfillments {
            id
            priority
            isLive
            isPublished
         }
      }
   }
`
