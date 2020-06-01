import axios from 'axios'

import { client } from '../../lib/graphql'

const FETCH_PRINTNODE_KEY = `
   query configs($name: String_comparison_exp!) {
      configs(where: {name: $name}) {
         value(path: "apiKey")
      }
   } 
`

const UPDATE_COMPUTERS = `
   mutation createComputers($objects: [deviceHub_computer_insert_input!]!, $update_columns: [deviceHub_computer_update_column!]!) {
      createComputers(objects: $objects, on_conflict: {constraint: computer_pkey, update_columns: $update_columns}) {
         returning {
            printNodeId
         }
      }
   }
`

const base_url = 'https://api.printnode.com'

export const process = async (req, res) => {
   try {
      const { configs } = await client.request(FETCH_PRINTNODE_KEY, {
         name: {
            _eq: 'printnode'
         }
      })

      const { data: computers } = await axios.get(`${base_url}/computers`, {
         auth: {
            username: configs[0].value,
            password: ''
         }
      })

      await client.request(UPDATE_COMPUTERS, {
         objects: computers.map(computer => {
            const { id, createTimestamp, ...rest } = computer
            return { printNodeId: id, ...rest }
         }),
         update_columns: ['state']
      })

      return res.json({ data: computers })
   } catch (error) {
      return res.json({ error: error.message })
   }
}
