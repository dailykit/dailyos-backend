export const FETCH_INVENTORY_PRODUCT = `
   query inventoryProduct($id: Int!, $optionId: Int_comparison_exp!) {
      inventoryProduct(id: $id) {
         id
         assemblyStationId
         inventoryProductOptions(where: {id: $optionId}) {
            quantity
         }
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

export const FETCH_CART = `
   query cartByPK($id: Int!) {
      cartByPK(id: $id) {
         id
         tip
         tax
         amount
         status
         address
         cartInfo
         orderId
         isValid
         taxPercent
         totalPrice
         itemTotal
         created_at
         customerId
         customerInfo
         transactionId
         deliveryPrice
         paymentStatus
         fulfillmentInfo
         paymentMethodId
         stripeCustomerId
         transactionRemark
      }
   }
`
