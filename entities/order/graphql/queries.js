export const FETCH_INVENTORY_PRODUCT = `
   query inventoryProduct($id: Int!, $optionId: Int_comparison_exp!) {
      inventoryProduct(id: $id) {
         id
         sachetItemId
         sachetItem {
            id
            unit
            bulkItemId
            bulkItem {
               id
               processingName
               supplierItemId
               supplierItem {
                 id
                 name
               }
            }
         }
         supplierItemId
         supplierItem {
            id
            name
            unit
         }
         inventoryProductOptions(where: { id: $optionId }) {
            quantity
            packagingId
            instructionCardTemplateId
            operationConfigId
            operationConfig {
               stationId
               labelTemplateId
            }            
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
         instructionCardTemplateId
         operationConfigId
         operationConfig {
            stationId
            labelTemplateId
         }            
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
         brandId
         cartInfo
         orderId
         isValid
         cartSource
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

export const BRAND_ON_DEMAND_SETTING = `
   query brand($id: Int!) {
      brand(id: $id) {
         brand: onDemandSettings(
            where: { onDemandSetting: { identifier: { _eq: "Brand Name" } } }
         ) {
            value
         }
         address: onDemandSettings(
            where: { onDemandSetting: { identifier: { _eq: "Location" } } }
         ) {
            value
         }
         contact: onDemandSettings(
            where: { onDemandSetting: { identifier: { _eq: "Contact" } } }
         ) {
            value
         }
         email: onDemandSettings(where: {onDemandSetting: {identifier: {_eq: "Email Notification"}}}) {
           value
         }
      }
   }
`

export const BRAND_SUBSCRIPTION_SETTING = `
   query brand($id: Int!) {
      brand(id: $id) {
         brand: subscriptionStoreSettings(
            where: {
               subscriptionStoreSetting: { identifier: { _eq: "theme-brand" } }
            }
         ) {
            value
         }
         address: subscriptionStoreSettings(
            where: {
               subscriptionStoreSetting: { identifier: { _eq: "Location" } }
            }
         ) {
            value
         }
         contact: subscriptionStoreSettings(
            where: {
               subscriptionStoreSetting: { identifier: { _eq: "Contact" } }
            }
         ) {
            value
         }
         email: subscriptionStoreSettings(where: {subscriptionStoreSetting: {identifier: {_eq: "Email Notification"}}}) {
            value
         }
      }
   }
`

export const EMAIL_CONFIG = `
   query brand($id: Int!) {
      brand(id: $id) {
         email: onDemandSettings(
            where: {
               onDemandSetting: { identifier: { _eq: "Email Notification" } }
            }
         ) {
            name: value(path: "name")
            email: value(path: "email")
            template: value(path: "template")
         }
      }
   }
`
