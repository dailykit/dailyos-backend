import axios from 'axios'
import moment from 'moment'
import { RRule } from 'rrule'
import { client } from '../../lib/graphql'
import { template_compiler } from '../../utils'
import {
   UPDATE_CART,
   UPDATE_SUBSCRIPTION,
   INSERT_SUBS_OCCURENCES,
   UPDATE_OCCURENCE_CUSTOMER,
   GET_REMINDER_SETTINGS,
   GET_CUSTOMERS_EMAIL,
   GET_TEMPLATE_SETTINGS,
   SEND_MAIL
} from './graphql'

export const create = async (req, res) => {
   try {
      const {
         id,
         rrule,
         endDate,
         leadTime,
         startDate,
         startTime,
         cutOffTime,
         defaultSubscriptionAutoSelectOption
      } = req.body.event.data.new

      const [hour, minute, seconds] = cutOffTime.split(':')
      const [startYear, startMonth, startDay] = startDate.split('-')
      const [endYear, endMonth, endDay] = endDate.split('-')

      const options = RRule.parseString(rrule)

      options.dtstart = new Date(Date.UTC(startYear, startMonth - 1, startDay))
      options.until = new Date(Date.UTC(endYear, endMonth - 1, endDay))

      const occurences = new RRule(options).all()

      const objects = await Promise.all(
         occurences.map(occurence => {
            return {
               subscriptionId: id,
               ...(Boolean(defaultSubscriptionAutoSelectOption) && {
                  subscriptionAutoSelectOption: defaultSubscriptionAutoSelectOption
               }),
               fulfillmentDate: moment(occurence).format('YYYY-MM-DD'),
               cutoffTimeStamp: moment(occurence)
                  .subtract(leadTime.value, leadTime.unit)
                  .hours(hour)
                  .minutes(minute)
                  .seconds(seconds)
                  .format('YYYY-MM-DD HH:mm:ss'),
               startTimeStamp: moment(occurence)
                  .subtract(startTime.value, startTime.unit)
                  .hours(hour)
                  .minutes(minute)
                  .seconds(seconds)
                  .format('YYYY-MM-DD HH:mm:ss')
            }
         })
      )

      await client.request(INSERT_SUBS_OCCURENCES, { objects })
      await client.request(UPDATE_SUBSCRIPTION, {
         id,
         startDate: `${endYear}-${endMonth}-${endDay}`
      })

      return res.status(200).json({
         success: true,
         message: 'Successfully created occurences!'
      })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const manageOccurence = async (req, res) => {
   try {
      const node = {
         id: null,
         cutoffTimeStamp: null
      }
      if (typeof req.body.payload === 'string') {
         const { id, cutoffTimeStamp } = JSON.parse(req.body.payload)
         node.id = id
         node.cutoffTimeStamp = cutoffTimeStamp
      } else {
         const { id, cutoffTimeStamp } = req.body.payload
         node.id = id
         node.cutoffTimeStamp = cutoffTimeStamp
      }

      await client.request(UPDATE_OCCURENCE_CUSTOMER, {
         subscriptionOccurenceId: { _eq: node.id },
         cutoffTimeStamp: { _eq: node.cutoffTimeStamp },
         _set: {
            isSkipped: true
         }
      })

      await client.request(UPDATE_CART, {
         _set: { status: 'PROCESS' },
         subscriptionOccurenceId: { _eq: node.id },
         cutoffTimeStamp: { _eq: node.cutoffTimeStamp }
      })

      return res.status(200).json({
         success: true,
         message: 'Successfully updated occurence!'
      })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const createScheduledEvent = async (req, res) => {
   try {
      const { id, cutoffTimeStamp } = req.body.event.data.new
      const {
         subscriptionOccurences: [
            { subscription: { reminderSettings = {} } = {} }
         ] = []
      } = await client.request(GET_REMINDER_SETTINGS, {
         id
      })
      const url = new URL(process.env.DATA_HUB).origin + '/datahub/v1/query'

      const dates = reminderSettings.hoursBefore.map(item =>
         moment(cutoffTimeStamp)
            .subtract(item, 'hours')
            .format('YYYY-MM-DD hh:mm:ss')
      )
      await axios({
         url,
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'x-hasura-role': 'admin',
            'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
         },
         data: {
            type: 'create_scheduled_event',
            args: {
               webhook:
                  new URL(process.env.DATA_HUB).origin +
                  '/server/webhook/occurence/manage',
               schedule_at: cutoffTimeStamp + 'Z',
               payload: {
                  cutoffTimeStamp,
                  occurenceId: id
               },
               headers: []
            }
         }
      })

      await Promise.all(
         dates.map(item =>
            axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'x-hasura-role': 'admin',
                  'x-hasura-admin-secret':
                     process.env.HASURA_GRAPHQL_ADMIN_SECRET
               },
               data: {
                  type: 'create_scheduled_event',
                  args: {
                     webhook:
                        new URL(process.env.DATA_HUB).origin +
                        '/server/webhook/occurence/reminder',
                     schedule_at: item + 'Z',
                     payload: {
                        ...req.body.event.data.new,
                        ...reminderSettings,
                        subscriptionOccurenceId: id,
                        reminderTime: item
                     },
                     headers: []
                  }
               }
            })
         )
      )
      return res.status(200).json({
         success: true,
         message: 'Successfully created scheduled events and reminders!'
      })
   } catch (error) {
      console.log('createScheduledEvent -> error', error)
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const reminderMail = async (req, res) => {
   try {
      /*
                  cart exists
                     true
                        isAuto
                           true
                              // reminder email
                                 we selected, change as required
                           false
                              // reminder email
                                 payment will be deducted for this cart
                     false
                        has customer opted out
                           true
                              // reminder email
                                 you havent selected any product for this week
                           false
                              has option
                                 true
                                    check auto selection option => products
                                       fs.readfile
                                       first 2 from array
                                    create cart
                                       isAuto -> true
                                       // reminder email
                                          we selected, change as required
                                 false
                                    // reminder email
                                       you havent selected any product for this week
               */
      const { subscriptionOccurenceId, template } = req.body.payload
      const {
         subscriptionOccurences: [
            { subscription: { brand_customers = [] } = {} }
         ] = []
      } = await client.request(GET_CUSTOMERS_EMAIL, {
         subscriptionOccurenceId
      })

      const {
         brands_brand_subscriptionStoreSetting: [{ value = {} }] = []
      } = await client.request(GET_TEMPLATE_SETTINGS, {
         identifier: template
      })

      await Promise.all(
         brand_customers.map(async customer => {
            try {
               // Change template.name
               if (customer.customer.subscriptionOccurences.length !== 0) {
                  // Cart exists
               } else {
                  // Cart doesn't exist
                  if (customer.isAutoSelectOptOut) {
                     // Has opted out from automatically creating the cart
                     // reminder email
                     // you havent selected any product for this week
                  } else {
                     // create cart, set isAuto to true, reminder email
                  }
               }
               let html = await getHtml(value.template, {
                  data: {
                     brand_customerId: customer.id,
                     subscriptionOccurenceId
                  }
               })

               await client.request(SEND_MAIL, {
                  emailInput: {
                     from: value.email,
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
         })
      )

      return res.status(200).json({
         success: true,
         message: 'Successfully sent the mail'
      })
   } catch (error) {
      console.log('Reminder email -> error', error)
      return res.status(400).json({ success: false, error: error.message })
   }
}

const getHtml = async (template, data) => {
   try {
      const parsed = JSON.parse(
         template_compiler(JSON.stringify(template), data)
      )
      const { origin } = new URL(process.env.DATA_HUB)
      const template_data = encodeURI(JSON.stringify(parsed.data))
      const template_options = encodeURI(JSON.stringify(parsed.template))

      const url = `${origin}/template/?template=${template_options}&data=${template_data}`

      const { data: html } = await axios.get(url)
      return html
   } catch (error) {
      throw Error(error.message)
   }
}
