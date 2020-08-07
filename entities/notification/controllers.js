const axios = require('axios')

import { client } from '../../lib/graphql'
import { template_compiler } from '../../utils'
import { FETCH_TYPE, CREATE_NOTIFICATION, PRINT_JOB } from './graphql'

export const manage = async (req, res) => {
   try {
      const { trigger } = req.body

      const { notificationTypes } = await client.request(FETCH_TYPE, {
         name: {
            _eq: trigger.name
         }
      })

      const {
         id,
         template,
         isLocal,
         isGlobal,
         printConfigs
      } = notificationTypes[0]

      if (isLocal || isGlobal) {
         const parsed = JSON.parse(
            template_compiler(JSON.stringify(template), req.body.event.data)
         )

         await client.request(CREATE_NOTIFICATION, {
            object: {
               typeId: id,
               content: parsed
            }
         })
      }

      await Promise.all(
         printConfigs.map(async config => {
            if (!isActive) return

            const parsed = JSON.parse(
               template_compiler(
                  JSON.stringify(config.template),
                  req.body.event.data
               )
            )

            const { origin } = new URL(process.env.DATA_HUB)
            const data = encodeURI(JSON.stringify(parsed.data))
            const template = encodeURI(JSON.stringify(parsed.template))

            const url = `${origin}/template?template=${template}&data=${data}`

            const { printJob } = await client.request(PRINT_JOB, {
               url,
               title: trigger.name,
               source: 'DailyOS',
               contentType: 'pdf_uri',
               printerId: config.printerPrintNodeId
            })
            return printJob
         })
      )

      return res
         .status(200)
         .json({ success: true, message: 'Notification Sent!' })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const trigger = async (req, res) => {
   try {
      const { event } = req.body
      if (event.data.new.isActive === true) {
         // create the trigger
         const createPayloadData = {
            type: 'create_event_trigger',
            args: {
               name: event.data.new.name,
               table: {
                  name: event.data.new.table,
                  schema: event.data.new.schema
               },
               webhook_from_env: event.data.new.webhookEnv,
               replace: false
            }
         }
         switch (event.data.new.op) {
            case 'INSERT': {
               createPayloadData.args['insert'] = {
                  columns: '*'
               }
               await hasuraTrigger(createPayloadData)
               break
            }
            case 'UPDATE': {
               createPayloadData.args['update'] = event.data.new.fields
               await hasuraTrigger(createPayloadData)
               break
            }
            case 'DELETE': {
               createPayloadData.args['delete'] = '*'
               await hasuraTrigger(createPayloadData)
               break
            }
            default:
               throw Error('Unknown operation type')
         }
         return res
            .status(200)
            .json({ success: true, message: 'Event Trigger Created!' })
      } else {
         // delete the trigger
         await hasuraTrigger({
            type: 'delete_event_trigger',
            args: {
               name: event.data.new.name
            }
         })
         return res
            .status(200)
            .json({ success: true, message: 'Event Trigger Deleted!' })
      }
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

const hasuraTrigger = async payloadData => {
   const url = new URL(process.env.DATA_HUB).origin + '/datahub/v1/query'
   await axios({
      url,
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'x-hasura-role': 'admin'
      },
      data: payloadData
   })
}
