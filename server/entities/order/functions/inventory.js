import { client } from '../../../lib/graphql'

import { FETCH_INVENTORY_PRODUCT } from '../graphql/queries'
import {
   CREATE_ORDER_SACHET,
   CREATE_ORDER_INVENTORY_PRODUCT
} from '../graphql/mutations'

export default async function ({
   product,
   orderId,
   modifier = null,
   comboProductId = null
}) {
   try {
      const variables = { id: product.id, optionId: { _eq: product.option.id } }
      const { inventoryProduct } = await client.request(
         FETCH_INVENTORY_PRODUCT,
         variables
      )

      const [productOption] = inventoryProduct.inventoryProductOptions

      const totalQuantity = product.quantity
         ? product.quantity * productOption.quantity
         : productOption.quantity

      const operationConfig = {
         labelTemplateId: null,
         stationId: null
      }

      if (productOption.operationConfigId) {
         if ('labelTemplateId' in productOption.operationConfig) {
            operationConfig.labelTemplateId =
               productOption.operationConfig.labelTemplateId
         }
         if ('stationId' in productOption.operationConfig) {
            operationConfig.stationId = productOption.operationConfig.stationId
         }
      }

      const { createOrderInventoryProduct } = await client.request(
         CREATE_ORDER_INVENTORY_PRODUCT,
         {
            object: {
               orderId,
               quantity: totalQuantity,
               price: product.unitPrice,
               assemblyStatus: 'PENDING',
               inventoryProductId: product.id,
               ...(productOption.packagingId && {
                  packagingId: productOption.packagingId
               }),
               ...(productOption.instructionCardTemplateId && {
                  instructionCardTemplateId:
                     productOption.instructionCardTemplateId
               }),
               ...(operationConfig.stationId && {
                  assemblyStationId: operationConfig.stationId
               }),
               ...(operationConfig.labelTemplateId && {
                  labelTemplateId: operationConfig.labelTemplateId
               }),
               ...(comboProductId && { comboProductId }),
               inventoryProductOptionId: product.option.id,
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

      let unit = null
      let processingName = null
      let ingredientName = null

      if (inventoryProduct.sachetItemId) {
         unit = inventoryProduct.sachetItem.unit
         if (inventoryProduct.sachetItem.bulkItemId) {
            processingName =
               inventoryProduct.sachetItemId.bulkItem.processingName
            if (inventoryProduct.sachetItem.bulkItem.supplierItemId) {
               ingredientName =
                  inventoryProduct.sachetItem.bulkItem.supplierItem.name
            }
         }
      } else if (inventoryProduct.supplierItemId) {
         unit = inventoryProduct.supplierItem.unit
         ingredientName = inventoryProduct.supplierItem.name
      }

      const count = Array.from({ length: product.quantity }, (_, v) => v)
      await Promise.all(
         count.map(async () => {
            await client.request(CREATE_ORDER_SACHET, {
               object: {
                  unit,
                  processingName,
                  ingredientName,
                  status: 'PENDING',
                  quantity: productOption.quantity,
                  ...(operationConfig.stationId && {
                     packingStationId: operationConfig.stationId
                  }),
                  sachetItemId: inventoryProduct.sachetItemId,
                  ...(productOption.packagingId && {
                     packagingId: productOption.packagingId
                  }),
                  ...(operationConfig.labelTemplateId
                     ? {
                          labelTemplateId: operationConfig.labelTemplateId
                       }
                     : { isLabelled: true }),
                  orderInventoryProductId: createOrderInventoryProduct.id
               }
            })
         })
      )
      return
   } catch (error) {
      throw Error(error)
   }
}
