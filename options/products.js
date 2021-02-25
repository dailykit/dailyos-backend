const QUERY = `query MyQuery($id: Int!) {
  subscription_subscriptionOccurence_product(where: {subscriptionOccurenceId: {_eq: $id}}) {
    id
    cartItem
    orderCartProducts_aggregate(where: {isAutoAdded: {_eq: false}}) {
      aggregate {
        count
        sum {
          quantity
        }
      }
    }
  }
}
`
export default QUERY
