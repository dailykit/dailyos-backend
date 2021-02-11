export const GET_REMINDER_SETTINGS = `
    query getReminderSettings($id: Int!){
        subscriptionOccurences(where: {id: {_eq: $id}}) {
            subscription {
                reminderSettings
            }
        }
    }
`
export const GET_CUSTOMERS_EMAIL = `
    query customersEmail($subscriptionOccurenceId: Int!) {
        subscriptionOccurences(where: {id: {_eq: $subscriptionOccurenceId}}) {
            subscription {
                brand_customers(where: {_not: {subscriptionOccurences: {subscriptionOccurenceId: {_eq: $subscriptionOccurenceId}}}}) {
                    id
                    customer {
                        email
                    }
                }
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
