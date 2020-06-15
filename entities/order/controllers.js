import { client } from '../../lib/graphql'

import {
   FETCH_INVENTORY_PRODUCT,
   FETCH_SIMPLE_RECIPE_PRODUCT,
   FETCH_SIMPLE_RECIPE_PRODUCT_OPTION,
   FETCH_CART
} from './graphql/queries'
import {
   UPDATE_CART,
   CREATE_ORDER,
   // CREATE_CUSTOMER,
   CREATE_ORDER_SACHET,
   CREATE_ORDER_MEALKIT_PRODUCT,
   CREATE_ORDER_INVENTORY_PRODUCT,
   CREATE_ORDER_READY_TO_EAT_PRODUCT
} from './graphql/mutations'

export const take = async (req, res) => {
   try {
      const {
         // email,
         // source,
         // billing,
         // currency,
         // products,
         id,
         customerId,
         // fulfillment,
         paymentStatus
         // dailyKeyUserId
      } = req.body.event.data.new
      const { cartByPK: cart } = await client.request(FETCH_CART, {
         id
      })

      let order = await client.request(CREATE_ORDER, {
         object: {
            customerId,
            paymentStatus,
            tax: cart.tax,
            orderStatus: 'PENDING',
            amountPaid: cart.amount,
            itemTotal: cart.cartInfo.total,
            deliveryPrice: cart.deliveryPrice,
            transactionId: cart.transactionId,
            deliveryInfo: {
               dropoff: {
                  dropoffInfo: {
                     customerEmail: cart.customerInfo.customerEmail,
                     customerPhone: cart.customerInfo.customerPhone,
                     customerLastName: cart.customerInfo.customerLastName,
                     customerFirstName: cart.customerInfo.customerFirstName,
                     customerAddress: {
                        line1: cart.address.line1,
                        line2: cart.address.line2,
                        city: cart.address.city,
                        state: cart.address.state,
                        zipcode: cart.address.zipcode,
                        country: cart.address.country,
                        notes: cart.address.notes
                     }
                  }
               }
            }
         }
      })

      /*
      if (customerId) {
         order = await client.request(CREATE_ORDER, {
            object: {
               customerId,
               orderStatus: 'PENDING',
               paymentStatus: billing.paymentStatus
            }
         })
      } else {
         const customer = await client.request(CREATE_CUSTOMER, {
            object: {
               email,
               source,
               // dailyKeyUserId
            }
         })
         order = await client.request(CREATE_ORDER, {
            object: {
               customerId: customer.id,
               orderStatus: 'PENDING',
               paymentStatus: billing.paymentStatus
            }
         })
      }
      */

      await Promise.all(
         cart.cartInfo.products.map(async ({ product, products }) => {
            try {
               if (product && Object.keys(product).length > 0) {
                  await processOrder(product, order)
               }
               if (Array.isArray(products) && products.length > 0) {
                  await Promise.all(
                     products.map(async ({ product }) => {
                        await processOrder(product, order)
                     })
                  )
               }
            } catch (error) {
               throw Error(error.message)
            }
         })
      )

      await client.request(UPDATE_CART, {
         id,
         orderId: Number(order.createOrder.id),
         status: 'ORDER_PLACED'
      })

      return res.status(200).json({
         data: order,
         success: true
      })
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}

const processOrder = async (product, order) => {
   try {
      switch (product.type) {
         case 'simpleRecipeProduct': {
            const {
               simpleRecipeProduct: { simpleRecipe }
            } = await client.request(FETCH_SIMPLE_RECIPE_PRODUCT, {
               id: product.id
            })
            if (product.option.type === 'mealKit') {
               return processMealKit({
                  product,
                  simpleRecipe,
                  order: order.createOrder
               })
            } else if (product.option.type === 'readyToEat') {
               return processReadyToEat({
                  product,
                  simpleRecipe,
                  order: order.createOrder
               })
            }
         }
         case 'inventoryProduct': {
            return processInventory({
               product,
               order: order.createOrder
            })
         }
         default:
            throw Error('No such product type!')
      }
   } catch (error) {
      throw Error(error)
   }
}

const processMealKit = async ({ product, simpleRecipe, order }) => {
   try {
      const { createOrderMealKitProduct } = await client.request(
         CREATE_ORDER_MEALKIT_PRODUCT,
         {
            object: {
               orderId: order.id,
               price: product.price,
               assemblyStatus: 'PENDING',
               simpleRecipeId: simpleRecipe.id,
               simpleRecipeProductId: product.id,
               simpleRecipeProductOptionId: product.option.id,
               assemblyStationId: simpleRecipe.assemblyStationId
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
                  ingredientProcessing
               } = ingredientSachet

               await client.request(CREATE_ORDER_SACHET, {
                  object: {
                     unit: unit,
                     status: 'PENDING',
                     quantity: quantity,
                     ingredientSachetId: id,
                     ingredientName: ingredient.name,
                     orderMealKitProductId: createOrderMealKitProduct.id,
                     processingName: ingredientProcessing.processing.name
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

const processReadyToEat = async ({ product, simpleRecipe, order }) => {
   try {
      await client.request(CREATE_ORDER_READY_TO_EAT_PRODUCT, {
         object: {
            orderId: order.id,
            price: product.price,
            simpleRecipeId: simpleRecipe.id,
            simpleRecipeProductId: product.id,
            simpleRecipeProductOptionId: product.option.id,
            assemblyStationId: simpleRecipe.assemblyStationId
         }
      })
   } catch (error) {
      throw Error(error)
   }
}

const processInventory = async ({ product, order }) => {
   try {
      const variables = { id: product.id, optionId: { _eq: product.option.id } }
      const { inventoryProduct } = await client.request(
         FETCH_INVENTORY_PRODUCT,
         variables
      )

      const optionQuantity =
         inventoryProduct.inventoryProductOptions[0].quantity
      const totalQuantity = product.quantity
         ? product.quantity * optionQuantity
         : optionQuantity

      await client.request(CREATE_ORDER_INVENTORY_PRODUCT, {
         object: {
            orderId: order.id,
            price: product.price,
            quantity: totalQuantity,
            assemblyStatus: 'PENDING',
            inventoryProductId: product.id,
            inventoryProductOptionId: product.option.id,
            assemblyStationId: inventoryProduct.assemblyStationId
         }
      })
      return
   } catch (error) {
      throw Error(error)
   }
}
