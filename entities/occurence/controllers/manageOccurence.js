import { client } from '../../../lib/graphql'
import {
   CUSTOMERS,
   INSERT_OCCURENCE_CUSTOMER,
   UDPATE_SUBSCRIPTION_OCCURENCES,
   UDPATE_OCCURENCE_CUSTOMER_CARTS,
   UPDATE_OCCURENCE_CUSTOMER_BY_PK
} from '../graphql'

export const manageOccurence = async (req, res) => {
   try {
      const node = {
         id: null,
         cutoffTimeStamp: null
      }
      if (typeof req.body.payload === 'string') {
         const { id, cutoffTimeStamp } = JSON.parse(req.body.payload)
         node.id = id
         node.cutoffTimeStamp = cutoffTimeStamp
      } else {
         const { id, cutoffTimeStamp } = req.body.payload
         node.id = id
         node.cutoffTimeStamp = cutoffTimeStamp
      }

      const {
         subscription_view_full_occurence_report: pendingCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            keycloakId: { _is_null: true },
            subscriptionOccurenceId: { _eq: node.id }
         }
      })

      if (pendingCustomers.length > 0) {
         const rows = await Promise.all(
            pendingCustomers.map(node => {
               return {
                  brand_customerId: node.brand_customerId,
                  keycloakId: node.brandCustomer.keycloakId,
                  subscriptionOccurenceId: node.subscriptionOccurenceId,
                  logs: [{ operation: 'INSERT', timestamp: +new Date() }]
               }
            })
         )
         console.log('rows', rows)
         await client.request(INSERT_OCCURENCE_CUSTOMER, {
            objects: rows
         })

         await client.request(UDPATE_SUBSCRIPTION_OCCURENCES, {
            where: { id: { _eq: node.id } },
            _prepend: {
               logs: {
                  operation: 'UPDATE',
                  timestamp: +new Date(),
                  message: 'Creating occurence customers!'
               }
            }
         })
      }

      const {
         subscription_view_full_occurence_report: pausedCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            subscriptionOccurenceId: { _eq: node.id }
         }
      })

      if (pausedCustomers.length > 0) {
         const rows = await Promise.all(
            pausedCustomers.map(node => {
               return {
                  hasPaused: node.betweenPause,
                  keycloakId: node.keycloakId,
                  brand_customerId: node.brand_customerId,
                  subscriptionOccurenceId: node.subscriptionOccurenceId
               }
            })
         )

         await Promise.all(
            rows.map(async row => {
               try {
                  const _set = {
                     ...(row.hasPaused
                        ? { isPaused: true, isSkipped: true }
                        : { isPaused: false })
                  }
                  const {
                     update_subscription_subscriptionOccurence_customer_by_pk = {}
                  } = await client.request(UPDATE_OCCURENCE_CUSTOMER_BY_PK, {
                     _set,
                     _prepend: {
                        logs: {
                           fields: _set,
                           operation: 'UPDATE',
                           timestamp: +new Date()
                        }
                     },
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  })
                  await client.request(UDPATE_SUBSCRIPTION_OCCURENCES, {
                     where: { id: { _eq: node.id } },
                     _prepend: {
                        logs: {
                           operation: 'UPDATE',
                           timestamp: +new Date(),
                           message: 'Paused and skipped occurence customers',
                           fields: update_subscription_subscriptionOccurence_customer_by_pk
                        }
                     }
                  })
                  return update_subscription_subscriptionOccurence_customer_by_pk
               } catch (error) {
                  return error
               }
            })
         )
      }

      const {
         subscription_view_full_occurence_report: noCartCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            isPaused: { _eq: false },
            isSkipped: { _eq: false },
            cartId: { _is_null: true },
            subscriptionOccurenceId: { _eq: node.id }
         }
      })

      if (noCartCustomers.length > 0) {
         const rows = await Promise.all(
            noCartCustomers.map(node => {
               return {
                  keycloakId: node.keycloakId,
                  brand_customerId: node.brand_customerId,
                  subscriptionOccurenceId: node.subscriptionOccurenceId
               }
            })
         )

         await Promise.all(
            rows.map(async row => {
               try {
                  const {
                     update_subscription_subscriptionOccurence_customer_by_pk = {}
                  } = await client.request(UPDATE_OCCURENCE_CUSTOMER_BY_PK, {
                     _prepend: {
                        logs: {
                           operation: 'UPDATE',
                           timestamp: +new Date(),
                           fields: { isSkipped: true }
                        }
                     },
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     },
                     _set: { isSkipped: true }
                  })
                  await client.request(UDPATE_SUBSCRIPTION_OCCURENCES, {
                     where: { id: { _eq: node.id } },
                     _prepend: {
                        logs: {
                           operation: 'UPDATE',
                           timestamp: +new Date(),
                           message: 'Skipped occurence customer.',
                           fields: update_subscription_subscriptionOccurence_customer_by_pk
                        }
                     }
                  })
                  return update_subscription_subscriptionOccurence_customer_by_pk
               } catch (error) {
                  return error
               }
            })
         )
      }

      const {
         subscription_view_full_occurence_report: validCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            isPaused: { _eq: false },
            isSkipped: { _eq: false },
            cartId: { _is_null: false },
            paymentStatus: { _neq: 'SUCCEEDED' },
            subscriptionOccurenceId: { _eq: node.id }
         }
      })

      if (validCustomers.length > 0) {
         const validCarts = validCustomers.filter(node => node.isItemCountValid)
         if (validCarts.length > 0) {
            const { updateCarts = {} } = await client.request(
               UDPATE_OCCURENCE_CUSTOMER_CARTS,
               {
                  where: {
                     id: { _in: validCarts.map(node => node.cartId) }
                  },
                  _inc: { paymentRetryAttempt: 1 }
               }
            )
            await client.request(UDPATE_SUBSCRIPTION_OCCURENCES, {
               where: { id: { _eq: node.id } },
               _prepend: {
                  logs: {
                     operation: 'UPDATE',
                     fields: updateCarts,
                     timestamp: +new Date(),
                     message: "Attempted payment on occurence customer's carts"
                  }
               }
            })
         }

         const invalidCarts = validCustomers.filter(
            node => !node.isItemCountValid
         )
         if (invalidCarts.length > 0) {
            const rows = await Promise.all(
               invalidCarts.map(node => {
                  return {
                     keycloakId: node.keycloakId,
                     brand_customerId: node.brand_customerId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId
                  }
               })
            )
            await Promise.all(
               rows.map(async row => {
                  try {
                     const {
                        update_subscription_subscriptionOccurence_customer_by_pk = {}
                     } = await client.request(UPDATE_OCCURENCE_CUSTOMER_BY_PK, {
                        _prepend: {
                           logs: {
                              operation: 'UPDATE',
                              timestamp: +new Date(),
                              fields: { isSkipped: true }
                           }
                        },
                        pk_columns: {
                           keycloakId: row.keycloakId,
                           brand_customerId: row.brand_customerId,
                           subscriptionOccurenceId: row.subscriptionOccurenceId
                        },
                        _set: { isSkipped: true }
                     })
                     await client.request(UDPATE_SUBSCRIPTION_OCCURENCES, {
                        where: { id: { _eq: id } },
                        _prepend: {
                           logs: {
                              operation: 'UPDATE',
                              timestamp: +new Date(),
                              message: 'Skipped carts with invalid item counts',
                              fields: update_subscription_subscriptionOccurence_customer_by_pk
                           }
                        }
                     })
                     return update_subscription_subscriptionOccurence_customer_by_pk
                  } catch (error) {
                     return error
                  }
               })
            )
         }
      }

      return res.status(200).json({
         success: true,
         message: 'Successfully updated carts!'
      })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}
