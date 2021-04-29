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
   mutation updateCarts(
      $subscriptionOccurenceId: Int_comparison_exp!
      $cutoffTimeStamp: timestamp_comparison_exp!
   ) {
      updateCarts(
         where: {
            paymentStatus: { _neq: "SUCCEEDED" }
            subscriptionOccurenceCustomer: {
               isSkipped: { _eq: false }
               subscriptionOccurence: {
                  id: $subscriptionOccurenceId
                  cutoffTimeStamp: $cutoffTimeStamp
               }
            }
         }
         _inc: { paymentRetryAttempt: 1 }
      ) {
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
            cartId: { _is_null: true }
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

export const INSERT_OCCURENCE_CUSTOMER = `
   mutation insertSubscriptionOccurenceCustomers(
      $objects: [subscription_subscriptionOccurence_customer_insert_input!]!
   ) {
      insertSubscriptionOccurenceCustomers: insert_subscription_subscriptionOccurence_customer(
         objects: $objects
         on_conflict: {
            constraint: subscriptionOccurence_customer_pkey
            update_columns: []
         }
      ) {
         affected_rows
         returning {
            keycloakId
            subscriptionOccurenceId
            brand_customerId
         }
      }
   }
`

export const UPDATE_OCCURENCE_CUSTOMER_BY_PK = `
   mutation update_subscription_subscriptionOccurence_customer_by_pk(
      $_set: subscription_subscriptionOccurence_customer_set_input!
      $pk_columns: subscription_subscriptionOccurence_customer_pk_columns_input!
      $_prepend: subscription_subscriptionOccurence_customer_prepend_input!
   ) {
      update_subscription_subscriptionOccurence_customer_by_pk(
         _set: $_set
         pk_columns: $pk_columns
         _prepend: $_prepend
      ) {
         cartId
         brand_customerId
         keycloakId
         subscriptionOccurenceId
      }
   }
`

export const UDPATE_OCCURENCE_CUSTOMER_CARTS = `
   mutation updateCarts(
      $where: order_cart_bool_exp!
      $_inc: order_cart_inc_input = {}
      $_set: order_cart_set_input = {}
   ) {
      updateCarts(where: $where, _inc: $_inc, _set: $_set) {
         affected_rows
         returning {
            keycloakId: customerKeycloakId
            subscriptionOccurenceId
         }
      }
   }
`

export const UDPATE_SUBSCRIPTION_OCCURENCES = `
   mutation updateSubscriptionOccurences(
      $where: subscription_subscriptionOccurence_bool_exp!
      $_prepend: subscription_subscriptionOccurence_prepend_input!
   ) {
      updateSubscriptionOccurences(where: $where, _prepend: $_prepend) {
         affected_rows
      }
   }
`

export const DELETE_OCCURENCE_CUSTOMER = `
   mutation deleteOccurenceCustomer(
      $brand_customerId: Int!
      $keycloakId: String!
      $subscriptionOccurenceId: Int!
   ) {
      deleteOccurenceCustomer: delete_subscription_subscriptionOccurence_customer_by_pk(
         brand_customerId: $brand_customerId
         keycloakId: $keycloakId
         subscriptionOccurenceId: $subscriptionOccurenceId
      ) {
         keycloakId
         brand_customerId
         subscriptionOccurenceId
      }
   }
`

export const DELETE_CART = `
   mutation deleteCart($id: Int!) {
      deleteCart(id: $id) {
         id
      }
   }
`

export const INSERT_ACTIVITY_LOGS = `
   mutation insertActivityLogs(
      $objects: [settings_activityLogs_insert_input!]!
   ) {
      insertActivityLogs: insert_settings_activityLogs(objects: $objects) {
         affected_rows
      }
   }
`
