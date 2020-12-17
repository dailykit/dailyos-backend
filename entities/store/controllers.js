import { client } from '../../lib/graphql'
import { GET_STORE_DATA, GET_CUSTOMER } from './graphql/queries'

export const getStoreData = async (req, res, next) => {
   const { domain, email, keycloakId } = req.body

   if (!domain) {
      return res.status(400).json({
         success: false,
         message: 'domain missing!',
         data: null
      })
   } else {
      const { onDemand_getStoreData } = await client.request(GET_STORE_DATA, {
         domain
      })

      if (onDemand_getStoreData.length) {
         const { settings, brandId } = onDemand_getStoreData[0]

         if (email && keycloakId) {
            const { customer } = await client.request(GET_CUSTOMER, {
               keycloakId
            })
            return res.status(200).json({
               success: true,
               message: 'Settings fetched!',
               data: {
                  brandId,
                  settings,
                  customer
               }
            })
         } else {
            return res.status(200).json({
               success: true,
               message: 'Settings fetched!',
               data: {
                  brandId,
                  settings
               }
            })
         }
      } else {
         return res.status(424).json({
            success: false,
            message: 'Failed to fetch settings!',
            data: null
         })
      }
   }
}
