const fetch = require('node-fetch')
const {
   UPDATE_MODE,
   INGREDIENT_SACHET,
   UPDATE_INGREDIENT_SACHET
} = require('./graphql')

export const updateMOF = async (req, res) => {
   try {
      const query = `
        query MyQuery {
            ${req.body.table.name}(id: ${req.body.event.data.new.id}) {
               modeOfFulfillments {
                  id
                  isLive
                  isPublished
                  ingredientSachet {
                  id
                  quantity
                  }
               }
            }
        }
      `

      const response = await fetch(process.env.DATAHUB, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            query
         })
      })

      const { data } = await response.json()
      const modes = data[req.body.table.name].modeOfFulfillments
      let updatedModes = modes

      updatedModes.forEach(mode => {
         // if new.avail != old.avail:
         // modes.each => isLive = new.avail
         if (
            req.body.event.data.new.isAvailable !==
            req.body.event.data.old.isAvailable
         ) {
            mode.isLive = req.body.event.data.new.isAvailable
         }
         // if quantity > new.onHand -> isLive = false
         // else isLive = true
         if (
            req.body.event.data.new.onHand !== req.body.event.data.old.onHand
         ) {
            mode.isLive =
               mode.ingredientSachet.quantity <= req.body.event.data.new.onHand
         }
      })

      // const trulyUpdatedModes = []

      // updatedModes.forEach((mode, i) => {
      //   if (_.isEqual(updatedModes[i], modes[i])) {
      //     console.log("TESSSSS")
      //     trulyUpdatedModes.push(mode)
      //   }
      // })

      updatedModes.forEach(async mode => {
         const response = await fetch(process.env.DATAHUB, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               query: UPDATE_MODE,
               variables: { id: mode.id, set: { isLive: mode.isLive } }
            })
         })
         console.log('RES:', await response.json())
      })

      return res.send('OK')
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         message: 'error happened'
      })
   }
}

export const liveMOF = async (req, res) => {
   try {
      const mode = req.body.event.data

      const response = await fetch(process.env.DATAHUB, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            query: INGREDIENT_SACHET,
            variables: { id: mode.new.ingredientSachetId }
         })
      })

      const { data = {} } = await response.json()

      const currentLiveMOF = data.ingredientSachet.liveMOF
      let newLiveMOF = null
      let passingModes = []

      // check for isPublished
      // filter out that have true
      passingModes = data.ingredientSachet.modeOfFulfillments.filter(mode => {
         if (mode.isPublished) return mode
      })
      // if array.length === 0 -> then liveMOF = null
      if (!passingModes.length) newLiveMOF = null
      // check for isLive
      // filter out that have true
      else {
         passingModes = data.ingredientSachet.modeOfFulfillments.filter(
            mode => {
               if (mode.isLive) return mode
            }
         )
         // if array.length === 0 -> then liveMOF = null
         if (!passingModes.length) newLiveMOF = null
         // else
         // if array.length === 1 then liveMOF = array[0]
         else if (passingModes.length === 1) newLiveMOF = passingModes[0]
         // else sort array => liveMOF = array[0]
         else {
            passingModes.sort((a, b) => {
               if (a.priority < b.priority) return 1
               else if (a.priority > b.priority) return -1
               else return 0
            })
            newLiveMOF = passingModes[0]
         }
      }

      if (currentLiveMOF !== newLiveMOF.id) {
         const response = await fetch(process.env.DATAHUB, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               query: UPDATE_INGREDIENT_SACHET,
               variables: {
                  id: mode.new.ingredientSachetId,
                  set: { liveMOF: newLiveMOF ? newLiveMOF.id : null }
               }
            })
         })

         const data = await response.json()
         console.log(data)
      }

      return res.send('OK')
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         message: 'error happened'
      })
   }
}
