export const FETCH_SIMPLE_RECIPE_PRODUCT = `
   query simpleRecipeProduct($id: Int!){
      simpleRecipeProduct(id: $id) {
         simpleRecipe {
            id
            assemblyStationId
         }
      }
   }
`
