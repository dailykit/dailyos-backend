import axios from 'axios'
import { client } from '../../lib/graphql'
import { UPDATE_USER } from './graphql/mutations'

export const manage = async (req, res) => {
   let requestType
   try {
      switch (req.body.event.op) {
         case 'INSERT':
            requestType = 'created'
            user.create(req.body.event.data.new)
            break
         case 'DELETE':
            requestType = 'deleted'
            user.delete(req.body.event.data.new)
            break
         default:
            throw Error('No such operation')
      }
      return res
         .status(200)
         .json({ success: true, message: `User has been ${requestType}!` })
   } catch (error) {
      return res
         .status(400)
         .json({ success: false, message: `User ${requestType} failed` })
   }
}

const user = {
   create: async user => {
      try {
         let response = await axios({
            url: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
               username: process.env.KEYCLOAK_MANAGER,
               password: process.env.KEYCLOAK_MANAGER_KEY
            },
            data: 'grant_type=client_credentials'
         })
         const { access_token } = await response.data

         await axios({
            url: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${access_token}`
            },
            data: {
               enabled: true,
               username: user.email,
               email: user.email,
               credentials: [
                  {
                     type: 'password',
                     value: user.tempPassword
                  }
               ]
            }
         })
      } catch (error) {
         throw Error(error.message)
      }
   },
   delete: async user => {
      try {
         await axios({
            method: 'DELETE',
            url: `${process.env.KEYCLOAK_URL}/admin/realm/${process.env.KEYCLOAK_REALM}/users/${user.keycloakId}`
         })
      } catch (error) {
         throw Error(error.message)
      }
   }
}
