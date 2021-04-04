import { evalTime, sendEmail } from '..'
import { client } from '../../lib/graphql'
import { CREATE_CART } from '../../entities/occurence/graphql'
import { addProductsToCart } from './addProductsToCart'

export const autoGenerateCart = async ({
   brandCustomerId,
   subscriptionOccurenceId,
   products
}) => {
   try {
      const { brand_customers } = await client.request(GET_SUB_OCCURENCE, {
         brandCustomerId,
         subscriptionOccurenceId
      })

      if (
         brand_customers.length > 0 &&
         brand_customers[0].customer.subscriptionOccurence_customer.length === 0
      ) {
         const [{ customer: { keycloakId } = {} }] = brand_customers
         await client.request(INSERT_SUBS_OCCURENCE, {
            object: {
               isAuto: true,
               isSkipped: false,
               keycloakId,
               subscriptionOccurenceId,
               brand_customerId: brandCustomerId
            }
         })
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
         cartId = await createCart({
            ...subscription,
            subscriptionOccurenceId,
            isAuto: true,
            fulfillmentDate
         })

         console.log(cartId)
      }

      addProductsToCart({ brandCustomerId, subscriptionOccurenceId, products })
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

const GET_SUB_OCCURENCE = `
   query subscriptionOccurences($brandCustomerId: Int!, $subscriptionOccurenceId: Int!) {
  brandCustomers(where: {id: {_eq: $brandCustomerId}}) {
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
            id
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
