export const FETCH_INVENTORY_PRODUCT = `
   query inventoryProduct($id: Int!){
      inventoryProduct(id: $id) {
         id
         assemblyStationId
      }
   }      
`

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

export const FETCH_SIMPLE_RECIPE_PRODUCT_OPTION = `
   query simpleRecipeProductOption($id: Int!){
      simpleRecipeProductOption(id: $id) {
         id
         simpleRecipeYield {
            yield
            ingredientSachets {
               ingredientSachet {
                  id
                  unit
                  quantity
                  ingredient {
                     name
                  }
                  ingredientProcessing {
                     processing {
                        name
                     }
                  }
               }
            }
         }
      }
   }
`
