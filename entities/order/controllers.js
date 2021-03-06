import { isEmpty, isNull } from 'lodash'
import moment from 'moment-timezone'
import { client } from '../../lib/graphql'

import {
   CUSTOMER,
   FETCH_CART,
   MILE_RANGE,
   EMAIL_SETTINGS,
   BRAND_ON_DEMAND_SETTING,
   BRAND_SUBSCRIPTION_SETTING
} from './graphql/queries'
import {
   SEND_MAIL,
   UPDATE_CART,
   CREATE_ORDER,
   UPDATE_ORDER
} from './graphql/mutations'

import { logger } from '../../utils'
import { handle, fetch_html } from './functions'

const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)

export const take = async (req, res) => {
   const { id, customerKeycloakId, paymentStatus } = req.body.event.data.new
   let orderId = ''
   try {
      const { cartByPK: cart } = await client.request(FETCH_CART, {
         id
      })

      if (cart.paymentStatus !== 'SUCCEEDED') {
         return res.status(200).json({
            message: 'Order has not been paid for yet!',
            success: true
         })
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
                        unitPrice: price
                     } = product
                     return { id, name, type, price: price * 100, quantity }
                  })
               )
               return result
            } else {
               const { id, name, type, unitPrice: price, quantity } = product
               return { id, name, type, price: price * 100, quantity }
            }
         })
      )

      const settings = {
         brand: {
            name: ''
         },
         address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
            latitude: '',
            longitude: ''
         },
         contact: {
            phoneNo: '',
            email: ''
         },
         email: {
            name: '',
            email: '',
            template: {}
         }
      }
      if (cart.cartSource === 'a-la-carte') {
         const { brand } = await client.request(BRAND_ON_DEMAND_SETTING, {
            id: cart.brandId
         })
         if (brand && !isEmpty(brand)) {
            if (!isEmpty(brand.name)) {
               settings.brand.name = brand.name[0].name || ''
            }
            if (!isEmpty(brand.contact)) {
               settings.contact.email = brand.contact[0].email || ''
               settings.contact.phoneNo = brand.contact[0].phoneNo || ''
            }
            if (!isEmpty(brand.address)) {
               settings.address.line1 = brand.address[0].line1 || ''
               settings.address.line2 = brand.address[0].line2 || ''
               settings.address.city = brand.address[0].city || ''
               settings.address.state = brand.address[0].state || ''
               settings.address.country = brand.address[0].country || ''
               settings.address.zipcode = brand.address[0].zipcode || ''
               settings.address.latitude = brand.address[0].latitude || ''
               settings.address.longitude = brand.address[0].longitude || ''
            }
            if (!isEmpty(brand.email)) {
               settings.email.name = brand.email[0].name || ''
               settings.email.email = brand.email[0].email || ''
               settings.email.template = brand.email[0].template || {}
            }
         }
      } else if (cart.cartSource === 'subscription') {
         const { brand } = await client.request(BRAND_SUBSCRIPTION_SETTING, {
            id: cart.brandId
         })
         if (brand && !isEmpty(brand)) {
            if (!isEmpty(brand.name)) {
               settings.brand.name = brand.name[0].name || ''
            }
            if (!isEmpty(brand.contact)) {
               settings.contact.email = brand.contact[0].email || ''
               settings.contact.phoneNo = brand.contact[0].phoneNo || ''
            }
            if (!isEmpty(brand.address)) {
               settings.address.line1 = brand.address[0].line1 || ''
               settings.address.line2 = brand.address[0].line2 || ''
               settings.address.city = brand.address[0].city || ''
               settings.address.state = brand.address[0].state || ''
               settings.address.country = brand.address[0].country || ''
               settings.address.zipcode = brand.address[0].zipcode || ''
               settings.address.latitude = brand.address[0].latitude || ''
               settings.address.longitude = brand.address[0].longitude || ''
            }
            if (!isEmpty(brand.email)) {
               settings.email.name = brand.email[0].name || ''
               settings.email.email = brand.email[0].email || ''
               settings.email.template = brand.email[0].template || {}
            }
         }
      }

      const deliveryInfo = deliveryInfo_template

      if (Array.isArray(orderProducts) && !isEmpty(orderProducts)) {
         deliveryInfo.orderInfo.products = orderProducts
      }

      if (isPickup(cart.fulfillmentInfo.type)) {
         deliveryInfo.pickup.window.approved.startsAt =
            cart.fulfillmentInfo.slot.from
         deliveryInfo.pickup.window.approved.endsAt =
            cart.fulfillmentInfo.slot.to
      } else {
         if (cart.fulfillmentInfo.type === 'PREORDER_DELIVERY') {
            deliveryInfo.dropoff.window.requested.startsAt =
               cart.fulfillmentInfo.slot.from
            deliveryInfo.dropoff.window.requested.endsAt =
               cart.fulfillmentInfo.slot.to
         } else if (cart.fulfillmentInfo.type === 'ONDEMAND_DELIVERY') {
            const { mileRange } = await client.request(MILE_RANGE, {
               id: cart.fulfillmentInfo.slot.mileRangeId
            })
            if (
               !isNull(mileRange) &&
               'prepTime' in mileRange &&
               mileRange.prepTime
            ) {
               deliveryInfo.dropoff.window.requested.startsAt = moment().toString()
               deliveryInfo.dropoff.window.requested.endsAt = moment()
                  .add(mileRange.prepTime, 'm')
                  .toString()
            }
         }
      }

      deliveryInfo.pickup.pickupInfo = {
         id: Number(process.env.ORGANIZATION_ID),
         organizationName: settings.brand.name,
         organizationPhone: settings.contact.phoneNo,
         organizationEmail: settings.contact.email,
         organizationAddress: {
            line1: settings.address.line1,
            line2: settings.address.line2,
            city: settings.address.city,
            state: settings.address.state,
            country: settings.address.country,
            zipcode: settings.address.zipcode,
            latitude: settings.address.latitude,
            longitude: settings.address.longitude
         }
      }

      deliveryInfo.return.returnInfo = {
         id: Number(process.env.ORGANIZATION_ID),
         organizationName: settings.brand.name,
         organizationPhone: settings.contact.phoneNo,
         organizationEmail: settings.contact.email,
         organizationAddress: {
            line1: settings.address.line1,
            line2: settings.address.line2,
            city: settings.address.city,
            state: settings.address.state,
            country: settings.address.country,
            zipcode: settings.address.zipcode,
            latitude: settings.address.latitude,
            longitude: settings.address.longitude
         }
      }

      let customerInfo = {
         customerFirstName: '',
         customerLastName: '',
         customerEmail: '',
         customerPhone: ''
      }
      if (cart.customerInfo) {
         customerInfo = cart.customerInfo
      }

      const customerAddress = {
         line1: '',
         line2: '',
         city: '',
         state: '',
         zipcode: '',
         country: '',
         notes: '',
         label: '',
         landmark: ''
      }

      if (cart.address) {
         if ('line1' in cart.address) {
            customerAddress.line1 = cart.address.line1
         }
         if ('line2' in cart.address) {
            customerAddress.line2 = cart.address.line2
         }
         if ('city' in cart.address) {
            customerAddress.city = cart.address.city
         }
         if ('state' in cart.address) {
            customerAddress.state = cart.address.state
         }
         if ('zipcode' in cart.address) {
            customerAddress.zipcode = cart.address.zipcode
         }
         if ('country' in cart.address) {
            customerAddress.country = cart.address.country
         }
         if ('notes' in cart.address) {
            customerAddress.notes = cart.address.notes
         }
         if ('label' in cart.address) {
            customerAddress.label = cart.address.label
         }
         if ('landmark' in cart.address) {
            customerAddress.landmark = cart.address.landmark
         }
      }

      deliveryInfo.dropoff.dropoffInfo = {
         ...customerInfo,
         ...(!isPickup(cart.fulfillmentInfo.type) && { customerAddress })
      }

      let { createOrder: order } = await client.request(CREATE_ORDER, {
         object: {
            cartId: id,
            paymentStatus,
            tip: cart.tip,
            tax: cart.tax,
            deliveryInfo,
            brandId: cart.brandId,
            discount: cart.discount,
            orderStatus: 'PENDING',
            source: cart.cartSource,
            amountPaid: cart.totalPrice,
            itemTotal: cart.cartInfo.total,
            keycloakId: customerKeycloakId,
            deliveryPrice: cart.deliveryPrice,
            transactionId: cart.transactionId,
            currency: process.env.CURRENCY || '',
            fulfillmentType: cart.fulfillmentInfo.type
         }
      })

      orderId = order.id

      await client.request(UPDATE_ORDER, {
         id: order.id,
         _set: {
            deliveryInfo: {
               ...order.deliveryInfo,
               orderInfo: {
                  ...order.deliveryInfo.orderInfo,
                  id: order.id
               }
            }
         }
      })

      await Promise.all(
         cart.cartInfo.products.map(product => {
            switch (product.type) {
               case 'comboProduct':
                  return handle.combo({
                     product,
                     orderId: order.id
                  })
               case 'simpleRecipeProduct':
                  return handle.simpleRecipe({
                     product,
                     orderId: order.id
                  })
               case 'inventoryProduct':
                  return handle.inventory({
                     product,
                     orderId: order.id
                  })
               default:
                  throw 'No such product type exists!'
            }
         })
      )

      await client.request(UPDATE_CART, {
         id,
         _set: {
            status: 'ORDER_PLACED',
            orderId: Number(order.id)
         }
      })

      if (Object.keys(cart.customerInfo).length > 0) {
         if (
            settings.email.name &&
            settings.email.email &&
            Object.keys(settings.email.template).length > 0
         ) {
            const { name, email, template } = settings.email
            let html = await fetch_html(template, {
               new: { id: order.id }
            })

            let subject = `Hey ${customerInfo.customerFirstName}, We've received your order.`

            await client.request(SEND_MAIL, {
               emailInput: {
                  html,
                  subject,
                  attachments: [],
                  from: `"${name}" ${email}`,
                  to: cart.customerInfo.customerEmail
               }
            })
         }
      }

      return res.status(200).json({
         data: cart,
         success: true
      })
   } catch (error) {
      console.log('error', error)
      logger({
         meta: {
            cartId: id,
            order: { id: orderId }
         },
         endpoint: '/api/order/take',
         trace: error
      })
      return res.status(404).json({ success: false, error })
   }
}

export const handleStatusChange = async (req, res) => {
   const { id = null, status, paymentStatus } = req.body.event.data.new
   try {
      if (id) {
         if (!brandId) throw { message: 'Brand id is required!', code: 409 }
         if (!customerKeycloakId)
            throw { message: 'Customer id is required!', code: 409 }

         const { brand } = await client.request(EMAIL_SETTINGS, {
            id: brandId
         })

         if (!brand) throw { message: 'No such brand id exists!', code: 404 }

         const template = {
            type: '',
            name: '',
            email: '',
            template: {},
            subject: ''
         }

         const { order = {} } = await client.request(ORDER_BY_CART, {
            cartId: { _eq: id }
         })

         if (paymentStatus === 'SUCCEEDED' && status === 'ORDER_PENDING') {
            if (brand.delivered.length === 0)
               throw {
                  message: 'Setting for new order template doesnt exists!',
                  code: 404
               }
            const [data] = brand.delivered
            template.type = 'New'
            template.name = data.name
            template.email = data.email
            template.template = data.template
            template.subject = `Your order ORD:#${id} from ${data.name} has been placed.`
         } else if (status === 'ORDER_DELIVERED') {
            if (brand.delivered.length === 0)
               throw {
                  message:
                     'Setting for order delivered template doesnt exists!',
                  code: 404
               }
            const [data] = brand.delivered
            template.type = 'Delivered'
            template.name = data.name
            template.email = data.email
            template.template = data.template
            template.subject = `Your order ORD:#${id} from ${data.name} has been delivered`
         } else if (order.isRejected) {
            if (brand.cancelled.length === 0)
               throw {
                  message:
                     'Setting for order cancelled template doesnt exists!',
                  code: 404
               }

            const [data] = brand.cancelled
            template.type = 'Cancelled'
            template.name = data.name
            template.email = data.email
            template.template = data.template
            template.subject = `Your order ORD:#${id} from ${data.name} has been cancelled`
         }

         if (!template.type)
            return res.status(200).json({
               success: true,
               message: 'This order status has not been mapped!'
            })

         let html = await fetch_html(template.template, {
            new: { id }
         })

         const customer = {
            email: ''
         }

         const { customer: consumer } = await client.request(CUSTOMER, {
            keycloakId
         })

         if (!consumer) throw { message: 'No such customer exists', code: 404 }

         if ('email' in consumer && consumer.email) {
            customer.email = consumer.email
         }

         if (!customer.email)
            throw { message: 'Customer does not have email linked!', code: 404 }

         await client.request(SEND_MAIL, {
            emailInput: {
               html,
               attachments: [],
               to: customer.email,
               subject: template.subject,
               from: `"${template.name}" ${template.email}`
            }
         })
         return res
            .status(200)
            .json({ success: true, template, customer, html })
      }
   } catch (error) {
      logger({
         meta: { order: { id } },
         endpoint: '/api/order/status',
         trace: error
      })
      return res.status('code' in error && error.code ? error.code : 500).json({
         success: false,
         error
      })
   }
}

const deliveryInfo_template = {
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
      products: []
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
         requested: {
            startsAt: '',
            endsAt: ''
         },
         approved: {
            startsAt: '',
            endsAt: ''
         }
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
         organizationId: '',
         organizationName: '',
         organizationPhone: '',
         organizationEmail: '',
         organizationAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
            latitude: '',
            longitude: ''
         }
      }
   },
   dropoff: {
      status: {
         value: 'WAITING'
      },
      window: {
         approved: {
            startsAt: '',
            endsAt: ''
         },
         requested: {
            startsAt: '',
            endsAt: ''
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
         customerEmail: '',
         customerPhone: '',
         customerLastName: '',
         customerFirstName: '',
         customerAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipcode: '',
            country: '',
            notes: '',
            label: '',
            landmark: ''
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
         organizationName: '',
         organizationPhone: '',
         organizationEmail: '',
         organizationAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
            latitude: '',
            longitude: ''
         }
      }
   }
}
