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
         subscriptionOccurenceId
      })

      // Fetch products using $subscriptionAutoSelectOption
      const { count } = subscription.subscriptionItemCount
      createCart({
         ...subscription,
         subscriptionOccurenceId,
         isAuto: true
      })
      sendEmail({ brandCustomerId, subscriptionOccurenceId })
   } catch (error) {
      throw Error(error.message)
   }
}

const createCart = async data => {
   console.log(data)
   const {
      isAuto,
      availableZipcodes: { deliveryTime, deliveryPrice },
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
         }
      }
   } = data

   const defaultAddress =
      platform_customer &&
      platform_customer.customerAddresses.filter(
         address => address.id === subscriptionAddressId
      )

   await client.request(CREATE_CART, {
      object: {
         status: 'PENDING',
         customerId: id,
         paymentStatus: 'PENDING',
         cartInfo: {},
         ...(subscriptionPaymentMethodId && {
            paymentId: subscriptionPaymentMethodId
         }),
         cartSource: 'subscription',
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
}

const GET_CUSTOMER_ORDER_DETAILS = `
query customerOrder($subscriptionOccurenceId: Int!) {
  subscriptionOccurences(where: {id: {_eq: $subscriptionOccurenceId}}) {
    subscriptionAutoSelectOption
    subscription {
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
            orderCartId
            isSkipped
          }
        }
      }
    }
  }
}`
