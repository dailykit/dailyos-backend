export const FETCH_INVENTORY_PRODUCT = `
   query inventoryProduct($id: Int!, $optionId: Int_comparison_exp!) {
      inventoryProduct(id: $id) {
         id
         assemblyStationId
         inventoryProductOptions(where: {id: $optionId}) {
            quantity
            packagingId
            labelTemplateId
            assemblyStationId
            instructionCardTemplateId
         }
      }
   }    
`

export const FETCH_SIMPLE_RECIPE_PRODUCT = `
   query simpleRecipeProductOption($id: Int!) {
      simpleRecipeProductOption(id: $id) {
         id
         simpleRecipeProduct {
            simpleRecipeId
         }
         packagingId
         labelTemplateId
         assemblyStationId
         instructionCardTemplateId
      }
   }
`

export const FETCH_SIMPLE_RECIPE_PRODUCT_OPTION = `
   query simpleRecipeProductOption($id: Int!) {
      simpleRecipeProductOption(id: $id) {
         id
         simpleRecipeYield {
            yield
            ingredientSachets {
               ingredientSachet {
                  id
                  unit
                  quantity
                  liveModeOfFulfillment {
                     id
                     accuracy
                     bulkItemId
                     sachetItemId
                     packagingId
                     stationId
                     labelTemplateId
                  }
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

export const ORGANIZATION = `
   query organization {
      brand: storeSettings(where: {identifier: {_eq: "Brand Name"}}) {
         id
         type
         value
         identifier
      }
      address: storeSettings(where: {identifier: {_eq: "Location"}}) {
         id
         type
         value
         identifier
      }
      contact: storeSettings(where: {identifier: {_eq: "Contact"}}) {
         id
         type
         value
         identifier
      }
   }
`
