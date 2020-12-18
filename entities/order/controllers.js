import moment from 'moment-timezone'
import { client } from '../../lib/graphql'

import {
   FETCH_CART,
   CUSTOMER,
   ORDER_STATUS_EMAIL,
   BRAND_ON_DEMAND_SETTING,
   BRAND_SUBSCRIPTION_SETTING
} from './graphql/queries'
import {
   SEND_MAIL,
   UPDATE_CART,
   CREATE_ORDER,
   UPDATE_ORDER
} from './graphql/mutations'

import { handle, fetch_html } from './functions'

const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)

export const take = async (req, res) => {
   try {
      const { id, customerKeycloakId, paymentStatus } = req.body.event.data.new
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

      const settings = {
         brand: {
            name: ''
         },
         address: {},
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
         const { brand = {} } = await client.request(BRAND_ON_DEMAND_SETTING, {
            id: cart.brandId
         })
         if ('brand' in brand && brand.brand) {
            settings.brand = brand.brand.length > 0 ? brand.brand[0].value : {}
         }
         if ('contact' in brand && brand.contact) {
            settings.contact =
               brand.contact.length > 0 ? brand.contact[0].value : {}
         }
         if ('address' in brand && brand.address) {
            const address =
               brand.address.length > 0 ? brand.address[0].value : {}
            settings.address = address
         }
         if ('email' in brand && brand.email) {
            const email = brand.email.length > 0 ? brand.email[0].value : {}
            settings.email = email
         }
      } else if (cart.cartSource === 'subscription') {
         const { brand = {} } = await client.request(
            BRAND_SUBSCRIPTION_SETTING,
            {
               id: cart.brandId
            }
         )
         if ('brand' in brand && brand.brand) {
            settings.brand = brand.brand.length > 0 ? brand.brand[0].value : {}
         }
         if ('contact' in brand && brand.contact) {
            settings.contact =
               brand.contact.length > 0 ? brand.contact[0].value : {}
         }
         if ('address' in brand && brand.address) {
            settings.address =
               brand.address.length > 0 ? brand.address[0].value : {}
         }
         if ('email' in brand && brand.email) {
            const email = brand.email.length > 0 ? brand.email[0].value : {}
            settings.email = email
         }
      }

      let order = await client.request(CREATE_ORDER, {
         object: {
            cartId: id,
            paymentStatus,
            tax: cart.tax,
            brandId: cart.brandId,
            orderStatus: 'PENDING',
            source: cart.cartSource,
            amountPaid: cart.totalPrice,
            itemTotal: cart.cartInfo.total,
            keycloakId: customerKeycloakId,
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
                                startsAt: moment(
                                   cart.fulfillmentInfo.slot.from
                                ),
                                endsAt: moment(cart.fulfillmentInfo.slot.to)
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
                     organizationName: settings.brand.name,
                     organizationPhone: settings.contact.phoneNo,
                     organizationEmail: settings.contact.email,
                     organizationAddress: {
                        line1: settings.address.line1,
                        line2: settings.address.line2,
                        city: settings.address.city,
                        state: settings.address.state,
                        country: settings.address.country,
                        zipcode: settings.address.zip,
                        latitude: settings.address.lat,
                        longitude: settings.address.lng
                     }
                  }
               },
               ...(isPickup(cart.fulfillmentInfo.type)
                  ? {
                       dropoff: {
                          dropoffInfo: {
                             ...(cart.customerInfo &&
                                Object.keys(cart.customerInfo).length > 0 && {
                                   customerEmail:
                                      cart.customerInfo.customerEmail,
                                   customerPhone:
                                      cart.customerInfo.customerPhone,
                                   customerLastName:
                                      cart.customerInfo.customerLastName,
                                   customerFirstName:
                                      cart.customerInfo.customerFirstName
                                })
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
                             ...(cart.customerInfo &&
                                Object.keys(cart.customerInfo).length > 0 && {
                                   customerEmail:
                                      cart.customerInfo.customerEmail,
                                   customerPhone:
                                      cart.customerInfo.customerPhone,
                                   customerLastName:
                                      cart.customerInfo.customerLastName,
                                   customerFirstName:
                                      cart.customerInfo.customerFirstName,
                                   ...('customerAddress' in cart.customerInfo &&
                                      cart.customerInfo.customerAddress &&
                                      Object.keys(
                                         cart.customerInfo.customerAddress
                                      ).length > 0 && {
                                         customerAddress: {
                                            line1: cart.address.line1,
                                            line2: cart.address.line2,
                                            city: cart.address.city,
                                            state: cart.address.state,
                                            zipcode: cart.address.zipcode,
                                            country: cart.address.country,
                                            notes: cart.address.notes,
                                            label: cart.address.label,
                                            landmark: cart.address.landmark
                                         }
                                      })
                                })
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
                     organizationName: settings.brand.name,
                     organizationPhone: settings.contact.phoneNo,
                     organizationEmail: settings.contact.email,
                     organizationAddress: {
                        line1: settings.address.line1,
                        line2: settings.address.line2,
                        city: settings.address.city,
                        state: settings.address.state,
                        country: settings.address.country,
                        zipcode: settings.address.zip,
                        latitude: settings.address.lat,
                        longitude: settings.address.lng
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
               readyByTimestamp: moment(cart.fulfillmentInfo.slot.from)
            }),
            fulfillmentTimestamp: moment(cart.fulfillmentInfo.slot.from),
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
                  return handle.combo({
                     product,
                     orderId: order.createOrder.id
                  })
               case 'simpleRecipeProduct':
                  return handle.simpleRecipe({
                     product,
                     orderId: order.createOrder.id
                  })
               case 'inventoryProduct':
                  return handle.inventory({
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

      if (Object.keys(cart.customerInfo).length > 0) {
         if (
            settings.email.name &&
            settings.email.email &&
            Object.keys(settings.email.template).length > 0
         ) {
            const { name, email, template } = settings.email
            let html = await fetch_html(template, {
               new: { id: order.createOrder.id }
            })

            await client.request(SEND_MAIL, {
               emailInput: {
                  from: `"${name}" ${email}`,
                  to: cart.customerInfo.customerEmail,
                  subject: `Order Receipt - ${order.createOrder.id}`,
                  attachments: [],
                  html
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
      return res.status(404).json({ success: false, error: error.message })
   }
}

export const handleStatusChange = async (req, res) => {
   try {
      const {
         id = null,
         brandId = null,
         keycloakId = '',
         orderStatus: status = '',
         isRejected = false
      } = req.body.event.data.new

      if (!id) throw { message: 'Order id is required!', code: 409 }
      if (!status) throw { message: 'Order status is required!', code: 409 }
      if (!brandId) throw { message: 'Brand id is required!', code: 409 }
      if (!keycloakId) throw { message: 'Customer id is required!', code: 409 }

      const { brand } = await client.request(ORDER_STATUS_EMAIL, {
         id: brandId
      })

      if (!brand) throw { message: 'No such brand id exists!', code: 404 }

      const template = {
         type: '',
         name: '',
         email: '',
         template: {}
      }

      if (status === 'DELIVERED') {
         if (brand.delivered_template.length === 0)
            throw {
               message: 'Setting for order delivered template doesnt exists!',
               code: 404
            }
         const [data] = brand.delivered_template
         template.type = 'Delivered'
         template.name = data.name
         template.email = data.email
         template.template = data.template
      } else if (isRejected) {
         if (brand.cancelled_template.length === 0)
            throw {
               message: 'Setting for order cancelled template doesnt exists!',
               code: 404
            }

         const [data] = brand.cancelled_template
         template.type = 'Cancelled'
         template.name = data.name
         template.email = data.email
         template.template = data.template
      }

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
            from: `"${template.name}" ${template.email}`,
            to: customer.email,
            subject: `Order ${template.type} - ${id}`,
            attachments: [],
            html
         }
      })
      return res.status(200).json({ success: true, template, customer, html })
   } catch (error) {
      console.log(
         '🚀 ~ file: controllers.js ~ line 945 ~ handleStatusChange ~ error',
         error
      )
      return res.status('code' in error && error.code ? error.code : 500).json({
         success: false,
         error
      })
   }
}
