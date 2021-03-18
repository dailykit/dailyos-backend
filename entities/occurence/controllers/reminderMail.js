import { client } from '../../../lib/graphql'
import { addProducts, sendEmail, autoGenerate } from '../../../utils'
import { GET_CUSTOMERS_DETAILS, GET_TEMPLATE_SETTINGS } from '../graphql'

export const reminderMail = async (req, res) => {
   try {
      const { subscriptionOccurenceId } = req.body.payload
      const {
         subscriptionOccurences: [
            { subscription: { brand_customers = [] } = {} }
         ] = []
      } = await client.request(GET_CUSTOMERS_DETAILS, {
         id: subscriptionOccurenceId
      })

      await Promise.all(
         brand_customers.map(async brand_customer => {
            // console.log(brand_customer)
            try {
               const {
                  brandCustomerId,
                  isAutoSelectOptOut,
                  customer
               } = brand_customer
               if (customer.subscriptionOccurences.length !== 0) {
                  // Cart exists
                  const {
                     isAuto,
                     cartId,
                     isSkipped,
                     validStatus
                  } = customer.subscriptionOccurences[0]

                  if (isAuto) {
                     // Cart is Created by us
                     sendEmail({ brandCustomerId, subscriptionOccurenceId })
                  } else {
                     if (isSkipped === false && !validStatus.itemCountValid) {
                        // Cart is Created by them
                        addProducts({
                           cartId,
                           brandCustomerId,
                           subscriptionOccurenceId
                        })
                     } else {
                        // Skipped the week
                        sendEmail({ brandCustomerId, subscriptionOccurenceId })
                     }
                  }
               } else {
                  // Cart doesn't exist
                  if (isAutoSelectOptOut) {
                     // Doesn't have option to creat cart
                     sendEmail({ brandCustomerId, subscriptionOccurenceId })
                  } else {
                     // create cart
                     autoGenerate({
                        brandCustomerId,
                        subscriptionOccurenceId
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
