import { sendEmail } from '../'
import { client } from '../../lib/graphql'

export const addProducts = async data => {
   const { orderCartId } = customer.customer.subscriptionOccurences[0]

   try {
      //Check Item count
      const { products = [] } = await client.request(CART_ITEMS, {
         orderCartId
      })
      //  Is there a better way?
      let curItemCount = 0
      for (i = 0; i < products.length; i++) {
         curItemCount += products[i].quantity
      }

      const {
         count
      } = products.subscriptionOccurenceProduct.subscription.itemCount

      if (count === curItemCount) {
         sendEmail()
      } else if (count > curItemCount) {
         //Add products
      } else {
         //What? Never gonna happen
      }
   } catch (error) {
      throw Error(error.message)
   }
}

const CART_ITEMS = `
query cartItems($orderCartId: Int!) {
  products: crm_orderCartProduct(where: {cartId: {_eq: $orderCartId}}) {
    cartId
    quantity
    name
    subscriptionOccurenceProduct {
      subscription {
        itemCount: subscriptionItemCount {
          count
        }
      }
    }
  }
}

`
