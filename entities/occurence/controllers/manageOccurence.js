import { client } from '../../../lib/graphql'
import { UPDATE_CART, UPDATE_OCCURENCE_CUSTOMER } from '../graphql'

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
