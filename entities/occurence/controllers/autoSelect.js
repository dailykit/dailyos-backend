import { client } from '../../../lib/graphql'
import { statusLogger } from '../../../utils/reminderEmail'

export const autoSelect = async (req, res) => {
   try {
      const { keycloakId, brand_customerId, subscriptionOccurenceId } = req.body

      const { subscriptionOccurences = [] } = await client.request(
         SUBSCRIPTION_OCCURENCE,
         {
            where: { id: { _eq: subscriptionOccurenceId } }
         }
      )

      if (subscriptionOccurences.length === 0)
         return res.status(200).json({
            success: false,
            message: `No such subscription occurence linked with id ${subscriptionOccurenceId}.`
         })

      const [occurence] = subscriptionOccurences

      const { products = [] } = await client.request(GET_PRODUCTS, {
         subscriptionOccurenceId,
         subscriptionId: occurence.subscriptionId
      })

      const { subscriptionOccurence_customers = [] } = await client.request(
         SUBSCRIPTION_OCCURENCE_CUSTOMERS,
         {
            where: {
               subscriptionOccurenceId: { _eq: subscriptionOccurenceId },
               brandCustomerId: { _eq: brand_customerId }
            }
         }
      )

      if (subscriptionOccurence_customers.length === 0)
         return res.status(200).json({
            success: false,
            message: `There's no occurence customer linked with brand customer id ${brand_customer.id}`
         })

      const [subscriptionOccurence_customer] = subscriptionOccurence_customers

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
               to: brand_customer.customer.email
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
               to: brand_customer.customer.email
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
      return res.status(500).json({ success: false, error })
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

const GET_PRODUCTS = `
   query products($subscriptionOccurenceId: Int!, $subscriptionId: Int!) {
      products: subscription_subscriptionOccurence_product(
         where: {
            _or: [
               { subscriptionOccurenceId: { _eq: $subscriptionOccurenceId } }
               { subscriptionId: { _eq: $subscriptionId } }
            ]
         }
      ) {
         cartItem
      }
   }
`

const SUBSCRIPTION_OCCURENCE = `
   query subscriptionOccurences(
      $where: subscription_subscriptionOccurence_bool_exp = {}
   ) {
      subscriptionOccurences(where: $where) {
         id
         subscriptionId
      }
   }
`

const SUBSCRIPTION_OCCURENCE_CUSTOMERS = `
   query subscriptionOccurence_customers(
      $where: subscription_subscriptionOccurence_customer_bool_exp = {}
   ) {
      subscriptionOccurence_customers: subscription_subscriptionOccurence_customer(
         where: $where
      ) {
         cartId
         isSkipped
         validStatus
         brand_customerId
         brand_customer {
            id
            keycloakId
            customer {
               id
               email
            }
         }
         subscriptionOccurenceId
         subscriptionOccurence {
            id
            subscriptionId
            subscriptionAutoSelectOption
         }
      }
   }
`

const INSERT_CART_ITEM = `
   mutation createCartItem($object: order_cartItem_insert_input!) {
      createCartItem(object: $object) {
         id
      }
   }
`
