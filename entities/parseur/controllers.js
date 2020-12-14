import axios from 'axios'

const parseur = {
   insert: async (req, res) => {
      try {
         const { brand = {} } = req.body

         if (!('id' in brand) && !brand.id)
            throw { message: 'Brand id is required!', status_code: 409 }

         const { data = {} } = await axios({
            method: 'POST',
            url: `${process.env.PLATFORM_URL}/api/parseur`,
            data: { brand, organization: { id: process.env.ORGANIZATION_ID } }
         })
         res.status(200).json({ success: true, data })
      } catch (error) {
         res.status(500).json({ success: false, error })
      }
   }
}

export default parseur
