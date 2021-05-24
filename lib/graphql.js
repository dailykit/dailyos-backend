require('dotenv').config()
import { GraphQLClient } from 'graphql-request'

export const client = new GraphQLClient(process.env.DATA_HUB, {
   headers: {
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
   }
})
export const stayInClient = new GraphQLClient(
   process.env.STAY_IN_SOCIAL_DATAHUB_URL,
   {
      headers: {
         'x-hasura-admin-secret':
            process.env.STAY_IN_SOCIAL_DATAHUB_ADMIN_SECRET
      }
   }
)
