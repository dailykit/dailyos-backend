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
