import { client } from '../../lib/graphql'
const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const nodemailer = require('nodemailer')
import {
   GET_SES_DOMAIN,
   GET_PAYMENT_SETTINGS,
   GET_CUSTOMER,
   UPDATE_CART
} from './graphql'

AWS.config.update({ region: 'us-east-2' })

export const initiatePayment = async (req, res) => {
   try {
      const data = req.body.event.data.new

      if (data.status === 'PROCESS') {
         const { paymentSettings } = await client.request(
            GET_PAYMENT_SETTINGS,
            {
               brandId: data.brandId
            }
         )
         const { customer } = await client.request(GET_CUSTOMER, {
            keycloakId: data.customerKeycloakId
         })

         const isStripeConfigured = paymentSettings[0].brandSettings.length
            ? paymentSettings[0].brandSettings[0].value.isStripeConfigured
            : paymentSettings[0].value.isStripeConfigured
         const isStoreLive = paymentSettings[0].brandSettings.length
            ? paymentSettings[0].brandSettings[0].value.isStoreLive
            : paymentSettings[0].value.isStoreLive

         if (!isStripeConfigured || !isStoreLive || customer.isTest) {
            await client.request(UPDATE_CART, {
               id: data.id,
               set: {
                  paymentStatus: 'SUCCEEDED',
                  isTest: true,
                  transactionId: 'NA',
                  transactionRemark: {
                     id: 'NA',
                     amount: data.amount * 100,
                     message: 'payment bypassed',
                     reason: 'test mode'
                  }
               }
            })
         } else {
            if (data.amount) {
               const body = {
                  organizationId: process.env.ORGANIZATION_ID,
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
            } else {
               await client.request(UPDATE_CART, {
                  id: data.id,
                  set: {
                     paymentStatus: 'SUCCEEDED',
                     transactionId: 'NA',
                     transactionRemark: {
                        id: 'NA',
                        amount: 0,
                        message: 'payment bypassed',
                        reason: 'no amount for stripe transaction'
                     }
                  }
               })
            }
         }
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

export const sendMail = async (req, res) => {
   try {
      const { emailInput } = req.body.input
      const inputDomain = emailInput.from.split('@')[1]

      // Get the DKIM details from dailycloak
      const dkimDetails = await client.request(GET_SES_DOMAIN, {
         domain: inputDomain
      })

      if (dkimDetails.aws_ses.length === 0) {
         return res.status(400).json({
            success: false,
            message: `Domain ${inputDomain} is not registered. Cannot send emails.`
         })
      } else {
         // create nodemailer transport
         const transport = nodemailer.createTransport({
            SES: new AWS.SES({ apiVersion: '2010-12-01' }),
            dkim: {
               domainName: dkimDetails.aws_ses[0].domain,
               keySelector: dkimDetails.aws_ses[0].keySelector,
               privateKey: dkimDetails.aws_ses[0].privateKey.toString('binary')
            }
         })
         // build and send the message
         const message = {
            from: emailInput.from,
            to: emailInput.to,
            subject: emailInput.subject,
            html: emailInput.html,
            attachments: emailInput.attachments
         }

         if (dkimDetails.aws_ses[0].isVerified === true) {
            await transportEmail(transport, message)
         } else {
            throw new Error(
               `Domain - ${inputDomain} - is not verified. Cannot send emails.`
            )
         }

         return res.status(200).json({
            success: true,
            message: 'Email sent successfully!'
         })
      }
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

const transportEmail = async (transporter, message) => {
   return new Promise((resolve, reject) => {
      transporter.sendMail(message, (err, info) => {
         if (err) {
            reject(err)
         } else {
            resolve(info)
         }
      })
   })
}
