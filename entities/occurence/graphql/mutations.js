export const INSERT_SUBS_OCCURENCES = `
   mutation insertSubscriptionOccurences(
      $objects: [subscription_subscriptionOccurence_insert_input!]!
   ) {
      insertSubscriptionOccurences(
         objects: $objects, 
         on_conflict: {constraint: subscriptionOccurence_pkey, update_columns: []}
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

export const UPDATE_CARTS = `
mutation updateCarts($subscriptionOccurenceId: Int_comparison_exp!, $cutoffTimeStamp: timestamp_comparison_exp!) {
   updateCarts(where: {paymentStatus: {_neq: "SUCCEEDED"}, subscriptionOccurenceCustomer: {isSkipped: {_eq: false}, subscriptionOccurence: {id: $subscriptionOccurenceId, cutoffTimeStamp: $cutoffTimeStamp}}}, _inc: {paymentRetryAttempt: 1}) {
     affected_rows
   }
 }
 
`

export const UPDATE_OCCURENCE_CUSTOMER = `
   mutation update_subscription_subscriptionOccurence_customer(
      $cutoffTimeStamp: timestamp_comparison_exp!
      $subscriptionOccurenceId: Int_comparison_exp!
      $_set: subscription_subscriptionOccurence_customer_set_input!
   ) {
      update_subscription_subscriptionOccurence_customer(
         where: {
            isSkipped: { _eq: false }
            orderCartId: { _is_null: true }
            subscriptionOccurence: {
               id: $subscriptionOccurenceId
               cutoffTimeStamp: $cutoffTimeStamp
            }
         }
         _set: $_set
      ) {
         affected_rows
      }
   }
`
export const SEND_MAIL = `
   mutation sendEmail($emailInput: EmailInput!) {
      sendEmail(emailInput: $emailInput) {
         message
         success
      }
   }
`
export const CREATE_CART = `
   mutation createCart($object: crm_orderCart_insert_input!) {
      createCart(object: $object) {
         id
      }
   }
`
