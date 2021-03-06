import { client } from '../../lib/graphql'
const R = require('rrule')
const { COLLECTIONS } = require('./graphql')

export const getMenu = async (req, res) => {
   try {
      // get request input
      const { year, month, day } = req.body

      // calc next day
      const now = new Date(year, month, day)
      const next = now
      next.setDate(next.getDate() + 1)

      // run some business logic
      const { collections = [] } = await client.request(COLLECTIONS)

      const matches = []
      collections.forEach(collection => {
         const occurrences = R.rrulestr(
            JSON.parse(collection.availability).rule
         ).between(
            new Date(Date.UTC(year, month, day)),
            new Date(
               Date.UTC(next.getFullYear(), next.getMonth(), next.getDate())
            )
         )
         if (occurrences.length) matches.push(collection)
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
      console.log(error)
      return res.status(400).json({
         message: 'error happened'
      })
   }
}
