export const INGREDIENT_SACHET = `
   query IngredientSachet($id: Int!) {
      ingredientSachet(id: $id) {
         liveMOF
         modeOfFulfillments(where: { isArchived: { _eq: false } }) {
            id
            position
            isLive
            isPublished
         }
      }
   }
`
