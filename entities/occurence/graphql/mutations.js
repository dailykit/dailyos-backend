export const INSERT_SUBS_OCCURENCES = `
   mutation insertSubscriptionOccurences(
      $objects: [subscription_subscriptionOccurence_insert_input!]!
   ) {
      insertSubscriptionOccurences(
         objects: $objects, 
         on_conflict: {constraint: subscriptionOccurence_id_key, update_columns: []}
      ) {
         affected_rows
      }
   }
`

export const UPDATE_SUBSCRIPTION = `
   mutation updateSubscription($id: Int!, $startDate: date!) {
      updateSubscription: update_subscription_subscription_by_pk(
         pk_columns: {id: $id}, 
         _set: {startDate: $startDate}
      ) {
            id
      }
   }
`
