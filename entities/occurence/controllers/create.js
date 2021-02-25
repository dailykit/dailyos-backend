import moment from 'moment'
import { RRule } from 'rrule'
import { client } from '../../../lib/graphql'
import { UPDATE_SUBSCRIPTION, INSERT_SUBS_OCCURENCES } from '../graphql'

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
