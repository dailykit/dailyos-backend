import { client } from '../../lib/graphql'

const sources = {
   swiggy: {
      title: 'Swiggy',
      imageUrl:
         'https://s3.us-east-2.amazonaws.com/dailykit.org/third-party-orders/swiggy.png'
   }
}

export const emailParser = async (req, res) => {
   try {
      const { createThirdPartyOrder } = await client.request(
         CREATE_THIRD_PARTY_ORDER,
         {
            object: {
               parsedData: req.body,
               source: req.body.source,
               thirdPartyOrderId: req.body.orderId,
               orderSource: {
                  data: sources[req.body.source.toLowerCase()],
                  on_conflict: {
                     update_columns: 'imageUrl',
                     constraint: 'thirdPartySource_title_key'
                  }
               }
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
