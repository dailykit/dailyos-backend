import axios from 'axios'
import moment from 'moment'
import { client } from '../../../lib/graphql'
import { GET_REMINDER_SETTINGS } from '../graphql'

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
