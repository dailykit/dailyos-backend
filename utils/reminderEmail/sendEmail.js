import { client } from '../../lib/graphql'
import { getHtml } from '../'
import { SEND_MAIL } from '../../entities/occurence/graphql'

export const sendEmail = async ({ customer, templateSettings }) => {
   try {
      let html = await getHtml(templateSettings.template, {
         data: {
            brand_customerId: customer.brandCustomerId,
            subscriptionOccurenceId
         }
      })

      await client.request(SEND_MAIL, {
         emailInput: {
            from: templateSettings.email,
            to: customer.customer.email,
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
