import moment from 'moment-timezone'
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

const formatTime = time =>
   moment(time).tz(process.env.TIMEZONE).format('YYYY-MM-DD hh:mm')

const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)

export const take = async (req, res) => {
   try {
      const { id, customerId, paymentStatus } = req.body.event.data.new
      const { cartByPK: cart } = await client.request(FETCH_CART, {
         id
      })

      if (cart.paymentStatus !== 'SUCCEEDED') {
         throw Error(`Status[${cart.paymentStatus}]: Payment hasn't succeeded!`)
      }

      const orderProducts = await Promise.all(
         cart.cartInfo.products.map(async product => {
            if (product.type === 'comboProduct') {
               const result = await Promise.all(
                  product.components.map(product => {
                     const {
                        id,
                        name,
                        type,
                        quantity,
                        totalPrice: price
                     } = product
                     return { id, name, type, price: price * 100, quantity }
                  })
               )
               return result
            } else {
               const { id, name, type, totalPrice: price, quantity } = product
               return { id, name, type, price: price * 100, quantity }
            }
         })
      )

      const { brand, address, contact } = await client.request(ORGANIZATION)

      let order = await client.request(CREATE_ORDER, {
         object: {
            customerId,
            paymentStatus,
            tax: cart.tax,
            orderStatus: 'PENDING',
            source: cart.cartSource,
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
                  products: [].concat(...orderProducts)
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
                  window: {
                     ...(isPickup(cart.fulfillmentInfo.type)
                        ? {
                             approved: {
                                startsAt: formatTime(
                                   cart.fulfillmentInfo.slot.from
                                ),
                                endsAt: formatTime(cart.fulfillmentInfo.slot.to)
                             }
                          }
                        : { approved: {} })
                  },
                  status: {
                     value: 'WAITING'
                  },
                  confirmation: {
                     photo: {
                        data: {},
                        isRequired: false
                     },
                     idProof: {
                        data: {},
                        isRequired: false
                     },
                     signature: {
                        data: {},
                        isRequired: false
                     }
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
               ...(isPickup(cart.fulfillmentInfo.type)
                  ? {
                       dropoff: {
                          dropoffInfo: {
                             customerEmail: cart.customerInfo.customerEmail,
                             customerPhone: cart.customerInfo.customerPhone,
                             customerLastName:
                                cart.customerInfo.customerLastName,
                             customerFirstName:
                                cart.customerInfo.customerFirstName
                          }
                       }
                    }
                  : {
                       dropoff: {
                          status: {
                             value: 'WAITING'
                          },
                          window: {
                             approved: {},
                             requested: {
                                startsAt: new Date(
                                   `${cart.fulfillmentInfo.date} ${cart.fulfillmentInfo.slot.from}`
                                ),
                                endsAt: new Date(
                                   `${cart.fulfillmentInfo.date} ${cart.fulfillmentInfo.slot.to}`
                                )
                             }
                          },
                          confirmation: {
                             photo: {
                                data: {},
                                isRequired: false
                             },
                             idProof: {
                                data: {},
                                isRequired: false
                             },
                             signature: {
                                data: {},
                                isRequired: false
                             }
                          },
                          dropoffInfo: {
                             customerEmail: cart.customerInfo.customerEmail,
                             customerPhone: cart.customerInfo.customerPhone,
                             customerLastName:
                                cart.customerInfo.customerLastName,
                             customerFirstName:
                                cart.customerInfo.customerFirstName,
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
                    }),
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
            ...(isPickup(cart.fulfillmentInfo.type) && {
               readyByTimestamp: formatTime(cart.fulfillmentInfo.slot.from)
            }),
            fulfillmentTimestamp: formatTime(cart.fulfillmentInfo.slot.from),
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
         cart.cartInfo.products.map(product => {
            switch (product.type) {
               case 'comboProduct':
                  return processCombo({
                     product,
                     orderId: order.createOrder.id
                  })
               case 'simpleRecipeProduct':
                  return processSimpleRecipe({
                     product,
                     orderId: order.createOrder.id
                  })
               case 'inventoryProduct':
                  return processInventory({
                     product,
                     orderId: order.createOrder.id
                  })
               default:
                  throw Error('No such product type exists!')
            }
         })
      )

      await client.request(UPDATE_CART, {
         id,
         status: 'ORDER_PLACED',
         orderId: Number(order.createOrder.id)
      })

      return res.status(200).json({
         data: cart,
         success: true
      })
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}

const processCombo = async ({ product: combo, orderId }) => {
   try {
      const repetitions = Array.from({ length: combo.quantity }, (_, v) => v)

      await Promise.all(
         repetitions.map(async () => {
            const result = await Promise.all(
               combo.components.map(product => {
                  const args = { product, orderId, comboProductId: combo.id }
                  switch (product.type) {
                     case 'simpleRecipeProduct':
                        return processSimpleRecipe(args)
                     case 'inventoryProduct':
                        return processInventory(args)
                     default:
                        throw Error('No such product type exists!')
                  }
               })
            )
            return result
         })
      )

      return
   } catch (error) {
      throw Error(error)
   }
}

const processInventory = async ({ product, orderId, comboProductId }) => {
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

      const {
         packagingId,
         labelTemplateId,
         assemblyStationId,
         instructionCardTemplateId
      } = inventoryProduct.inventoryProductOptions[0]

      await client.request(CREATE_ORDER_INVENTORY_PRODUCT, {
         object: {
            orderId,
            packagingId,
            labelTemplateId,
            assemblyStationId,
            instructionCardTemplateId,
            quantity: totalQuantity,
            price: product.totalPrice,
            assemblyStatus: 'PENDING',
            inventoryProductId: product.id,
            ...(comboProductId && { comboProductId }),
            inventoryProductOptionId: product.option.id,
            ...(product.customizableProductId && {
               customizableProductId: product.customizableProductId
            }),
            ...(product.comboProductComponentId && {
               comboProductComponentId: product.comboProductComponentId
            }),
            ...(product.customizableProductOptionId && {
               customizableProductOptionId: product.customizableProductOptionId
            })
         }
      })
      return
   } catch (error) {
      throw Error(error)
   }
}

const processSimpleRecipe = async data => {
   const { product, orderId, comboProductId } = data
   try {
      const variables = { id: product.option.id }
      const { simpleRecipeProductOption: productOption } = await client.request(
         FETCH_SIMPLE_RECIPE_PRODUCT,
         variables
      )

      const args = {
         product,
         orderId,
         productOption,
         comboProductId
      }
      switch (product.option.type) {
         case 'mealKit':
            return processMealKit(args)
         case 'readyToEat':
            return processReadyToEat(args)
         default:
            throw Error('No such product type exists!')
      }
   } catch (error) {
      throw Error(error)
   }
}

const processMealKit = async data => {
   const { orderId, product, productOption, comboProductId } = data
   try {
      const { createOrderMealKitProduct } = await client.request(
         CREATE_ORDER_MEALKIT_PRODUCT,
         {
            object: {
               orderId,
               assemblyStatus: 'PENDING',
               price: product.totalPrice,
               simpleRecipeId: productOption.simpleRecipeProduct.simpleRecipeId,
               simpleRecipeProductId: product.id,
               ...(comboProductId && { comboProductId }),
               simpleRecipeProductOptionId: product.option.id,
               packagingId: productOption.packagingId,
               labelTemplateId: productOption.labelTemplateId,
               assemblyStationId: productOption.assemblyStationId,
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
                        labelTemplateId: liveModeOfFulfillment.labelTemplateId,
                        accuracy: liveModeOfFulfillment.accuracy,
                        bulkItemId: liveModeOfFulfillment.bulkItemId,
                        sachetItemId: liveModeOfFulfillment.sachetItemId,
                        packagingId: liveModeOfFulfillment.packagingId,
                        packingStationId: liveModeOfFulfillment.stationId
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

const processReadyToEat = async data => {
   const { orderId, product, productOption, comboProductId } = data
   try {
      const { createOrderReadyToEatProduct } = await client.request(
         CREATE_ORDER_READY_TO_EAT_PRODUCT,
         {
            object: {
               orderId,
               price: product.totalPrice,
               simpleRecipeId: productOption.simpleRecipeProduct.simpleRecipeId,
               simpleRecipeProductId: product.id,
               ...(comboProductId && { comboProductId }),
               packagingId: productOption.packagingId,
               simpleRecipeProductOptionId: product.option.id,
               labelTemplateId: productOption.labelTemplateId,
               assemblyStationId: productOption.assemblyStationId,
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
                     processingName: ingredientProcessing.processing.name,
                     orderReadyToEatProductId: createOrderReadyToEatProduct.id,
                     ...(liveModeOfFulfillment && {
                        labelTemplateId: liveModeOfFulfillment.labelTemplateId,
                        accuracy: liveModeOfFulfillment.accuracy,
                        bulkItemId: liveModeOfFulfillment.bulkItemId,
                        sachetItemId: liveModeOfFulfillment.sachetItemId,
                        packagingId: liveModeOfFulfillment.packagingId,
                        packingStationId: liveModeOfFulfillment.stationId
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
