import axios from 'axios'
import { client } from '../../lib/graphql'

const parseur = {
   one: async (req, res) => {
      try {
         const { id = null } = req.params

         if (!id) throw { message: 'Mailbox id is required!', status_code: 409 }

         const { data = {} } = await axios({
            method: 'GET',
            url: `${process.env.PARSEUR_API_URL}/parser/${id}`,
            headers: {
               Authorization: `Token ${process.env.PARSEUR_API_KEY}`
            }
         })
         res.status(200).json({ success: true, data })
      } catch (error) {
         const code =
            'status_code' in error && error.status_code
               ? error.status_code
               : 500
         res.status(code).json({ success: false, error })
      }
   },
   insert: async (req, res) => {
      try {
         const { brand = {} } = req.body

         if (!('id' in brand) && !brand.id)
            throw { message: 'Brand id is required!', status_code: 409 }

         const { status, data = {} } = await axios({
            method: 'POST',
            url: `${process.env.PLATFORM_URL}/api/parseur`,
            data: { brand, organization: { id: process.env.ORGANIZATION_ID } }
         })
         if (status === 200 && 'success' in data && data.success) {
            if ('data' in data && Object.keys(data.data).length > 0) {
               try {
                  await client.request(UPDATE_BRAND, {
                     id: brand.id,
                     _set: {
                        parseurMailBoxId: data.data.id
                     }
                  })
               } catch (_) {
                  throw {
                     message: 'Failed to set parseur mailbox id!'
                  }
               }
            }
         }
         res.status(200).json({ success: true, data })
      } catch (error) {
         const code =
            'status_code' in error && error.status_code
               ? error.status_code
               : 500
         res.status(code).json({ success: false, error })
      }
   }
}

export default parseur

const UPDATE_BRAND = `
   mutation updateBrand($id: Int!, $_set: brands_brand_set_input!) {
      updateBrand(pk_columns: { id: $id }, _set: $_set) {
         id
      }
   }
`
