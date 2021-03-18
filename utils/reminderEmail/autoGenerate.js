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
            { subscriptionAutoSelectOption, subscription = {} }
         ] = []
      } = await client.request(GET_CUSTOMER_ORDER_DETAILS, {
         subscriptionOccurenceId,
         brandCustomerId
      })

      const cartId = await createCart({
         ...subscription,
         isAuto: true
      })
      console.log(cartId)
      const { count } = subscription.subscriptionItemCount

      const method = require(`../../options/${subscriptionAutoSelectOption}`)

      const products = await method.default(
         {
            subscriptionOccurenceId,
            subscriptionId: subscription.subscriptionId
         },
         count
      )

      await Promise.all(
         products.map(async item => {
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
   } catch (error) {
      throw Error(error.message)
   }
}

const createCart = async data => {
   try {
      const {
         isAuto,
         subscriptionId,
         availableZipcodes: { deliveryTime, deliveryPrice } = {},
         brand_customers: {
            brandCustomerId,
            subscriptionAddressId,
            subscriptionOccurenceId,
            subscriptionPaymentMethodId,
            customer: {
               id,
               keycloakId,
               email,
               platform_customer,
               subscriptionOccurences
            } = {}
         } = {}
      } = data
      const defaultAddress =
         platform_customer &&
         platform_customer.customerAddresses.filter(
            address => address.id === subscriptionAddressId
         )

      const cartId = await client.request(CREATE_CART, {
         object: {
            status: 'CART_PENDING',
            customerId: id,
            paymentStatus: 'PENDING',
            ...(subscriptionPaymentMethodId && {
               paymentId: subscriptionPaymentMethodId
            }),
            source: 'subscription',
            address: defaultAddress,
            customerKeycloakId: keycloakId,
            subscriptionOccurenceId,
            stripeCustomerId:
               platform_customer && platform_customer.stripeCustomerId,
            customerInfo: {
               customerEmail: platform_customer.email || '',
               customerPhone: platform_customer.phoneNumber || '',
               customerLastName: platform_customer.lastName || '',
               customerFirstName: platform_customer.firstName || ''
            },
            fulfillmentInfo: {
               type: 'PREORDER_DELIVERY',
               slot: {
                  from: evalTime(
                     fulfillmentDate,
                     deliveryTime && deliveryTime.from
                  ),
                  to: evalTime(fulfillmentDate, deliveryTime && deliveryTime.to)
               }
            },
            subscriptionOccurenceCustomers: {
               data: [
                  {
                     isSkipped: false,
                     keycloakId,
                     subscriptionOccurenceId,
                     isAuto
                  }
               ]
            }
         }
      })
      console.log(cartId)
      return cartId.id
   } catch (error) {
      throw Error(error.message)
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
