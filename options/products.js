const QUERY = `query products {
  products: query categories(
      $subscriptionId: Int_comparison_exp
      $occurenceId: Int_comparison_exp
   ) {
      categories: productCategories(
         where: {
            subscriptionOccurenceProducts: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
               isAvailable: { _eq: true }
               isVisible: { _eq: true }
            }
         }
      ) {
         name
         productsAggregate: subscriptionOccurenceProducts_aggregate(
            where: {
               _or: [
                  { subscriptionId: $subscriptionId }
                  { subscriptionOccurenceId: $occurenceId }
               ]
            }
         ) {
            aggregate {
               count
            }
            nodes {
               id
               cartItem
               addonLabel
               addonPrice
               isSingleSelect
               simpleRecipeProductOption {
                  id
                  simpleRecipeYieldId
               }
               inventoryProductOption {
                  id
                  quantity
               }
            }
         }
      }
   }
}`
export default QUERY
//occurrence and sub id
