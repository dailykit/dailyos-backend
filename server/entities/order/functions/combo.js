import processInventory from './inventory'
import processSimpleRecipe from './simpleRecipe'

export default async function ({ product: combo, orderId }) {
   try {
      const repetitions = Array.from({ length: combo.quantity }, (_, v) => v)

      await Promise.all(
         repetitions.map(async () => {
            const result = await Promise.all(
               combo.components.map(product => {
                  const args = { product, orderId, comboProductId: combo.id }
                  switch (product.type) {
                     case 'simpleRecipeProduct':
                        return processSimpleRecipe(args)
                     case 'inventoryProduct':
                        return processInventory(args)
                     default:
                        throw Error('No such product type exists!')
                  }
               })
            )
            return result
         })
      )

      return
   } catch (error) {
      throw Error(error)
   }
}
