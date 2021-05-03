import { evalTime } from '..'
import { client } from '../../lib/graphql'
import {
   CREATE_CART,
   UPDATE_SUB_OCCURENCE
} from '../../entities/occurence/graphql'
import { addProductsToCart, statusLogger } from './'

export const autoGenerateCart = async ({
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId,
   products
}) => {
   await statusLogger({
      keycloakId,
      brand_customerId,
      subscriptionOccurenceId,
      message: `Attempting autoGenerate ${brandCustomerId}`
   })
   try {
      const { brandCustomers = [] } = await client.request(GET_SUB_OCCURENCE, {
         brand_customerId,
         subscriptionOccurenceId
      })

      if (
         brandCustomers.length > 0 &&
         brandCustomers[0].subscriptionOccurences.length === 0
      ) {
         await statusLogger({
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId,
            message: `Creating Subscription Occurence Customer for ${brandCustomerId}`
         })
         const { keycloakId } = brandCustomers[0]

         await client.request(INSERT_SUBS_OCCURENCE, {
            object: {
               isAuto: true,
               isSkipped: false,
               keycloakId,
               brand_customerId,
               subscriptionOccurenceId
            }
         })
         await statusLogger({
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId,
            message: `Subscriptiion Occurence Customer created.`
         })
      }

      const { subscriptionOccurences = [] } = await client.request(
         GET_CUSTOMER_ORDER_DETAILS,
         {
            subscriptionOccurenceId,
            brandCustomerId
         }
      )

      if (subscriptionOccurences.length === 0) return
      const { fulfillmentDate, subscription = {} } = subscriptionOccurences[0]

      let cartId
      if (subscription.brand_customers.length > 0) {
         const { subscriptionOccurences = [] } = subscription.brand_customers[0]
         if (
            subscriptionOccurences.length > 0 &&
            subscriptionOccurences[0].cartId
         ) {
            cartId = subscriptionOccurences[0].cartId
         }
      }

      if (cartId === null) {
         await statusLogger({
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId,
            message: `Creating cart for ${brandCustomerId}`
         })
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

         await statusLogger({
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId,
            message: `Cart ${cartId} is created.`
         })
      }

      await addProductsToCart({
         keycloakId,
         brand_customerId,
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
               subscriptionAddressId = '',
               subscriptionPaymentMethodId = ' ',
               brandId,
               customer = {}
            }
         ] = brand_customers
         const { id = '', keycloakId = '', platform_customer = {} } = customer
         let deliveryTime = null
         if (availableZipcodes.length > 0) {
            deliveryTime = availableZipcodes[0].deliveryTime
         }

         const defaultAddress =
            platform_customer &&
            platform_customer.customerAddresses &&
            platform_customer.customerAddresses.filter(
               address => address.id === subscriptionAddressId
            )

         let customerInfo = {
            customerEmail: '',
            customerPhone: '',
            customerLastName: '',
            customerFirstName: ''
         }

         if ('email' in platform_customer && platform_customer.email) {
            customerInfo.customerEmail = platform_customer.email
         }
         if (
            'phoneNumber' in platform_customer &&
            platform_customer.phoneNumber
         ) {
            customerInfo.customerPhone = platform_customer.phoneNumber
         }
         if ('firstName' in platform_customer && platform_customer.firstName) {
            customerInfo.customerFirstName = platform_customer.firstName
         }
         if ('lastName' in platform_customer && platform_customer.lastName) {
            customerInfo.customerLastName = platform_customer.lastName
         }

         let fulfillmentInfo = {
            type: 'PREORDER_DELIVERY',
            slot: {
               from: '',
               to: ''
            }
         }

         if (
            fulfillmentDate &&
            deliveryTime &&
            Object.keys(deliveryTime || {}).length > 0
         ) {
            if (deliveryTime.from) {
               fulfillmentInfo.slot.from = evalTime(
                  fulfillmentDate,
                  deliveryTime.from
               )
            }
            if (deliveryTime.to) {
               fulfillmentInfo.slot.to = evalTime(
                  fulfillmentDate,
                  deliveryTime.to
               )
            }
         }

         const { createCart } = await client.request(CREATE_CART, {
            object: {
               brandId,
               status: 'CART_PENDING',
               customerId: parseInt(id),
               paymentStatus: 'PENDING',
               customerInfo,
               fulfillmentInfo,
               source: 'subscription',
               address: defaultAddress,
               customerKeycloakId: keycloakId,
               subscriptionOccurenceId,
               ...(platform_customer &&
                  platform_customer.stripeCustomerId && {
                     stripeCustomerId: platform_customer.stripeCustomerId
                  }),
               ...(subscriptionPaymentMethodId && {
                  paymentMethodId: subscriptionPaymentMethodId
               })
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
   query subscriptionOccurences(
      $brandCustomerId: Int!
      $subscriptionOccurenceId: Int!
   ) {
      brandCustomers(where: { id: { _eq: $brandCustomerId } }) {
         keycloakId
         subscriptionOccurences(
            where: {
               subscriptionOccurenceId: { _eq: $subscriptionOccurenceId }
            }
         ) {
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
      subscriptionOccurences(where: { id: { _eq: $subscriptionOccurenceId } }) {
         id
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
            brand_customers(where: { id: { _eq: $brandCustomerId } }) {
               brandCustomerId: id
               subscriptionAddressId
               subscriptionPaymentMethodId
               brandId
               subscriptionOccurences(
                  where: {
                     subscriptionOccurenceId: { _eq: $subscriptionOccurenceId }
                  }
               ) {
                  validStatus
                  isAuto
                  cartId
                  isSkipped
               }
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
               }
            }
         }
      }
   }
`

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
