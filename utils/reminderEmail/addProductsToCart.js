import { sendEmail } from '..'
import { client } from '../../lib/graphql'

export const addProductsToCart = async ({
   brandCustomerId,
   subscriptionOccurenceId,
   products
}) => {
   try {
      console.log('Adding Products To Cart')
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

      console.log('sortedProducts: ', sortedProducts.length, count)
      if (sortedProducts.length >= count) {
         while (i < count) {
            console.log('Adding ', i, ' Products')
            try {
               await client.request(INSERT_CART_ITEM, {
                  object: {
                     ...sortedProducts[i].cartItem,
                     cartId,
                     isAutoAdded: true
                  }
               })
            } catch (error) {
               throw Error(error.message)
            }
            i++
         }

         if (isSkipped) {
            console.log('Cart is skipped for ', brandCustomerId)
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
