import { client } from '../../lib/graphql'

import {
   CREATE_ORDER,
   CREATE_CUSTOMER,
   CREATE_ORDER_BILLING,
   FETCH_INVENTORY_PRODUCT,
   FETCH_SIMPLE_RECIPE_PRODUCT,
   CREATE_ORDER_MEALKIT_PRODUCT,
   CREATE_ORDER_INVENTORY_PRODUCT,
   CREATE_ORDER_READY_TO_EAT_PRODUCT,
   FETCH_SIMPLE_RECIPE_PRODUCT_OPTION,
} from '../../queries'

export const take = async (req, res) => {
   try {
      const {
         email,
         source,
         billing,
         currency,
         products,
         customerId,
         fulfillment,
         dailyKeyUserId,
      } = req.body

      let order = null
      if (customerId) {
         order = await client.request(CREATE_ORDER, {
            object: {
               customerId,
               orderStatus: 'PENDING',
               paymentStatus: billing.paymentStatus,
            },
         })
      } else {
         const customer = await client.request(CREATE_CUSTOMER, {
            object: {
               email,
               source,
               dailyKeyUserId,
            },
         })
         order = await client.request(CREATE_ORDER, {
            object: {
               customerId: customer.id,
               orderStatus: 'PENDING',
               paymentStatus: billing.paymentStatus,
            },
         })
      }

      /*
      const { tax, ...billingRest } = billing
      await client.request(CREATE_ORDER_BILLING, {
         ...tax,
         ...billingRest,
         orderId: order.id,
      })
      */

      await Promise.all(
         products.map(async ({ product, ...rest }) => {
            try {
               switch (product.type) {
                  case 'Simple Recipe': {
                     const {
                        simpleRecipeProduct: { simpleRecipe },
                     } = await client.request(FETCH_SIMPLE_RECIPE_PRODUCT, {
                        id: product.id,
                     })
                     if (product.option.type === 'Meal Kit') {
                        const {
                           createOrderMealKitProduct,
                        } = await client.request(CREATE_ORDER_MEALKIT_PRODUCT, {
                           object: {
                              ...rest,
                              assemblyStatus: 'PENDING',
                              orderId: order.createOrder.id,
                              simpleRecipeId: simpleRecipe.id,
                              simpleRecipeProductId: product.id,
                              simpleRecipeProductOptionId: product.option.id,
                              assemblyStationId: simpleRecipe.assemblyStationId,
                           },
                        })
                        const variables = { id: product.option.id }
                        const {
                           simpleRecipeProductOption,
                        } = await client.request(
                           FETCH_SIMPLE_RECIPE_PRODUCT_OPTION,
                           variables
                        )

                        const {
                           ingredientSachets,
                        } = simpleRecipeProductOption.simpleRecipeYield

                        await Promise.all(
                           ingredientSachets.map(
                              async ({ ingredientSachet }) => {
                                 try {
                                    const {
                                       id,
                                       unit,
                                       quantity,
                                       ingredient,
                                       ingredientProcessing,
                                    } = ingredientSachet

                                    await client.request(CREATE_ORDER_SACHET, {
                                       object: {
                                          unit: unit,
                                          status: 'PENDING',
                                          quantity: quantity,
                                          ingredientSachetId: id,
                                          orderMealKitProductId:
                                             createOrderMealKitProduct.id,
                                          ingredientName: ingredient.name,
                                          processingName:
                                             ingredientProcessing.processing
                                                .name,
                                       },
                                    })
                                 } catch (error) {
                                    throw Error(error)
                                 }
                              }
                           )
                        )
                        return
                     } else if (product.option.type === 'Ready To Eat') {
                        return client.request(
                           CREATE_ORDER_READY_TO_EAT_PRODUCT,
                           {
                              object: {
                                 ...rest,
                                 orderId: order.createOrder.id,
                                 simpleRecipeId: simpleRecipe.id,
                                 simpleRecipeProductId: product.id,
                                 simpleRecipeProductOptionId: product.option.id,
                                 assemblyStationId:
                                    simpleRecipe.assemblyStationId,
                              },
                           }
                        )
                     }
                  }
                  case 'Inventory': {
                     const variables = { id: product.id }
                     const { inventoryProduct } = await client.request(
                        FETCH_INVENTORY_PRODUCT,
                        variables
                     )
                     return client.request(CREATE_ORDER_INVENTORY_PRODUCT, {
                        object: {
                           ...rest,
                           assemblyStatus: 'PENDING',
                           orderId: order.createOrder.id,
                           inventoryProductId: product.id,
                           inventoryProductOptionId: product.option.id,
                           assemblyStationId:
                              inventoryProduct.assemblyStationId,
                        },
                     })
                  }
                  default:
                     throw Error('No such product type!')
               }
            } catch (error) {
               throw Error(error)
            }
         })
      )

      return res.status(200).json({
         data: order,
         success: true,
      })
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}
