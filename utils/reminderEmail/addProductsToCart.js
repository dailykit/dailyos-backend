import { emailTrigger } from '..'
import { client } from '../../lib/graphql'

export const addProductsToCart = async ({
   brandCustomerId,
   subscriptionOccurenceId,
   products
}) => {
   try {
      await statusLogger(
         brandCustomerId,
         subscriptionOccurenceId,
         'Adding Products To Cart'
      )
      const {
         brandCustomers: [
            {
               subscriptionOccurences: [
                  {
                     validStatus = {},
                     cartId,
                     isSkipped,
                     subscriptionOccurence = {}
                  }
               ] = []
            }
         ] = []
      } = await client.request(PENDING_PRODUCT_COUNT, {
         brandCustomerId,
         subscriptionOccurenceId
      })
      const method = require(`../../options/${
         subscriptionOccurence.subscriptionAutoSelectOption &&
         subscriptionOccurence.subscriptionAutoSelectOption
      }`)

      const sortedProducts = await method.default(products)
      let i = 0,
         count = validStatus.pendingProductsCount

      if (sortedProducts.length >= count) {
         while (i < count) {
            try {
               let node = insertCartId(...sortedProducts[i].cartItem, cartId)
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
            await statusLogger(
               brandCustomerId,
               subscriptionOccurenceId,
               `Brand Customer ${brandCustomerId} has skipped the week. Sending Email`
            )
            await emailTrigger({
               title: 'weekSkipped',
               variables: {
                  brandCustomerId,
                  subscriptionOccurenceId
               },
               to: customer.email
            })
         } else {
            await statusLogger(
               brandCustomerId,
               subscriptionOccurenceId,
               `Products have been added for ${brandCustomerId} and ${subscriptionOccurenceId}. Sending Email`
            )
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
         await statusLogger(brandCustomerId, subscriptionOccurenceId, {
            error: `Not enought products in ${subscriptionOccurenceId} `
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

export const statusLogger = async (
   brandCustomerId,
   subscriptionOccurenceId,
   log
) => {
   await client.request(UPDATE_CUSTOMER_LOGS, {
      brandCustomerId,
      subscriptionOccurenceId,
      object: {
         logs: log
      }
   })
}

export const UPDATE_CUSTOMER_LOGS = `mutation StatusLogger($object: subscription_subscriptionOccurence_customer_prepend_input!, $brandCustomerId: Int!, $subscriptionOccurenceId: Int!) {
  update_subscription_subscriptionOccurence_customer(where: {brand_customerId: {_eq: $brandCustomerId}, subscriptionOccurenceId: {_eq: $subscriptionOccurenceId }}, _prepend: $object) {
    returning {
      logs
    }
  }
}
`

export const INSERT_CART_ITEM = `
   mutation createCartItem($object: order_cartItem_insert_input!) {
      createCartItem(object: $object) {
         id
      }
   }
`

const PENDING_PRODUCT_COUNT = `
query pendingProductCount($brandCustomerId: Int!, $subscriptionOccurenceId: Int!) {
  brandCustomers(where: {id: {_eq: $brandCustomerId}}) {
    subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}) {
      validStatus
      cartId
      isSkipped
      subscriptionOccurence {
        subscriptionAutoSelectOption
        subscriptionId
      }
    }
  }
}

`
