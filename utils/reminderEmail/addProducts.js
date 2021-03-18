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
                  validStatus = {},
                  cartId,
                  subscriptionOccurence = {}
               } = {}
            } = {}
         } = []
      } = await client.request(PENDING_PRODUCT_COUNT, {
         brandCustomerId,
         subscriptionOccurenceId
      })

      const method = require(`../../options/${
         subscriptionOccurence.subscriptionAutoSelectOption
            ? subscriptionOccurence.subscriptionAutoSelectOption
            : 'products'
      }`)

      const products = await method.default(
         {
            subscriptionOccurenceId,
            subscriptionId: subscriptionOccurence.subscriptionId
         },
         validStatus.pendingProductCount
      )

      if (products.status != 400) {
         await Promise.all(
            products.randomProducts.map(async item => {
               try {
                  await client.request(INSERT_CART_ITEM, {
                     object: { ...item, cartId }
                  })
               } catch (error) {
                  throw Error(error.message)
               }
            })
         )

         await sendEmail({ brandCustomerId, subscriptionOccurenceId })
      }
   } catch (error) {
      throw Error(error.message)
   }
}

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
    customer {
      subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}) {
        validStatus
        cartId
        subscriptionOccurence {
          subscriptionAutoSelectOption
          subscriptionId
        }
      }
    }
  }
}

`
