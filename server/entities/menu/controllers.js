import moment from 'moment-timezone'
import { client } from '../../lib/graphql'
import { RRule } from 'rrule'
import get_env from '../../../get_env'
const { MENU_COLLECTIONS } = require('./graphql')

const toTimezone = time => moment(time).tz(get_env('TIMEZONE'))

export const getMenu = async (req, res) => {
   try {
      const { date } = req.body

      const current = moment(date)

      const { menuCollections: collections = [] } = await client.request(
         MENU_COLLECTIONS
      )

      const matches = []
      collections.forEach(col => {
         let times = new RRule({
            ...RRule.parseString(col.availability.rule),
            count: 10,
            tzid: get_env('TIMEZONE')
         }).all()
         let index = times.findIndex(
            time =>
               moment(time).tz(get_env('TIMEZONE')).date() === current.date()
         )
         if (index >= 0) {
            matches.push(col)
         }
      })

      const result = []

      for (let collection of matches || []) {
         for (let category of collection.categories || []) {
            const index = result.findIndex(i => i.name === category.name)
            if (index === -1) {
               result.push(category)
            } else {
               for (let [key, value] of Object.entries(category) || []) {
                  if (key !== 'name') {
                     result[index] = {
                        ...result[index],
                        [key]: [...new Set([...result[index][key], ...value])]
                     }
                  }
               }
            }
         }
      }

      // success
      return res.send(result)
   } catch (error) {
      return res.status(400).json({
         message: error.message
      })
   }
}
