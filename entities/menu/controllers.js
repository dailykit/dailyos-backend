const fetch = require('node-fetch')
const R = require('rrule')
const { MENU_COLLECTIONS } = require('./graphql')

export const getMenu = async (req, res) => {
   try {
      // get request input
      const { year, month, day } = req.body.input

      // calc next day
      const now = new Date(year, month, day)
      const next = now
      next.setDate(next.getDate() + 1)

      // run some business logic
      const response = await fetch(process.env.DATA_HUB, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            query: MENU_COLLECTIONS
         })
      })
      const { data = {} } = await response.json()
      const collections = data.menuCollections

      const matches = []
      collections.forEach(col => {
         const occurrences = R.rrulestr(col.availability.rule).between(
            new Date(Date.UTC(year, month, day)),
            new Date(
               Date.UTC(next.getFullYear(), next.getMonth(), next.getDate())
            )
         )
         if (occurrences.length) matches.push(col)
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
