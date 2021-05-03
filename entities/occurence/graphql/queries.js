export const GET_REMINDER_SETTINGS = `
    query getReminderSettings($id: Int!){
        subscriptionOccurences(where: {id: {_eq: $id}}) {
            subscription {
                reminderSettings
            }
        }
    }
`

export const GET_TEMPLATE_SETTINGS = `
    query getTemplateSettings($identifier: String! ) {
        brands_brand_subscriptionStoreSetting(where: {subscriptionStoreSetting: {identifier: {_eq: $identifier} }}) {
            value
        }
    }   
`

export const GET_CUSTOMERS_DETAILS = `
query customerDetails($id: Int!) {
  subscriptionOccurences(where: {id: {_eq: $id}}) {
    subscription {
      brand_customers {
        brandCustomerId: id
        isAutoSelectOptOut
        customer {
          subscriptionOccurences(where: {subscriptionOccurenceId: {_eq: $id}}) {
            validStatus
            isSkipped
            isAuto
            cartId
          }
        }
      }
    }
  }
}
`

export const CUSTOMERS = `
   query subscription_view_full_occurence_report(
      $where: subscription_view_full_occurence_report_bool_exp = {}
   ) {
      subscription_view_full_occurence_report(where: $where) {
         cartId
         isPaused
         isSkipped
         keycloakId
         betweenPause
         paymentStatus
         subscriptionId
         brand_customerId
         isItemCountValid
         subscriptionOccurenceId
         brandCustomer {
            id
            keycloakId
            subscriptionId
            isSubscriber
            isSubscriptionCancelled
         }
      }
   }
`

export const SUBSCRIPTION_OCCURENCES = `
   query subscriptionOccurences(
      $where: subscription_subscriptionOccurence_bool_exp = {}
   ) {
      subscriptionOccurences(where: $where) {
         id
         cutoffTimeStamp
         fulfillmentDate
      }
   }
`
