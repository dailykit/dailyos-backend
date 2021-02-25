import { client } from '../../../lib/graphql'
import { addProducts, sendEmail, autoGenerate } from '../../../utils'
import { GET_CUSTOMERS_DETAILS, GET_TEMPLATE_SETTINGS } from '../graphql'

export const reminderMail = async (req, res) => {
   try {
      const { subscriptionOccurenceId } = req.body.payload
      const {
         subscriptionOccurences: [{ subscription = {} }] = []
      } = await client.request(GET_CUSTOMERS_DETAILS, {
         subscriptionOccurenceId
      })

      const {
         availableZipcodes,
         identifier: { template } = {},
         brand_customers = []
      } = subscription

      const {
         brands_brand_subscriptionStoreSetting: [{ value = {} }] = []
      } = await client.request(GET_TEMPLATE_SETTINGS, {
         identifier: template
      })

      await Promise.all(
         brand_customers.map(async customer => {
            try {
               if (customer.customer.subscriptionOccurences.length !== 0) {
                  // Cart exists
                  const {
                     isAuto,
                     orderCartId,
                     isSkipped
                  } = customer.customer.subscriptionOccurences[0]

                  if (isAuto) {
                     // Cart is Created by us --> paymentDeductionAuto
                     sendEmail({ customer, templateSettings: value })
                  } else {
                     if (isSkipped === false && orderCartId) {
                        // Cart is Created by them --> paymentDeduction
                        addProducts(customer)
                     } else {
                        // Skipped the week --> SkipWeek
                        sendEmail({ customer, templateSettings: value })
                     }
                  }
               } else {
                  // Cart doesn't exist
                  if (customer.isAutoSelectOptOut) {
                     // Doesn't have option to creat cart --> SkipWeek
                     sendEmail({ customer, templateSettings: value })
                  } else {
                     // create cart
                     autoGenerate({
                        ...availableZipcodes,
                        ...customer,
                        subscriptionOccurenceId,
                        templateSettings: value,
                        isAuto: true
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
