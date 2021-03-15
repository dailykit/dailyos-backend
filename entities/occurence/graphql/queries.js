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
