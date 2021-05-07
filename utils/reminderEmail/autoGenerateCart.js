import axios from 'axios'
import { evalTime } from '..'
import { client } from '../../lib/graphql'
import {
   CREATE_CART,
   UPDATE_SUB_OCCURENCE
} from '../../entities/occurence/graphql'
import { statusLogger } from './'

export const autoGenerateCart = async ({
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId
}) => {
   await statusLogger({
      keycloakId,
      brand_customerId,
      type: 'Reminder Email',
      subscriptionOccurenceId,
      message: `Attempting autoGenerate ${brand_customerId}`
   })
   try {
      const { brandCustomers = [] } = await client.request(GET_SUB_OCCURENCE, {
         brandCustomerId: brand_customerId,
         subscriptionOccurenceId
      })

      if (
         brandCustomers.length > 0 &&
         brandCustomers[0].subscriptionOccurences.length === 0
      ) {
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
            type: 'Reminder Email',
            subscriptionOccurenceId,
            message: `Subscription Occurence Customer created.`
         })
      }

      const { subscriptionOccurences = [] } = await client.request(
         GET_CUSTOMER_ORDER_DETAILS,
         {
            subscriptionOccurenceId,
            brandCustomerId: brand_customerId
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

      const URL = `${
         new URL(process.env.DATA_HUB).origin
      }/webhook/occurence/auto-select`
      if (cartId) {
         await axios.post(URL, {
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId
         })
      } else {
         let _cartId = await createCart({
            ...subscription,
            subscriptionOccurenceId,
            isAuto: true,
            fulfillmentDate
         })

         await client.request(UPDATE_SUB_OCCURENCE, {
            subscriptionOccurenceId,
            brandCustomerId: brand_customerId,
            isAuto: true,
            cartId: _cartId
         })

         await statusLogger({
            keycloakId,
            brand_customerId,
            type: 'Reminder Email',
            subscriptionOccurenceId,
            message: 'Cart has been created for auto product selection.'
         })

         if (_cartId) {
            await axios.post(URL, {
               keycloakId,
               brand_customerId,
               subscriptionOccurenceId
            })
         }
      }
   } catch (error) {
      throw error
   }
}

const createCart = async data => {
   try {
      const {
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

         const { organization } = await client.request(ORGANIZATION, {
            id: process.env.ORGANIZATION_ID
         })

         const { stripeAccountType = '' } = organization

         let stripeCustomerId = platform_customer.stripeCustomerId
         const { customerByClients = [] } = platform_customer

         if (customerByClients.length > 0 && stripeAccountType === 'standard') {
            const [customer] = customerByClients
            stripeCustomerId = customer.organizationStripeCustomerId
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
               ...(stripeCustomerId && { stripeCustomerId }),
               ...(subscriptionPaymentMethodId && {
                  paymentMethodId: subscriptionPaymentMethodId
               })
            }
         })
         return createCart.cartId
      }
   } catch (error) {
      throw error
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

const ORGANIZATION = `
   query organization($id: Int!) {
      organization(id: $id) {
         id
         stripeAccountType
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
                     customerByClients: CustomerByClients {
                        keycloakId
                        organizationStripeCustomerId
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
