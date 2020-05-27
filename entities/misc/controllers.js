import { request } from 'graphql-request'
import { ORGANIZATION } from './graphql'
const fetch = require('node-fetch')

export const initiatePayment = async (req, res) => {
   try {
      const data = req.body.event.data.new

      const { hostname } = new URL(process.env.DATA_HUB)

      const result = await request(process.env.DAILYCLOAK, ORGANIZATION, {
         organizationUrl: { _eq: hostname }
      })

      let orgId
      if (result.organizations.length) {
         orgId = result.organizations[0].id
      } else {
         throw Error('Organization not found!')
      }

      if (data.status === 'PROCESS') {
         const body = {
            organizationId: orgId,
            cart: {
               id: data.id,
               amount: data.amount
            },
            customer: {
               paymentMethod: data.paymentMethodId,
               stripeCustomerId: data.stripeCustomerId
            }
         }
         await fetch(`${process.env.PAYMENTS_API}/api/initiate-payment`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
         })
      }

      res.status(200).json({
         success: true,
         message: 'Payment initiated!'
      })
   } catch (error) {
      console.log(error)
      res.status(400).json({
         success: false,
         message: error.message
      })
   }
}
