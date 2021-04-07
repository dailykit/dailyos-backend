import { client } from '../../../lib/graphql'
import { sendEmail, autoGenerateCart } from '../../../utils'
import { GET_CUSTOMERS_DETAILS } from '../graphql'

export const reminderMail = async (req, res) => {
   try {
      const { subscriptionOccurenceId } = req.body.payload
      const {
         subscriptionOccurences: [
            { subscription: { subscriptionId, brand_customers = [] } = {} }
         ] = []
      } = await client.request(GET_CUSTOMERS_DETAILS, {
         id: subscriptionOccurenceId
      })

      const { products = [] } = await client.request(GET_PRODUCTS, {
         subscriptionOccurenceId,
         subscriptionId
      })
      await Promise.all(
         brand_customers.map(async brand_customer => {
            try {
               const {
                  brandCustomerId,
                  isAutoSelectOptOut,
                  subscriptionOccurence_customer
               } = brand_customer
               if (
                  subscriptionOccurence_customer.length !== 0 &&
                  subscriptionOccurence_customer[0].cartId != null &&
                  subscriptionOccurence_customer[0].validStatus.itemCountValid
               ) {
                  const {
                     isAuto,
                     isSkipped
                  } = subscriptionOccurence_customer[0]

                  if (isSkipped === false) {
                     if (isAuto) {
                        // sendEmail({ brandCustomerId, subscriptionOccurenceId })
                     } else {
                        // sendEmail({ brandCustomerId, subscriptionOccurenceId })
                     }
                  } else {
                     // sendEmail({
                     //    brandCustomerId,
                     //    subscriptionOccurenceId
                     // })
                  }
               } else {
                  if (isAutoSelectOptOut) {
                     // sendEmail({ brandCustomerId, subscriptionOccurenceId })
                  } else {
                     autoGenerateCart({
                        brandCustomerId,
                        subscriptionOccurenceId,
                        products
                     })
                  }
               }
            } catch (error) {
               throw Error(error.message)
            }
         })
      )

      return res.status(200).json({
         success: true,
         message: 'Successfully sent the mail'
      })
   } catch (error) {
      console.log('Reminder email -> error', error)
      return res.status(400).json({ success: false, error: error.message })
   }
}

const GET_PRODUCTS = `query getProducts($subscriptionOccurenceId: Int! $subscriptionId: Int!) {
  products: subscription_subscriptionOccurence_product(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}, _or: {subscriptionId: {_eq: $subscriptionId}}}) {
    cartItem
  }
}
`
