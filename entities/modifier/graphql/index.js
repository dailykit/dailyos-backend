export const QUERIES = {
   PRODUCT: {
      INVENTORY: {
         OPTION: `
            query inventoryProductOption($id: Int!) {
               inventoryProductOption(id: $id) {
                  inventoryProduct {
                     cartItem(args: { optionId: $id })
                  }
               }
            }
         `
      },
      SIMPLE_RECIPE: {
         OPTION: `
            query simpleRecipeProductOption($id: Int!) {
               simpleRecipeProductOption(id: $id) {
                  simpleRecipeProduct {
                     cartItem(args: { optionId: $id })
                  }
               }
            }
         `
      }
   },
   ORDER: {
      PRODUCT: {
         INVENTORY: `
            query orderInventoryProduct($id: Int!) {
               orderInventoryProduct(id: $id) {
                  id
                  orderId
               }
            }
         `,
         MEAL_KIT: `
            query orderMealKitProduct($id: Int!) {
               orderMealKitProduct(id: $id) {
                  id
                  orderId
               }
            }
         `,
         READY_TO_EAT: `
            query orderReadyToEatProduct($id: Int!) {
               orderReadyToEatProduct(id: $id) {
                  id
                  orderId
               }
            }
         `
      }
   },
   ITEM: {
      SACHET: `
         query sachetItem($id: Int!) {
            sachetItem(id: $id) {
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
         }
      `,
      BULK: `
         query bulkItem($id: Int!) {
            bulkItem(id: $id) {
               id
               unit
               processingName
               supplierItemId
               supplierItem {
                  id
                  name
               }
            }
         }
      `,
      SUPPLIER: `
         query supplierItem($id: Int!) {
            supplierItem(id: $id) {
               id
               name
               unit
               bulkItemAsShippedId
               bulkItemAsShipped {
                  id
                  processingName
               }
            }
         }
      `
   },
   OPERATION_CONFIG: `
      query operationConfig($id: Int!) {
         operationConfig: settings_operationConfig_by_pk(id: $id) {
            stationId
            labelTemplateId
         }
      }
   `
}

export const MUTATIONS = {
   ORDER: {
      SACHET: `
         mutation createOrderSachet($object: order_orderSachet_insert_input!) {
            createOrderSachet(object: $object) {
               id
            }
         }
      `
   }
}
