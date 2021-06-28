import { GraphQLClient } from 'graphql-request'

export const graphQLClient = new GraphQLClient(process.env.DATA_HUB_HTTPS, {
   headers: {
      'x-hasura-admin-secret': process.env.ADMIN_SECRET,
   },
})
