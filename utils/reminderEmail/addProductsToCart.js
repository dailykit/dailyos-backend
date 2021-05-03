import { emailTrigger } from '..'
import { client } from '../../lib/graphql'

export const addProductsToCart = async ({
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId,
   products
}) => {
   try {
      await statusLogger({
         keycloakId,
         brand_customerId,
         subscriptionOccurenceId,
         message: 'Adding Products To Cart'
      })
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
                     node,
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
               message: `Brand Customer ${brandCustomerId} has skipped the week. Sending Email`
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
               message: `Products have been added for ${brandCustomerId} and ${subscriptionOccurenceId}. Sending Email`
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
            message: {
               error: `Not enought products in ${subscriptionOccurenceId} `
            }
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
   message
}) => {
   await client.request(INSERT_CART_ITEM, {
      objects: [
         {
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
