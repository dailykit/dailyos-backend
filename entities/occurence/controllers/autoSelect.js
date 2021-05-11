import { client } from '../../../lib/graphql'
import { SUBSCRIPTION_OCCURENCES } from '../graphql'
import { statusLogger, emailTrigger } from '../../../utils/reminderEmail'

export const autoSelect = async (req, res) => {
   try {
      let rows = []

      if ('input' in req.body) {
         rows = req.body.input.rows
      } else {
         rows.push(req.body)
      }

      const result = await Promise.all(
         rows.map(async row => {
            try {
               const { keycloakId, brand_customerId, subscriptionOccurenceId } =
                  row
               const { subscriptionOccurences = [] } = await client.request(
                  SUBSCRIPTION_OCCURENCES,
                  {
                     where: { id: { _eq: subscriptionOccurenceId } }
                  }
               )

               if (subscriptionOccurences.length === 0)
                  return {
                     success: false,
                     message: `No such subscription occurence linked with id ${subscriptionOccurenceId}.`
                  }

               const [occurence] = subscriptionOccurences

               const {
                  subscriptionId,
                  subscription = {},
                  settings: localSettings
               } = occurence

               if (subscriptionId) {
                  const { settings: globalSettings } = subscription
                  if (
                     globalSettings.isAutoSelect === false ||
                     localSettings.isAutoSelect === false
                  )
                     return {
                        success: true,
                        message: `Reminder email functionality is disabled`
                     }
               }

               const { products = [] } = await client.request(GET_PRODUCTS, {
                  subscriptionOccurenceId,
                  subscriptionId: occurence.subscriptionId
               })

               const { subscriptionOccurence_customers = [] } =
                  await client.request(SUBSCRIPTION_OCCURENCE_CUSTOMERS, {
                     where: {
                        brand_customerId: { _eq: row.brand_customerId },
                        subscriptionOccurenceId: {
                           _eq: subscriptionOccurenceId
                        }
                     }
                  })

               if (subscriptionOccurence_customers.length === 0)
                  return {
                     success: false,
                     message: `There's no occurence customer linked with brand customer id ${brand_customer.id}`
                  }

               const [subscriptionOccurence_customer] =
                  subscriptionOccurence_customers

               const {
                  validStatus = {},
                  cartId = null,
                  isSkipped,
                  subscriptionOccurence = {},
                  brand_customer
               } = subscriptionOccurence_customer

               const method = require(`../../../options/${
                  subscriptionOccurence.subscriptionAutoSelectOption &&
                  subscriptionOccurence.subscriptionAutoSelectOption
               }`)

               const sortedProducts = await method.default(products)
               let i = 0
               let count = validStatus.pendingProductsCount

               if (
                  Array.isArray(sortedProducts) &&
                  sortedProducts.length >= count
               ) {
                  while (i < count) {
                     try {
                        let { cartItem = {} } = sortedProducts[i]
                        let node = insertCartId(cartItem, cartId)
                        await client.request(INSERT_CART_ITEM, {
                           object: {
                              ...node,
                              isAutoAdded: true
                           }
                        })
                     } catch (error) {
                        throw Error(error.message)
                     }
                     i++
                  }

                  if (isSkipped) {
                     await statusLogger({
                        keycloakId,
                        brand_customerId,
                        subscriptionOccurenceId,
                        type: 'Auto Select Product',
                        message:
                           'Sent reminder email alerting customer that this week is skipped.'
                     })
                     await emailTrigger({
                        title: 'weekSkipped',
                        variables: {
                           subscriptionOccurenceId,
                           brandCustomerId: brand_customerId
                        },
                        to: brand_customer.customer.email
                     })
                     return {
                        data: row,
                        success: true,
                        message:
                           'Sent reminder email alerting customer that this week is skipped.'
                     }
                  } else {
                     await statusLogger({
                        keycloakId,
                        brand_customerId,
                        subscriptionOccurenceId,
                        type: 'Auto Select Product',
                        message:
                           'Sent email reminding customer that product has been added for this week.'
                     })
                     await emailTrigger({
                        title: 'autoGenerateCart',
                        variables: {
                           subscriptionOccurenceId,
                           brandCustomerId: brand_customerId
                        },
                        to: brand_customer.customer.email
                     })
                     return {
                        data: row,
                        success: true,
                        message:
                           'Sent email reminding customer that product has been added for this week.'
                     }
                  }
               } else {
                  await statusLogger({
                     keycloakId,
                     brand_customerId,
                     subscriptionOccurenceId,
                     type: 'Auto Select Product',
                     message:
                        'This occurence doesnt have enough products to populate cart.'
                  })
                  return {
                     data: row,
                     success: true,
                     message:
                        'This occurence doesnt have enough products to populate cart.'
                  }
               }
            } catch (error) {
               return {
                  data: row,
                  success: false,
                  error: error.message,
                  message: 'Failed to complete auto selection process!'
               }
            }
         })
      )

      return res.status(200).json({
         success: true,
         data: result,
         message: 'Successfully executed auto selection process.'
      })
   } catch (error) {
      return 'input' in req.body
         ? res.status(200).json({
              success: false,
              error: error.message,
              message: 'Failed to complete auto selection process!'
           })
         : res.status(500).json({ success: false, error })
   }
}
