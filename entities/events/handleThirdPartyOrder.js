import { client } from '../../lib/graphql'

export const handleThirdPartyOrder = async (req, res) => {
   try {
      const { op, data = {} } = req.body.event
      let result = {}
      switch (op) {
         case 'MANUAL': {
            result = await createOrder(data)
            break
         }
         case 'INSERT': {
            result = await createOrder(data)
            break
         }
         default:
            throw Error('No such event type has been mapped yet!')
      }
      return res.status(200).json({ success: true, data: result })
   } catch (error) {
      return res.status(400).json({ success: false, error: error })
   }
}

const createOrder = async data => {
   try {
      const { createOrder } = await client.request(CREATE_ORDER, {
         object: {
            orderStatus: 'PENDING',
            paymentStatus: 'SUCCEEDED',
            thirdPartyOrderId: data.new.id
         }
      })
      return createOrder
   } catch (error) {
      throw error
   }
}

const CREATE_ORDER = `
   mutation createOrder($object: order_order_insert_input!) {
      createOrder(object: $object) {
         id
      }
   }
`
