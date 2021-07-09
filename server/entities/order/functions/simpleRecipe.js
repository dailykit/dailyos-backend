import { client } from '../../../lib/graphql'

import { FETCH_SIMPLE_RECIPE_PRODUCT } from '../graphql/queries'
import processMealKit from './mealkit'
import processReadyToEat from './readyToEat'

export default async function ({
   product,
   orderId,
   comboProductId = null,
   modifier = null
}) {
   try {
      const variables = { id: product.option.id }
      const { simpleRecipeProductOption: productOption } = await client.request(
         FETCH_SIMPLE_RECIPE_PRODUCT,
         variables
      )

      const args = {
         product,
         orderId,
         productOption,
         comboProductId,
         modifier
      }

      const count = Array.from({ length: product.quantity }, (_, v) => v)
      switch (product.option.type) {
         case 'mealKit': {
            await Promise.all(count.map(() => processMealKit(args)))
            return
         }
         case 'readyToEat': {
            await Promise.all(count.map(() => processReadyToEat(args)))
            return
         }
         default:
            throw Error('No such product type exists!')
      }
   } catch (error) {
      throw Error(error)
   }
}
