import { client } from '../../lib/graphql'

export const emailParser = async (req, res) => {
   try {
      const { createThirdPartyOrder } = await client.request(
         CREATE_THIRD_PARTY_ORDER,
         {
            object: {
               parsedData: req.body,
               source: req.body.source,
               thirdPartyOrderId: req.body.orderId
            }
         }
      )
      return res.json({ success: true, data: createThirdPartyOrder })
   } catch (error) {
      console.log(error)
      return res.json({ success: false, error: error.message })
   }
}

const CREATE_THIRD_PARTY_ORDER = `
   mutation createThirdPartyOrder(
      $object: order_thirdPartyOrder_insert_input!
   ) {
      createThirdPartyOrder: insert_order_thirdPartyOrder_one(
         object: $object
         on_conflict: {
            constraint: thirdPartyOrder_id_key
            update_columns: [parsedData, source]
         }
      ) {
         id
      }
   }
`
