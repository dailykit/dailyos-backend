import { client } from '../../lib/graphql'
const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const nodemailer = require('nodemailer')
import { GET_SES_DOMAIN } from './graphql'

export const initiatePayment = async (req, res) => {
   try {
      const data = req.body.event.data.new

      if (data.status === 'PROCESS') {
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

      // Get the DKIM details from dailycloak
      const dkimDetails = await client.request(GET_SES_DOMAIN)

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
         html: emailInput.html
      }

      if (dkimDetails.aws_ses[0].isVerified === true) {
         await transportEmail(transport, message)
      } else {
         throw new Error(
            `Cannot send emails. Domain - ${domain} - is not verified`
         )
      }

      return res.status(200).json({
         success: true,
         message: 'Email sent successfully!'
      })
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
