import { client } from '../../lib/graphql'

export const statusLogger = async ({
   message,
   type = '',
   keycloakId,
   brand_customerId,
   subscriptionOccurenceId
}) => {
   await client.request(INSERT_ACTIVITY_LOGS, {
      objects: [
         {
            type,
            keycloakId,
            log: { message },
            brand_customerId,
            subscriptionOccurenceId,
            lastUpdatedBy: {
               type: 'auto',
               message
            }
         }
      ]
   })
}

const INSERT_ACTIVITY_LOGS = `
   mutation insertActivityLogs(
      $objects: [settings_activityLogs_insert_input!]!
   ) {
      insertActivityLogs: insert_settings_activityLogs(objects: $objects) {
         affected_rows
      }
   }
`
