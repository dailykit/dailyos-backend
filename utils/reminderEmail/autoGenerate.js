import { evalTime, sendEmail } from '..'
import { CREATE_CART } from '../../entities/occurence/graphql'

export const autoGenerate = async data => {
   try {
      // Fetch products
      createCart(data)
   } catch (error) {
      throw Error(error.message)
   }
}

const createCart = async data => {
   console.log(data)
   const {
      isAuto,
      deliveryTime,
      deliveryPrice,
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
