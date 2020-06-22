import { client } from '../../lib/graphql'

import {
   FETCH_INVENTORY_PRODUCT,
   FETCH_SIMPLE_RECIPE_PRODUCT,
   FETCH_SIMPLE_RECIPE_PRODUCT_OPTION,
   FETCH_CART,
   ORGANIZATION
} from './graphql/queries'
import {
   UPDATE_CART,
   CREATE_ORDER,
   CREATE_ORDER_SACHET,
   CREATE_ORDER_MEALKIT_PRODUCT,
   CREATE_ORDER_INVENTORY_PRODUCT,
   CREATE_ORDER_READY_TO_EAT_PRODUCT,
   UPDATE_ORDER
} from './graphql/mutations'

export const take = async (req, res) => {
   try {
      const { id, customerId, paymentStatus } = req.body.event.data.new
      const { cartByPK: cart } = await client.request(FETCH_CART, {
         id
      })

      const orderProducts = await Promise.all(
         cart.cartInfo.products.map(({ product, products }) => {
            if (Array.isArray(products)) {
               return products.map(({ product }) => {
                  const { id, name, type, price, quantity } = product
                  return { id, name, type, price, quantity }
               })
            }
            const { id, name, type, price, quantity } = product
            return { id, name, type, price, quantity }
         })
      )

      const { brand, address, contact } = await client.request(ORGANIZATION)

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
            fulfillmentType: cart.fulfillmentInfo.type,
            deliveryInfo: {
               deliveryId: '',
               webhookUrl: '',
               deliveryFee: {
                  value: '',
                  unit: ''
               },
               tracking: {
                  location: {
                     isAvailable: false,
                     longitude: '',
                     latitude: ''
                  },
                  code: {
                     isAvailable: false,
                     value: '',
                     url: ''
                  },
                  sms: {
                     isAvailable: false
                  },
                  eta: ''
               },
               orderInfo: {
                  products: orderProducts
               },
               deliveryRequest: {
                  status: {
                     value: 'WAITING',
                     timeStamp: '',
                     description: '',
                     data: {}
                  },
                  distance: {
                     value: 0,
                     unit: 'mile'
                  }
               },
               assigned: {
                  status: {
                     value: 'WAITING',
                     timeStamp: '',
                     description: '',
                     data: {}
                  },
                  driverInfo: {
                     driverFirstName: '',
                     driverLastName: '',
                     driverPhone: '',
                     driverPicture: ''
                  },
                  vehicleInfo: {
                     vehicleType: '',
                     vehicleMake: '',
                     vehicleModel: '',
                     vehicleColor: '',
                     vehicleLicensePlateNumber: '',
                     vehicleLicensePlateState: ''
                  }
               },
               pickup: {
                  status: {
                     value: 'WAITING'
                  },
                  pickupInfo: {
                     organizationId: process.env.ORGANIZATION_ID,
                     organizationName: brand[0].value.name,
                     organizationPhone: contact[0].value.phoneNo,
                     organizationEmail: contact[0].value.email,
                     organizationAddress: {
                        line1: address[0].value.address.line1,
                        line2: address[0].value.address.line2,
                        city: address[0].value.address.city,
                        state: address[0].value.address.state,
                        country: address[0].value.address.country,
                        zipcode: address[0].value.address.zip,
                        latitude: address[0].value.address.lat,
                        longitude: address[0].value.address.lng
                     }
                  }
               },
               dropoff: {
                  status: {
                     value: 'WAITING'
                  },
                  window: {
                     requested: {
                        startsAt: new Date(
                           `${cart.fulfillmentInfo.date} ${cart.fulfillmentInfo.slot.from}`
                        ),
                        endsAt: new Date(
                           `${cart.fulfillmentInfo.date} ${cart.fulfillmentInfo.slot.to}`
                        )
                     }
                  },
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
               },
               return: {
                  status: {
                     value: 'WAITING',
                     timeStamp: '',
                     description: '',
                     data: {}
                  },
                  window: {
                     requested: {
                        id: '',
                        buffer: '',
                        startsAt: '',
                        endsAt: ''
                     },
                     approved: {
                        id: '',
                        startsAt: '',
                        endsAt: ''
                     }
                  },
                  confirmation: {
                     photo: {
                        isRequired: false,
                        data: {}
                     },
                     signature: {
                        isRequired: false,
                        data: {}
                     },
                     idProof: {
                        isRequired: false,
                        data: {}
                     }
                  },
                  returnInfo: {
                     organizationId: process.env.ORGANIZATION_ID,
                     organizationName: brand[0].value.name,
                     organizationPhone: contact[0].value.phoneNo,
                     organizationEmail: contact[0].value.email,
                     organizationAddress: {
                        line1: address[0].value.address.line1,
                        line2: address[0].value.address.line2,
                        city: address[0].value.address.city,
                        state: address[0].value.address.state,
                        country: address[0].value.address.country,
                        zipcode: address[0].value.address.zip,
                        latitude: address[0].value.address.lat,
                        longitude: address[0].value.address.lng
                     }
                  }
               }
            }
         }
      })

      await client.request(UPDATE_ORDER, {
         id: order.createOrder.id,
         _set: {
            deliveryInfo: {
               ...order.createOrder.deliveryInfo,
               orderInfo: {
                  ...order.createOrder.deliveryInfo.orderInfo,
                  id: order.createOrder.id
               }
            }
         }
      })

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
