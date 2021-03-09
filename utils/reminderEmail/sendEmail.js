import { client } from '../../lib/graphql'
import { getHtml } from '../'
import { SEND_MAIL } from '../../entities/occurence/graphql'

export const sendEmail = async ({
   brandCustomerId,
   subscriptionOccurenceId
}) => {
   try {
      const {
         subscriptionOccurences: [
            {
               subscription: {
                  identifier: { template },
                  brand_customers = []
               } = {}
            }
         ] = []
      } = await client.request(GET_CUSTOMER_EMAIL, {
         subscriptionOccurenceId,
         brandCustomerId
      })

      const {
         brands_brand_subscriptionStoreSetting: [{ templateSettings = {} }] = []
      } = await client.request(GET_TEMPLATE_SETTINGS, {
         identifier: template
      })

      let html = await getHtml(templateSettings.template, {
         data: {
            brand_customerId: brandCustomerId,
            subscriptionOccurenceId
         }
      })

      await client.request(SEND_MAIL, {
         emailInput: {
            from: templateSettings.email,
            to: brand_customers.customer.email,
            subject:
               'REMINDER: Your weekly box is waiting for your meal selection.',
            attachments: [],
            html
         }
      })
   } catch (error) {
      throw Error(error.message)
   }
}

const GET_CUSTOMER_EMAIL = `query customerEmail($subscriptionOccurenceId: Int!, $brandCustomerId: Int!) {
  subscriptionOccurences(where: {id: {_eq: $subscriptionOccurenceId}}) {
    subscription {
      identifier: reminderSettings
      brand_customers(where: {id: {_eq: $brandCustomerId}}) {
        customer {
          id
          email
        }
      }
    }
  }
}`

export const GET_TEMPLATE_SETTINGS = `
    query getTemplateSettings($identifier: String! ) {
        brands_brand_subscriptionStoreSetting(where: {subscriptionStoreSetting: {identifier: {_eq: $identifier} }}) {
            templateSettings: value
        }
    }   
`
