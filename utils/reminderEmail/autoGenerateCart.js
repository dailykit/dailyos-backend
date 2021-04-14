import { evalTime } from '..'
import { client } from '../../lib/graphql'
import {
   CREATE_CART,
   UPDATE_SUB_OCCURENCE
} from '../../entities/occurence/graphql'
import { addProductsToCart, statusLogger } from './'

export const autoGenerateCart = async ({
   brandCustomerId,
   subscriptionOccurenceId,
   products
}) => {
   await statusLogger(
      brandCustomerId,
      subscriptionOccurenceId,
      `Attempting autoGenerate ${brandCustomerId}`
   )
   try {
      const { brandCustomers } = await client.request(GET_SUB_OCCURENCE, {
         brandCustomerId,
         subscriptionOccurenceId
      })
      if (
         brandCustomers.length > 0 &&
         brandCustomers[0].subscriptionOccurences.length === 0
      ) {
         await statusLogger(
            brandCustomerId,
            subscriptionOccurenceId,
            `Creating Subscription Occurence Customer for ${brandCustomerId}`
         )
         const [{ keycloakId }] = brandCustomers

         await client.request(INSERT_SUBS_OCCURENCE, {
            object: {
               isAuto: true,
               isSkipped: false,
               keycloakId,
               subscriptionOccurenceId,
               brand_customerId: brandCustomerId
            }
         })
         await statusLogger(
            brandCustomerId,
            subscriptionOccurenceId,
            `Subscriptiion Occurence Customer created.`
         )
      }

      const {
         subscriptionOccurences: [{ fulfillmentDate, subscription = {} }] = []
      } = await client.request(GET_CUSTOMER_ORDER_DETAILS, {
         subscriptionOccurenceId,
         brandCustomerId
      })

      let cartId =
         subscription.brand_customers[0].customer
            .subscriptionOccurence_customer[0].cartId

      if (cartId === null) {
         await statusLogger(
            brandCustomerId,
            subscriptionOccurenceId,
            `Creating cart for ${brandCustomerId}`
         )
         cartId = await createCart({
            ...subscription,
            subscriptionOccurenceId,
            isAuto: true,
            fulfillmentDate
         })

         await client.request(UPDATE_SUB_OCCURENCE, {
            subscriptionOccurenceId,
            brandCustomerId,
            isAuto: true,
            cartId
         })

         await statusLogger(
            brandCustomerId,
            subscriptionOccurenceId,
            `Cart ${cartId} is created.`
         )
      }

      await addProductsToCart({
         brandCustomerId,
         subscriptionOccurenceId,
         products
      })
   } catch (error) {
      console.log(error)
      // throw Error(error.message)
   }
}

const createCart = async data => {
   try {
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
               brandId,
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
               brandId: brandId,
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

const GET_SUB_OCCURENCE = `
   query subscriptionOccurences($brandCustomerId: Int!, $subscriptionOccurenceId: Int!) {
  brandCustomers(where: {id: {_eq: $brandCustomerId}}) {
     keycloakId
    subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}) {
      isAuto
      cartId
      isSkipped
      keycloakId
      validStatus
      subscriptionId
      brand_customerId
    }
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
        brandId
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
          subscriptionOccurence_customer: subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}) {
            validStatus
            isAuto
            cartId
            isSkipped
          }
        }
      }
    }
  }
}`

const INSERT_SUBS_OCCURENCE = `
mutation insertSubscriptionOccurenceCustomer(
      $object: subscription_subscriptionOccurence_customer_insert_input!
   ) {
      insertSubscriptionOccurenceCustomer: insert_subscription_subscriptionOccurence_customer_one(
         object: $object
      ) {
         keycloakId
         subscriptionOccurenceId
      }
}`
