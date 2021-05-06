import { client } from '../../../lib/graphql'
import { emailTrigger, autoGenerateCart, statusLogger } from '../../../utils'
import { GET_CUSTOMERS_DETAILS } from '../graphql'

export const reminderMail = async (req, res) => {
   try {
      const { subscriptionOccurenceId } = req.body.payload
      const { subscriptionOccurences = [] } = await client.request(
         GET_CUSTOMERS_DETAILS,
         {
            id: subscriptionOccurenceId
         }
      )

      if (subscriptionOccurences.length === 0)
         return res.status(200).json({
            success: false,
            message: `No subscription occurence linked to id ${subscriptionOccurenceId}`
         })

      const [occurence] = subscriptionOccurences
      const { subscription = {}, subscriptionId } = occurence

      if (!subscriptionId)
         return res.status(200).json({
            success: false,
            message: `No subscription is linked to occurence id ${subscriptionOccurenceId}`
         })

      const { brand_customers = [] } = subscription

      if (brand_customers.length === 0)
         return res.status(200).json({
            success: false,
            message: `There are no brand customers yet linked to subscription id ${subscriptionId}`
         })

      await Promise.all(
         brand_customers.map(async customer => {
            try {
               const {
                  id,
                  keycloakId,
                  isAutoSelectOptOut,
                  subscriptionOccurences = []
               } = customer

               await statusLogger({
                  keycloakId,
                  brand_customerId: id,
                  subscriptionOccurenceId,
                  type: 'Reminder Email',
                  message:
                     'Initiating reminder emails and auto product selection system.'
               })

               if (
                  subscriptionOccurences.length > 0 &&
                  subscriptionOccurences[0].cartId != null &&
                  'itemCountValid' in subscriptionOccurences[0].validStatus &&
                  subscriptionOccurences[0].validStatus.itemCountValid
               ) {
                  const [occurence] = subscriptionOccurences
                  const { isAuto, isSkipped } = occurence

                  if (isSkipped) {
                     await statusLogger({
                        keycloakId,
                        brand_customerId: id,
                        type: 'Reminder Email',
                        subscriptionOccurenceId,
                        message:
                           'Sent reminder email alerting customer that this week is skipped.'
                     })
                     await emailTrigger({
                        title: 'weekSkipped',
                        variables: {
                           brandCustomerId,
                           subscriptionOccurenceId
                        },
                        to: customerEmail.email
                     })
                  } else {
                     if (isAuto) {
                        await statusLogger({
                           keycloakId,
                           brand_customerId: id,
                           type: 'Reminder Email',
                           subscriptionOccurenceId,
                           message: `Sent reminder email for previously auto generated cart.`
                        })
                        await emailTrigger({
                           title: 'autoGenerateCart',
                           variables: {
                              brandCustomerId: id,
                              subscriptionOccurenceId
                           },
                           to: customerEmail.email
                        })
                     } else {
                        await statusLogger({
                           keycloakId,
                           brand_customerId: id,
                           type: 'Reminder Email',
                           subscriptionOccurenceId,
                           message: `Sending reminder email for existing cart.`
                        })
                        await emailTrigger({
                           title: 'allSetCart',
                           variables: {
                              brandCustomerId: id,
                              subscriptionOccurenceId
                           },
                           to: customerEmail.email
                        })
                     }
                  }
               } else {
                  if (isAutoSelectOptOut) {
                     await statusLogger({
                        keycloakId,
                        type: 'Reminder Email',
                        brand_customerId: id,
                        subscriptionOccurenceId,
                        message: `Brand Customer ${id} doesn't have option to generate the cart. Sent Email`
                     })
                     await emailTrigger({
                        title: 'weekSkipped',
                        variables: {
                           brandCustomerId: id,
                           subscriptionOccurenceId
                        },
                        to: customerEmail.email
                     })
                  } else {
                     await autoGenerateCart({
                        keycloakId,
                        brand_customerId: id,
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
      return res.status(400).json({ success: false, error: error.message })
   }
}
