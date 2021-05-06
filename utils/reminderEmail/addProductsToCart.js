import { emailTrigger } from '..'
import { client } from '../../lib/graphql'

export const addProductsToCart = async ({
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId,
   products
}) => {
   try {
      const { brandCustomers = [] } = await client.request(
         PENDING_PRODUCT_COUNT,
         {
            subscriptionOccurenceId,
            brandCustomerId: brand_customerId
         }
      )

      if (brandCustomers.lentgh === 0) return
      const [brand_customer] = brandCustomers
      const { subscriptionOccurences = [] } = brand_customer

      if (subscriptionOccurences.length === 0) return
      const {
         validStatus = {},
         cartId = null,
         isSkipped,
         subscriptionOccurence = {}
      } = subscriptionOccurences[0]

      const method = require(`../../options/${
         subscriptionOccurence.subscriptionAutoSelectOption &&
         subscriptionOccurence.subscriptionAutoSelectOption
      }`)

      const sortedProducts = await method.default(products)
      let i = 0
      let count = validStatus.pendingProductsCount

      if (Array.isArray(sortedProducts) && sortedProducts.length >= count) {
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
                  brandCustomerId,
                  subscriptionOccurenceId
               },
               to: customer.email
            })
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
                  brandCustomerId,
                  subscriptionOccurenceId
               },
               to: customer.email
            })
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
      }
   } catch (error) {
      throw Error(error.message)
   }
}

const insertCartId = (node, cartId) => {
   if (node.childs.data.length > 0) {
      node.childs.data = node.childs.data.map(item => {
         if (item.childs.data.length > 0) {
            item.childs.data = item.childs.data.map(item => ({
               ...item,
               cartId
            }))
         }
         return { ...item, cartId }
      })
   }
   node.cartId = cartId
   return node
}

export const statusLogger = async ({
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId,
   message,
   type = ''
}) => {
   await client.request(INSERT_ACTIVITY_LOGS, {
      objects: [
         {
            type,
            keycloakId,
            brand_customerId,
            subscriptionOccurenceId,
            log: { message }
         }
      ]
   })
}

export const INSERT_CART_ITEM = `
   mutation createCartItem($object: order_cartItem_insert_input!) {
      createCartItem(object: $object) {
         id
      }
   }
`

const PENDING_PRODUCT_COUNT = `
   query pendingProductCount(
      $brandCustomerId: Int!
      $subscriptionOccurenceId: Int!
   ) {
      brandCustomers(where: { id: { _eq: $brandCustomerId } }) {
         id
         subscriptionOccurences(
            where: {
               subscriptionOccurenceId: { _eq: $subscriptionOccurenceId }
            }
         ) {
            validStatus
            cartId
            isSkipped
            subscriptionOccurenceId
            subscriptionOccurence {
               id
               subscriptionAutoSelectOption
               subscriptionId
            }
         }
      }
   }
`

const INSERT_ACTIVITY_LOGS = `
   mutation insertActivityLogs(
      $objects: [settings_activityLogs_insert_input!]!
   ) {
      insertActivityLogs: insert_settings_activityLogs(objects: $objects) {
         affected_rows
      }
   }
`
