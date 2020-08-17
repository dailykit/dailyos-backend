import axios from 'axios'
import moment from 'moment'
import { RRule } from 'rrule'

import { client } from '../../lib/graphql'
import {
   UPDATE_CART,
   UPDATE_SUBSCRIPTION,
   INSERT_SUBS_OCCURENCES,
   UPDATE_OCCURENCE_CUSTOMER
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
         cutOffTime
      } = req.body.event.data.new

      const [hour, minute, seconds] = cutOffTime.split(':')
      const [startYear, startMonth, startDay] = startDate.split('-')
      const [endYear, endMonth, endDay] = endDate.split('-')

      const options = RRule.parseString(rrule)

      options.dtstart = new Date(Date.UTC(startYear, startMonth, startDay))
      options.until = new Date(Date.UTC(endYear, endMonth, endDay))

      const occurences = new RRule(options).all()

      const objects = await Promise.all(
         occurences.map(occurence => {
            return {
               subscriptionId: id,
               fulfillmentDate: moment(occurence).format('YYYY-MM-DD'),
               cutoffTimeStamp: moment(occurence)
                  .subtract(leadTime.value, leadTime.unit)
                  .hours(hour)
                  .minutes(minute)
                  .seconds(seconds)
                  .format('YYYY-MM-DD hh:mm:ss'),
               startTimeStamp: moment(occurence)
                  .subtract(startTime.value, startTime.unit)
                  .hours(hour)
                  .minutes(minute)
                  .seconds(seconds)
                  .format('YYYY-MM-DD hh:mm:ss')
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
      const { id, cutoffTimeStamp } = JSON.parse(req.body.payload)

      await client.request(UPDATE_OCCURENCE_CUSTOMER, {
         subscriptionOccurenceId: { _eq: id },
         cutoffTimeStamp: { _eq: cutoffTimeStamp },
         _set: {
            isSkipped: true
         }
      })

      await client.request(UPDATE_CART, {
         _set: { status: 'PROCESS' },
         subscriptionOccurenceId: { _eq: id },
         cutoffTimeStamp: { _eq: cutoffTimeStamp }
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

      const url = new URL(process.env.DATA_HUB).origin + '/datahub/v1/query'
      await axios({
         url,
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'x-hasura-role': 'admin'
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
      return res.status(200).json({
         success: true,
         message: 'Successfully created scheduled events!'
      })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}
