export const INGREDIENT_SACHET = `
   query IngredientSachet($id: Int!) {
      ingredientSachet(id: $id) {
         liveMOF
         modeOfFulfillments(where: { isPublished: { _eq: true }, isLive: { _eq: true }, isArchived: { _eq: false } }) {
            id
            position
            isLive
            isPublished
         }
      }
   }
`
