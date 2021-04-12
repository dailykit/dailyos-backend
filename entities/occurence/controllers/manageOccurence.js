import { client } from '../../../lib/graphql'
import {
   CUSTOMERS,
   INSERT_OCCURENCE_CUSTOMER,
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

      // CREATE OCCURENCE CUSTOMER
      const {
         subscription_view_full_occurence_report: pendingCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            keycloakId: { _is_null: true },
            subscriptionOccurenceId: { _eq: id }
         }
      })

      if (pendingCustomers.length > 0) {
         const rows = await Promise.all(
            pendingCustomers
               .filter(node => node.keycloakId)
               .map(node => {
                  return {
                     brand_customerId: node.brand_customerId,
                     keycloakId: node.brandCustomer.keycloakId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId
                  }
               })
         )
         await client.request(INSERT_OCCURENCE_CUSTOMER, {
            objects: rows
         })
      }

      // MARK OCCURENCE CUSTOMER PAUSED IF CUSTOMER HAS PAUSED
      /*
         mark isPaused=true, isSkipped=true
      */
      const {
         subscription_view_full_occurence_report: pausedCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            betweenPause: { _eq: true },
            subscriptionOccurenceId: { _eq: id }
         }
      })

      if (pausedCustomers.length > 0) {
         const rows = await Promise.all(
            pausedCustomers.map(node => {
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
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     },
                     _set: { isPaused: true, isSkipped: true }
                  })
                  return update_subscription_subscriptionOccurence_customer_by_pk
               } catch (error) {
                  return error
               }
            })
         )
      }

      // UPDATE CART TO ATTEMPT PAYMENT

      /*
         update subscriptionOccurence & subscriptionOccurence_customer log column at each mutation
      */
      const {
         subscription_view_full_occurence_report: validCustomers = []
      } = await client.request(CUSTOMERS, {
         where: {
            isPaused: { _eq: false },
            isSkipped: { _eq: false },
            cartId: { _is_null: false },
            paymentStatus: { _neq: 'SUCCEEDED' },
            subscriptionOccurenceId: { _eq: id }
         }
      })

      if (validCustomers.length > 0) {
         // PROCESS VALID ITEM COUNT
         const validCarts = validCustomers.filter(node => node.isItemCountValid)
         if (validCarts.length > 0) {
            await client.request(UDPATE_OCCURENCE_CUSTOMER_CARTS, {
               where: {
                  id: { _in: validCarts.map(node => node.cartId) }
               },
               _inc: { paymentRetryAttempt: 1 }
            })
         }

         // SKIP INVALID ITEM COUNT
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
                        pk_columns: {
                           keycloakId: row.keycloakId,
                           brand_customerId: row.brand_customerId,
                           subscriptionOccurenceId: row.subscriptionOccurenceId
                        },
                        _set: { isSkipped: true }
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
