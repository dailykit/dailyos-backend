import { client } from '../lib/graphql'
const getProducts = async (
   { subscriptionOccurenceId, subscriptionId },
   noOfItem
) => {
   try {
      const { products = [] } = await client.request(QUERY, {
         subscriptionOccurenceId,
         subscriptionId
      })

      if (products.length < noOfItem) {
         return { status: 400 }
      }

      let randomProducts = [],
         index = 0

      while (noOfItem > 0) {
         index = Math.floor(Math.random() * products.length)
         randomProducts.push(products[index])
         products.splice(index, 1)
         noOfItem--
      }
      console.log('randomProducts: ', randomProducts)
      return { status: 200, randomProducts }
   } catch (error) {
      console.log(error)
   }
}

const QUERY = `query getProducts($subscriptionOccurenceId: Int! $subscriptionId: Int!) {
  products: subscription_subscriptionOccurence_product(where: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}, _or: {subscriptionId: {_eq: $subscriptionId}}}) {
    cartItem
  }
}
`
export default getProducts
