import { evalTime, sendEmail } from '../'
import { client } from '../../lib/graphql'
import { CREATE_CART } from '../../entities/occurence/graphql'

export const autoGenerate = async ({
   brandCustomerId,
   subscriptionOccurenceId
}) => {
   try {
      const {
         subscriptionOccurences: [
            {
               subscriptionAutoSelectOption = 'products',
               fulfillmentDate,
               subscription = {}
            }
         ] = []
      } = await client.request(GET_CUSTOMER_ORDER_DETAILS, {
         subscriptionOccurenceId,
         brandCustomerId
      })

      const cartId = await createCart({
         ...subscription,
         subscriptionOccurenceId,
         isAuto: true,
         fulfillmentDate
      })
      console.log(cartId)
      const { count } = subscription.subscriptionItemCount

      const method = require(`../../options/${
         subscriptionAutoSelectOption
            ? subscriptionAutoSelectOption
            : 'products'
      }`)

      const products = await method.default(
         {
            subscriptionOccurenceId,
            subscriptionId: subscription.subscriptionId
         },
         count
      )
      if (products.status != 400) {
         await Promise.all(
            products.randomProducts.map(async item => {
               try {
                  await client.request(INSERT_CART_ITEM, {
                     object: { ...item, cartId }
                  })
               } catch (error) {
                  throw Error(error.message)
               }
            })
         )

         await sendEmail({ brandCustomerId, subscriptionOccurenceId })
      }
   } catch (error) {
      console.log(error)
      // throw Error(error.message)
   }
}

const createCart = async data => {
   try {
      console.log(data)
      const {
         isAuto = true,
         fulfillmentDate,
         subscriptionOccurenceId = '',
         brand_customers,
         availableZipcodes
      } = data
      if (brand_customers.length > 0 && availableZipcodes.length > 0) {
         const [
            {
               brandCustomerId,
               subscriptionAddressId = '',
               subscriptionPaymentMethodId = ' ',
               customer = {}
            }
         ] = brand_customers
         const { id = '', keycloakId = '', platform_customer = {} } = customer
         const [{ deliveryTime = {} }] = availableZipcodes
         const defaultAddress =
            platform_customer &&
            platform_customer.customerAddresses &&
            platform_customer.customerAddresses.filter(
               address => address.id === subscriptionAddressId
            )

         const { createCart } = await client.request(CREATE_CART, {
            object: {
               status: 'CART_PENDING',
               customerId: parseInt(id),
               paymentStatus: 'PENDING',
               ...(subscriptionPaymentMethodId && {
                  paymentMethodId: subscriptionPaymentMethodId
               }),
               source: 'subscription',
               address: defaultAddress,
               customerKeycloakId: keycloakId,
               subscriptionOccurenceId,
               stripeCustomerId:
                  platform_customer && platform_customer.stripeCustomerId,
               customerInfo: {
                  customerEmail: platform_customer
                     ? platform_customer.email
                     : '',
                  customerPhone: platform_customer
                     ? platform_customer.phoneNumber
                     : '',
                  customerLastName: platform_customer
                     ? platform_customer.lastName
                     : '',
                  customerFirstName: platform_customer
                     ? platform_customer.firstName
                     : ''
               },
               fulfillmentInfo: {
                  type: 'PREORDER_DELIVERY',
                  slot: {
                     from:
                        fulfillmentDate &&
                        deliveryTime &&
                        evalTime(fulfillmentDate, deliveryTime.from),
                     to:
                        fulfillmentDate &&
                        deliveryTime &&
                        evalTime(fulfillmentDate, deliveryTime.to)
                  }
               },
               subscriptionOccurenceCustomers: {
                  data: [
                     {
                        isSkipped: false,
                        keycloakId,
                        subscriptionOccurenceId,
                        isAuto,
                        brand_customerId: brandCustomerId
                     }
                  ]
               }
            }
         })
         return createCart.cartId
      }
   } catch (error) {
      console.log(error)
      // throw Error(error.message)
   }
}

export const INSERT_CART_ITEM = `
   mutation createCartItem($object: order_cartItem_insert_input!) {
      createCartItem(object: $object) {
         id
      }
   }
`

const GET_CUSTOMER_ORDER_DETAILS = `
query customerOrder($subscriptionOccurenceId: Int!, $brandCustomerId: Int!) {
  subscriptionOccurences(where: {id: {_eq: $subscriptionOccurenceId}}) {
    subscriptionAutoSelectOption
    fulfillmentDate
    subscription {
      subscriptionId: id
      availableZipcodes {
         deliveryTime
         deliveryPrice
      }
      subscriptionItemCount {
        count
      }
      brand_customers(where: {id: {_eq: $brandCustomerId}}) {
        brandCustomerId: id
        subscriptionAddressId
        subscriptionPaymentMethodId
        customer {
          id
          keycloakId
          email
          platform_customer {
            firstName
            lastName
            phoneNumber
            stripeCustomerId
            customerAddresses {
              city
              country
              created_at
              landmark
              lat
              line1
              line2
              lng
              zipcode
              state
              id
            }
          }
          subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}) {
            subscriptionOccurenceId
            isAuto
            cartId
            isSkipped
          }
        }
      }
    }
  }
}`
