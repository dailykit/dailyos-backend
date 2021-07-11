require('dotenv').config()
import { GraphQLClient } from 'graphql-request'

export const client = new GraphQLClient(process.env.DATA_HUB, {
   headers: {
      'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET
   }
})
