import { GraphQLClient } from 'graphql-request'
import { get_env } from '../utils'

export const graphQLClient = new GraphQLClient(get_env('DATA_HUB_HTTPS'), {
   headers: {
      'x-hasura-admin-secret': get_env('ADMIN_SECRET'),
   },
})
