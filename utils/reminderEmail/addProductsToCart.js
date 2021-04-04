import { sendEmail } from '..'
import { client } from '../../lib/graphql'

export const addProductsToCart = async ({
   brandCustomerId,
   subscriptionOccurenceId,
   products
}) => {
   try {
      const {
         brandCustomers: {
            customer: {
               subscriptionOccurence: {
                  validStatus = {},
                  cartId,
                  isSkipped,
                  subscriptionOccurence = {}
               } = {}
            } = {}
         } = []
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
         count = validStatus.pendingProductCount

      if (sortedProducts.length >= count) {
         while (i < count) {
            try {
               await client.request(INSERT_CART_ITEM, {
                  object: { ...sortedProducts[i], cartId }
               })
            } catch (error) {
               throw Error(error.message)
            }
            i++
         }

         if (isSkipped) {
            await sendEmail({ brandCustomerId, subscriptionOccurenceId })
         } else {
            await sendEmail({ brandCustomerId, subscriptionOccurenceId })
         }
      } else {
         console.log('Not enough products')
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
