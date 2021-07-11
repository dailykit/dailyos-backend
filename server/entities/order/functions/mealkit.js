import { client } from '../../../lib/graphql'

import { FETCH_SIMPLE_RECIPE_PRODUCT_OPTION } from '../graphql/queries'
import {
   CREATE_ORDER_SACHET,
   CREATE_ORDER_MEALKIT_PRODUCT
} from '../graphql/mutations'

export default async function (data) {
   const { orderId, product, productOption, comboProductId, modifier } = data
   try {
      const { createOrderMealKitProduct } = await client.request(
         CREATE_ORDER_MEALKIT_PRODUCT,
         {
            object: {
               orderId,
               assemblyStatus: 'PENDING',
               price: product.unitPrice,
               simpleRecipeId: productOption.simpleRecipeProduct.simpleRecipeId,
               simpleRecipeProductId: product.id,
               ...(comboProductId && { comboProductId }),
               simpleRecipeProductOptionId: product.option.id,
               packagingId: productOption.packagingId,
               ...(productOption.operationConfigId && {
                  assemblyStationId: productOption.operationConfig.stationId
               }),
               ...(productOption.operationConfigId && {
                  labelTemplateId: productOption.operationConfig.labelTemplateId
               }),
               instructionCardTemplateId:
                  productOption.instructionCardTemplateId,
               ...(product.customizableProductId && {
                  customizableProductId: product.customizableProductId
               }),
               ...(product.comboProductComponentId && {
                  comboProductComponentId: product.comboProductComponentId
               }),
               ...(product.customizableProductOptionId && {
                  customizableProductOptionId:
                     product.customizableProductOptionId
               }),
               ...(modifier && modifier.id && { orderModifierId: modifier.id }),
               ...(Array.isArray(product.modifiers) &&
                  product.modifiers.length > 0 && {
                     orderModifiers: {
                        data: product.modifiers.map(node => ({
                           data: node
                        }))
                     }
                  })
            }
         }
      )
      const variables = { id: product.option.id }
      const { simpleRecipeProductOption } = await client.request(
         FETCH_SIMPLE_RECIPE_PRODUCT_OPTION,
         variables
      )

      const { ingredientSachets } = simpleRecipeProductOption.simpleRecipeYield

      await Promise.all(
         ingredientSachets.map(async ({ ingredientSachet }) => {
            try {
               const {
                  id,
                  unit,
                  quantity,
                  ingredient,
                  ingredientProcessing,
                  liveModeOfFulfillment
               } = ingredientSachet

               await client.request(CREATE_ORDER_SACHET, {
                  object: {
                     unit: unit,
                     status: 'PENDING',
                     quantity: quantity,
                     ingredientSachetId: id,
                     ingredientName: ingredient.name,
                     orderMealKitProductId: createOrderMealKitProduct.id,
                     processingName: ingredientProcessing.processing.name,
                     ...(liveModeOfFulfillment && {
                        accuracy: liveModeOfFulfillment.accuracy,
                        bulkItemId: liveModeOfFulfillment.bulkItemId,
                        sachetItemId: liveModeOfFulfillment.sachetItemId,
                        packagingId: liveModeOfFulfillment.packagingId,
                        packingStationId: liveModeOfFulfillment.stationId,
                        ...(liveModeOfFulfillment.labelTemplateId
                           ? {
                                labelTemplateId:
                                   liveModeOfFulfillment.labelTemplateId
                             }
                           : { isLabelled: true })
                     })
                  }
               })
            } catch (error) {
               throw Error(error)
            }
         })
      )
      return
   } catch (error) {
      throw Error(error)
   }
}
