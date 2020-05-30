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
            itemTotal: cart.amount,
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

      const { tax, ...billingRest } = billing
      await client.request(CREATE_ORDER_BILLING, {
         ...tax,
         ...billingRest,
         orderId: order.id,
      })
      */

      await Promise.all(
         cart.cartInfo.products.map(async ({ product, ...rest }) => {
            try {
               switch (product.type) {
                  case 'Simple Recipe': {
                     const {
                        simpleRecipeProduct: { simpleRecipe }
                     } = await client.request(FETCH_SIMPLE_RECIPE_PRODUCT, {
                        id: product.id
                     })
                     if (product.option.type === 'mealKit') {
                        return processMealKit({
                           rest,
                           product,
                           simpleRecipe,
                           order: order.createOrder
                        })
                     } else if (product.option.type === 'readyToEat') {
                        return processReadyToEat({
                           rest,
                           product,
                           simpleRecipe,
                           order: order.createOrder
                        })
                     }
                  }
                  case 'Inventory': {
                     return processInventory({
                        rest,
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
      console.log('take -> error', error)
      return res.status(404).json({ success: false, error: error.message })
   }
}

const processMealKit = async ({ rest, product, simpleRecipe, order }) => {
   try {
      const { createOrderMealKitProduct } = await client.request(
         CREATE_ORDER_MEALKIT_PRODUCT,
         {
            object: {
               // ...rest,
               orderId: order.id,
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

const processReadyToEat = ({ rest, product, simpleRecipe, order }) => {
   try {
      client.request(CREATE_ORDER_READY_TO_EAT_PRODUCT, {
         object: {
            // ...rest,
            orderId: order.id,
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

const processInventory = async ({ product, order, rest }) => {
   try {
      const variables = { id: product.id }
      const { inventoryProduct } = await client.request(
         FETCH_INVENTORY_PRODUCT,
         variables
      )
      const updateInventoryProduct = await client.request(
         CREATE_ORDER_INVENTORY_PRODUCT,
         {
            object: {
               // ...rest,
               orderId: order.id,
               assemblyStatus: 'PENDING',
               inventoryProductId: product.id,
               inventoryProductOptionId: product.option.id,
               assemblyStationId: inventoryProduct.assemblyStationId
            }
         }
      )
      return
   } catch (error) {
      throw Error(error)
   }
}
