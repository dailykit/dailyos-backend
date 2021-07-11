import axios from 'axios'
import { client } from '../../lib/graphql'

export const print = async (req, res) => {
   try {
      const { url, printerId, title, contentType, source } = req.body.input

      const { configs } = await client.request(FETCH_PRINTNODE_KEY, {
         name: { _eq: 'printnode' }
      })

      await axios({
         method: 'POST',
         url: `https://api.printnode.com/printjobs`,
         auth: { username: configs[0].value, password: '' },
         data: {
            title,
            source,
            printerId,
            contentType,
            content: url
         }
      })

      return res.json({
         success: true,
         message: `Successfully printed: ${title}`
      })
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

export const printJobs = async (req, res) => {
   try {
      const { printerId = 0, printJobId = 0 } = req.body.input

      const { configs } = await client.request(FETCH_PRINTNODE_KEY, {
         name: { _eq: 'printnode' }
      })

      let url
      if (printerId && printJobId) {
         url = `https://api.printnode.com/printers/${printerId}/printjobs/${printJobId}`
      } else if (printerId) {
         url = `https://api.printnode.com/printers/${printerId}/printjobs`
      } else if (printJobId) {
         url = `https://api.printnode.com/printjobs/${printJobId}`
      } else {
         url = `https://api.printnode.com/printjobs`
      }

      const { data } = await axios({
         url,
         method: 'GET',
         auth: {
            username: configs[0].value,
            password: ''
         }
      })

      return res.status(200).json(data)
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

const FETCH_PRINTNODE_KEY = `
   query configs($name: String_comparison_exp!) {
      configs(where: {name: $name}) {
         value(path: "apiKey")
      }
   } 
`
