import { client } from '../../lib/graphql'
import { FETCH_TYPE, CREATE_NOTIFICATION } from './graphql'
import { template_compiler } from '../../utils'

export const manage = async (req, res) => {
   try {
      const { trigger } = req.body

      const { notificationTypes } = await client.request(FETCH_TYPE, {
         name: {
            _eq: trigger.name
         }
      })

      const { id, template } = notificationTypes[0]

      switch (trigger.name) {
         case 'Order_Created': {
            await order.create({
               data: req.body.event.data,
               template,
               type: id
            })
            break
         }
         default:
            throw Error('Unknown Trigger!')
      }

      return res
         .status(200)
         .json({ success: true, message: 'Notification Sent!' })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const trigger = async (req, res) => {}

const order = {
   create: async ({ template, data, type }) => {
      try {
         const parsed = JSON.parse(
            template_compiler(JSON.stringify(template), data)
         )
         await client.request(CREATE_NOTIFICATION, {
            object: {
               typeId: type,
               content: parsed,
               action: {
                  url: `/order/orders/${data.new.id}`
               }
            }
         })
      } catch (error) {
         throw Error(error.message)
      }
   }
}
