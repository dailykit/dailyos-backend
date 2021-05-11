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
      subscriptionOccurences(where: { id: { _eq: $id } }) {
         id
         subscriptionId
         subscription {
            id
            brand_customers {
               id
               keycloakId
               isAutoSelectOptOut
               customerEmail: customer {
                  email
               }
               subscriptionOccurences(
                  where: { subscriptionOccurenceId: { _eq: $id } }
               ) {
                  validStatus
                  isSkipped
                  isAuto
                  cartId
               }
            }
         }
      }
   }
`

export const CUSTOMERS = `
   query customerDetails($id: Int!) {
      subscriptionOccurences(where: { id: { _eq: $id } }) {
         id
         subscriptionId
         subscription {
            id
            brand_customers(
               where: {
                  isSubscriptionCancelled: { _eq: false }
                  isSubscriber: { _eq: true }
               }
            ) {
               id
               keycloakId
               isAutoSelectOptOut
               customerEmail: customer {
                  email
               }
               subscriptionOccurences(
                  where: { subscriptionOccurenceId: { _eq: $id } }
               ) {
                  validStatus
                  isSkipped
                  isAuto
                  cartId
                  betweenPause
               }
            }
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
