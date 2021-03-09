import { sendEmail } from '../'
import { client } from '../../lib/graphql'

export const addProducts = async ({
   cartId,
   brandCustomerId,
   subscriptionOccurenceId
}) => {
   try {
      const {
         brandCustomers: {
            customer: {
               subscriptionOccurence: {
                  validStatus,
                  subscriptionOccurence
               } = {}
            } = {}
         } = []
      } = await client.request(PENDING_PRODUCT_COUNT, {
         brandCustomerId,
         subscriptionOccurenceId
      })

      // Get ${validStatus.pendingProductsCount} no of products using the subAutoSelectOption

      sendEmail({ brandCustomerId, subscriptionOccurenceId })
   } catch (error) {
      throw Error(error.message)
   }
}

const PENDING_PRODUCT_COUNT = `
query pendingProductCount($brandCustomerId: Int!, $subscriptionOccurenceId: Int!) {
  brandCustomers(where: {id: {_eq: $brandCustomerId}}) {
    customer {
      subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}) {
        validStatus
        subscriptionOccurence {
          subscriptionAutoSelectOption
        }
      }
    }
  }
}

`
