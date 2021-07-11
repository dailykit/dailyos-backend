import { client } from '../../lib/graphql'
const {
   UPDATE_MODE,
   INGREDIENT_SACHET,
   UPDATE_INGREDIENT_SACHET
} = require('./graphql')

export const updateMOF = async (req, res) => {
   try {
      const FULLFILLMENTS = `
        query modeOfFulfillments {
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
      const data = await client.request(FULLFILLMENTS)

      const modes = data[req.body.table.name].modeOfFulfillments
      const updatedModes = []

      modes.forEach(mode => {
         const prevIsLive = mode.isLive

         // for mode to be live -> it should be available && ingredient sachet quantity should match
         const nextIsLive =
            req.body.event.data.new.isAvailable &&
            mode.ingredientSachet.quantity <=
               req.body.event.data.new.onHand -
                  req.body.event.data.new.committed

         if (prevIsLive !== nextIsLive) {
            updatedModes.push({ ...mode, isLive: nextIsLive })
         }
      })

      await Promise.all(
         updatedModes.map(mode =>
            client.request(UPDATE_MODE, {
               id: mode.id,
               set: { isLive: mode.isLive }
            })
         )
      )

      return res.json({
         success: true,
         message: 'Updated isLive flags!'
      })
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

export const liveMOF = async (req, res) => {
   try {
      const mode = req.body.event.data

      const { ingredientSachet } = await client.request(INGREDIENT_SACHET, {
         id: mode.new.ingredientSachetId
      })

      const currentLiveMOF = ingredientSachet.liveMOF

      let modes = [...ingredientSachet.modeOfFulfillments]
      modes.sort((a, b) => b.position - a.position)

      const newLiveMOF = modes.length ? modes[0].id : null

      if (currentLiveMOF !== newLiveMOF) {
         await client.request(UPDATE_INGREDIENT_SACHET, {
            id: mode.new.ingredientSachetId,
            set: { liveMOF: newLiveMOF }
         })
         return res.json({ success: true, message: 'Live MOF updated!' })
      }

      return res.json({ success: true, message: 'Live MOF is same as last!' })
   } catch (error) {
      console.log(error)
      return res.status(500).json({
         success: false,
         message: error.message
      })
   }
}
