import { client } from '../../lib/graphql'
import { QUERIES, MUTATIONS } from './graphql'
import { processInventory, processSimpleRecipe } from '../order/controllers'

export const handle = async (req, res) => {
   try {
      const OPERATION = req.body.event.op

      if (['INSERT', 'MANUAL'].includes(OPERATION)) {
         const modifier = req.body.event.data.new

         let orderId = null
         let productKey = null

         if (modifier.orderInventoryProductId) {
            const { orderInventoryProduct } = await client.request(
               QUERIES.ORDER.PRODUCT.INVENTORY,
               {
                  id: modifier.orderInventoryProductId
               }
            )
            orderId = orderInventoryProduct.orderId
            productKey = 'orderInventoryProductId'
         } else if (modifier.orderMealKitProductId) {
            const { orderMealKitProduct } = await client.request(
               QUERIES.ORDER.PRODUCT.MEAL_KIT,
               {
                  id: modifier.orderMealKitProductId
               }
            )
            orderId = orderMealKitProduct.orderId
            productKey = 'orderMealKitProductId'
         } else if (modifier.orderReadyToEatProductId) {
            const { orderReadyToEatProduct } = await client.request(
               QUERIES.ORDER.PRODUCT.READY_TO_EAT,
               {
                  id: modifier.orderReadyToEatProductId
               }
            )
            orderId = orderReadyToEatProduct.orderId
            productKey = 'orderReadyToEatProductId'
         }

         switch (modifier.data.productType) {
            case 'inventoryProductOption':
               await processInventoryProduct({
                  data: modifier.data,
                  orderId,
                  modifier
               })
               break
            case 'simpleRecipeProductOption':
               await processSimpleRecipeProduct({
                  data: modifier.data,
                  orderId,
                  modifier
               })
               break
            case 'sachetItem':
               await processSachetItem({
                  data: modifier.data,
                  orderId,
                  modifier,
                  productKey
               })
               break
            case 'bulkItem':
               await processBulkItem({
                  data: modifier.data,
                  orderId,
                  modifier,
                  productKey
               })
               break
            case 'supplierItem':
               await processSupplierItem({
                  data: modifier.data,
                  orderId,
                  modifier,
                  productKey
               })
               break
            default:
               throw Error('Unkown product type!')
         }

         return res.status(200).json({
            success: true
         })
      }
      throw Error('This operation is not mapped yet!')
   } catch (error) {
      console.log('error', error)
      return res.status(404).json({ success: false, error: error.message })
   }
}

const processInventoryProduct = async ({ data, orderId, modifier }) => {
   try {
      const { inventoryProductOption } = await client.request(
         QUERIES.PRODUCT.INVENTORY.OPTION,
         { id: data.productId }
      )
      const { inventoryProduct } = inventoryProductOption
      const { cartItem } = inventoryProduct

      cartItem.totalPrice = data.price
      cartItem.unitPrice = data.price
      cartItem.image = data.image
      cartItem.quantity = data.quantity
      cartItem.discount = data.discount
      cartItem.modifiers = []
      await processInventory({ product: cartItem, orderId, modifier })
   } catch (error) {
      throw Error(error)
   }
}

const processSimpleRecipeProduct = async ({ data, orderId, modifier }) => {
   try {
      const { simpleRecipeProductOption } = await client.request(
         QUERIES.PRODUCT.SIMPLE_RECIPE.OPTION,
         { id: data.productId }
      )
      const { simpleRecipeProduct } = simpleRecipeProductOption
      const { cartItem } = simpleRecipeProduct

      cartItem.totalPrice = data.price
      cartItem.unitPrice = data.price
      cartItem.image = data.image
      cartItem.quantity = data.quantity
      cartItem.discount = data.discount
      cartItem.modifiers = []
      await processSimpleRecipe({ product: cartItem, orderId, modifier })
   } catch (error) {
      throw Error(error)
   }
}

const processSachetItem = async ({ data, modifier, productKey }) => {
   try {
      const { sachetItem } = await client.request(QUERIES.ITEM.SACHET, {
         id: data.productId
      })

      let ingredientName = null
      let processingName = null
      if (sachetItem.bulkItemId) {
         processingName = sachetItem.bulkItem.processingName
         if (sachetItem.bulkItem.supplierItemId) {
            ingredientName = sachetItem.bulkItem.supplierItem.name
         }
      }

      const config = {
         labelTemplateId: null,
         stationId: null
      }

      if ('operationConfigId' in modifier && modifier.operationConfigId) {
         const { operationConfig } = await client.request(
            QUERIES.OPERATION_CONFIG,
            {
               id: modifier.operationConfigId
            }
         )
         if (operationConfig && Object.keys(operationConfig).length > 0) {
            config.labelTemplateId = operationConfig.labelTemplateId
            config.stationId = operationConfig.stationId
         }
      }

      await client.request(MUTATIONS.ORDER.SACHET, {
         object: {
            processingName,
            ingredientName,
            status: 'PENDING',
            isModifier: true,
            packagingId: null,
            unit: sachetItem.unit,
            quantity: data.quantity,
            sachetItemId: sachetItem.id,
            [productKey]: modifier[productKey],
            ...(config.stationId && {
               packingStationId: config.stationId
            }),
            ...(config.labelTemplateId && {
               labelTemplateId: config.labelTemplateId
            })
         }
      })
   } catch (error) {
      throw Error(error)
   }
}

const processBulkItem = async ({ data, modifier, productKey }) => {
   try {
      const { bulkItem } = await client.request(QUERIES.ITEM.BULK, {
         id: data.productId
      })

      let ingredientName = null
      let processingName = bulkItem.processingName

      if (bulkItem.supplierItemId) {
         ingredientName = bulkItem.supplierItem.name
      }

      const config = {
         labelTemplateId: null,
         stationId: null
      }

      if ('operationConfigId' in modifier && modifier.operationConfigId) {
         const { operationConfig } = await client.request(
            QUERIES.OPERATION_CONFIG,
            {
               id: modifier.operationConfigId
            }
         )
         if (operationConfig && Object.keys(operationConfig).length > 0) {
            config.labelTemplateId = operationConfig.labelTemplateId
            config.stationId = operationConfig.stationId
         }
      }

      await client.request(MUTATIONS.ORDER.SACHET, {
         object: {
            processingName,
            ingredientName,
            status: 'PENDING',
            isModifier: true,
            packagingId: null,
            unit: bulkItem.unit,
            bulkItemId: bulkItem.id,
            quantity: data.quantity,
            [productKey]: modifier[productKey],
            ...(config.stationId && {
               packingStationId: config.stationId
            }),
            ...(config.labelTemplateId && {
               labelTemplateId: config.labelTemplateId
            })
         }
      })
   } catch (error) {
      throw Error(error)
   }
}

const processSupplierItem = async ({ data, modifier, productKey }) => {
   try {
      const { supplierItem } = await client.request(QUERIES.ITEM.SUPPLIER, {
         id: data.productId
      })

      let ingredientName = supplierItem.name
      let processingName = null

      if (supplierItem.bulkItemAsShippedId) {
         processingName = supplierItem.bulkItemAsShipped.processingName
      }

      const config = {
         labelTemplateId: null,
         stationId: null
      }

      if ('operationConfigId' in modifier && modifier.operationConfigId) {
         const { operationConfig } = await client.request(
            QUERIES.OPERATION_CONFIG,
            {
               id: modifier.operationConfigId
            }
         )
         if (operationConfig && Object.keys(operationConfig).length > 0) {
            config.labelTemplateId = operationConfig.labelTemplateId
            config.stationId = operationConfig.stationId
         }
      }

      await client.request(MUTATIONS.ORDER.SACHET, {
         object: {
            processingName,
            ingredientName,
            status: 'PENDING',
            isModifier: true,
            packagingId: null,
            unit: supplierItem.unit,
            quantity: data.quantity,
            [productKey]: modifier[productKey],
            ...(config.stationId && {
               packingStationId: config.stationId
            }),
            bulkItemId: supplierItem.bulkItemAsShipped.id,
            ...(config.labelTemplateId && {
               labelTemplateId: config.labelTemplateId
            })
         }
      })
   } catch (error) {
      throw Error(error)
   }
}
