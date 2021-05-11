import { client } from '../../../lib/graphql'
import {
   CUSTOMERS,
   INSERT_OCCURENCE_CUSTOMER,
   UDPATE_OCCURENCE_CUSTOMER_CARTS,
   UPDATE_OCCURENCE_CUSTOMER_BY_PK,
   DELETE_OCCURENCE_CUSTOMER,
   DELETE_CART,
   SUBSCRIPTION_OCCURENCES
} from '../graphql'

export const manageOccurence = async (req, res) => {
   try {
      const occurences = []
      if ('input' in req.body) {
         const { occurences: list = [] } = req.body.input
         occurences = list
      } else if (typeof req.body.payload === 'string') {
         const { occurenceId, cutoffTimeStamp } = JSON.parse(req.body.payload)
         occurences.push({
            id: occurenceId,
            cutoffTimeStamp: cutoffTimeStamp
         })
      } else {
         const { occurenceId, cutoffTimeStamp } = req.body.payload
         occurences.push({
            id: occurenceId,
            cutoffTimeStamp: cutoffTimeStamp
         })
      }
      const result = await Promise.all(
         occurences.map(async occurence => {
            try {
               if (!occurence.id)
                  return {
                     success: false,
                     message: 'Occurence id is required!'
                  }

               const { subscriptionOccurences = [] } = await client.request(
                  SUBSCRIPTION_OCCURENCES,
                  {
                     where: {
                        id: { _eq: occurence.id },
                        cutoffTimeStamp: { _eq: occurence.cutoffTimeStamp }
                     }
                  }
               )

               if (subscriptionOccurences.length > 0)
                  return {
                     success: false,
                     data: occurence,
                     message:
                        "Cutoff timestamp does not match the given occurence id's cutoff timestamp"
                  }

               const [subscriptionOccurence] = subscriptionOccurences

               const {
                  subscriptionId,
                  subscription = {},
                  settings: localSettings
               } = subscriptionOccurence

               if (subscriptionId) {
                  const { settings: globalSettings } = subscription
                  if (
                     globalSettings.isManageOccurence === false ||
                     localSettings.isManageOccurence === false
                  )
                     return res.status(200).json({
                        success: true,
                        message: `Reminder email functionality is disabled`
                     })
               }

               // HANDLE OCCURENCE CUSTOMERS THAT HAVE CHANGED PLAN
               await handle_changed_plan_occurence_customers(occurence)

               // HANDLE NO OCCURENCE CUSTOMERS
               await handle_no_occurence_customers(occurence)

               // HANDLE PAUSED OCCURENCE CUSTOMERS
               await handle_paused_occurence_customers(occurence)

               // HANDLE NO CART OCCURENCE CUSTOMERS
               await handle_no_cart_occurence_customers(occurence)

               // HANDLE CANCELLED SUBSCRIPTION OCCURENCE CUSTOMERS
               await handle_cancelled_subscription_occurence_customers(
                  occurence
               )

               // HANDLE NON SUBSCRIBER OCCURENCE CUSTOMERS
               await handle_non_subscriber_occurence_customers(occurence)

               // HANDLE OCCURENCE CUSTOMERS WITH VALID CART
               await handle_valid_cart_occurence_customers(occurence)

               // HANDLE OCCURENCE CUSTOMERS WITH INVALID CART
               await handle_invalid_cart_occurence_customers(occurence)

               return {
                  success: true,
                  data: occurence,
                  message: 'Successfully processed occurence!'
               }
            } catch (error) {
               return {
                  success: false,
                  data: occurence,
                  error: error.message,
                  message: 'Failed to process occurence!'
               }
            }
         })
      )

      return res.status(200).json({
         data: result,
         success: true,
         message: 'Successfully updated carts!'
      })
   } catch (error) {
      return res.status(200).json({
         success: false,
         error: error.message,
         message: 'Failed to process manage occurence'
      })
   }
}

// HANDLE NO OCCURENCE CUSTOMERS
const handle_no_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               keycloakId: { _is_null: true },
               subscriptionOccurenceId: { _eq: occurence.id }
            }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers.map(node => {
               return {
                  keycloakId: node.keycloakId,
                  brand_customerId: node.brand_customerId,
                  subscriptionOccurenceId: node.subscriptionOccurenceId,
                  lastUpdatedBy: {
                     type: 'auto',
                     message:
                        'Creating occurence customer due to no action being taken by customer.'
                  }
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE PAUSED OCCURENCE CUSTOMERS
const handle_paused_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               subscriptionOccurenceId: { _eq: occurence.id }
            }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers
               .filter(node => node.isPaused === null)
               .map(node => {
                  return {
                     hasPaused: node.betweenPause,
                     keycloakId: node.keycloakId,
                     brand_customerId: node.brand_customerId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId
                  }
               })
         )

         // MARK OCCURENCE_CUSTOMER PAUSED/SKIPPED BASED ON BETWEEN_PAUSE
         await Promise.all(
            rows.map(async row => {
               try {
                  const _set = {
                     ...(row.hasPaused
                        ? {
                             isPaused: true,
                             isSkipped: true,
                             lastUpdatedBy: {
                                type: 'auto',
                                message:
                                   'Occurence customer has been paused and skipped due to paused subscription.'
                             }
                          }
                        : {
                             isPaused: false,
                             lastUpdatedBy: {
                                type: 'auto',
                                message:
                                   'Occurence customer has been marked unpaused due to resumed subscription.'
                             }
                          })
                  }
                  const {
                     update_subscription_subscriptionOccurence_customer_by_pk = {}
                  } = await client.request(UPDATE_OCCURENCE_CUSTOMER_BY_PK, {
                     _set,
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  })
                  return update_subscription_subscriptionOccurence_customer_by_pk
               } catch (error) {
                  return error
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE NO CART OCCURENCE CUSTOMERS
const handle_no_cart_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               isPaused: { _eq: false },
               isSkipped: { _eq: false },
               cartId: { _is_null: true },
               subscriptionOccurenceId: { _eq: occurence.id }
            }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers.map(node => {
               return {
                  keycloakId: node.keycloakId,
                  brand_customerId: node.brand_customerId,
                  subscriptionOccurenceId: node.subscriptionOccurenceId
               }
            })
         )

         // SKIP ALL OCCURENCE_CUSTOMERS WITH NO CART
         await Promise.all(
            rows.map(async row => {
               try {
                  const {
                     update_subscription_subscriptionOccurence_customer_by_pk = {}
                  } = await client.request(UPDATE_OCCURENCE_CUSTOMER_BY_PK, {
                     _set: {
                        isSkipped: true,
                        lastUpdatedBy: {
                           type: 'auto',
                           message:
                              'Skipping occurence customer since there is no cart.'
                        }
                     },
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  })

                  return update_subscription_subscriptionOccurence_customer_by_pk
               } catch (error) {
                  return error
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE CANCELLED SUBSCRIPTION OCCURENCE CUSTOMERS
const handle_cancelled_subscription_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               subscriptionOccurenceId: { _eq: occurence.id },
               brandCustomer: { isSubscriptionCancelled: { _eq: true } }
            }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers
               .filter(node => node.paymentStatus !== 'PENDING')
               .map(node => {
                  return {
                     cartId: node.cartId,
                     keycloakId: node.keycloakId,
                     brand_customerId: node.brand_customerId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId
                  }
               })
         )
         await Promise.all(
            rows.map(async row => {
               try {
                  const { deleteOccurenceCustomer = {} } = await client.request(
                     DELETE_OCCURENCE_CUSTOMER,
                     {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  )
                  if (row.cartId) {
                     await client.request(DELETE_CART, {
                        id: row.cartId
                     })
                  }
                  return deleteOccurenceCustomer
               } catch (error) {
                  return error
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE NON SUBSCRIBER OCCURENCE CUSTOMERS
const handle_non_subscriber_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               subscriptionOccurenceId: { _eq: occurence.id },
               brandCustomer: { isSubscriber: { _eq: false } }
            }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers.map(node => {
               return {
                  cartId: node.cartId,
                  keycloakId: node.keycloakId,
                  brand_customerId: node.brand_customerId,
                  subscriptionOccurenceId: node.subscriptionOccurenceId
               }
            })
         )
         await Promise.all(
            rows.map(async row => {
               try {
                  const { deleteOccurenceCustomer = {} } = await client.request(
                     DELETE_OCCURENCE_CUSTOMER,
                     {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  )
                  if (row.cartId) {
                     await client.request(DELETE_CART, {
                        id: row.cartId
                     })
                  }
                  return deleteOccurenceCustomer
               } catch (error) {
                  return error
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE OCCURENCE CUSTOMERS THAT HAVE CHANGED PLAN
const handle_changed_plan_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: { subscriptionOccurenceId: { _eq: occurence.id } }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers
               .filter(
                  node =>
                     node.subscriptionId !== node.brandCustomer.subscriptionId
               )
               .map(node => {
                  return {
                     cartId: node.cartId,
                     keycloakId: node.keycloakId,
                     brand_customerId: node.brand_customerId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId
                  }
               })
         )
         await Promise.all(
            rows.map(async row => {
               try {
                  const { deleteOccurenceCustomer = {} } = await client.request(
                     DELETE_OCCURENCE_CUSTOMER,
                     {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  )
                  if (row.cartId) {
                     await client.request(DELETE_CART, {
                        id: row.cartId
                     })
                  }
                  return deleteOccurenceCustomer
               } catch (error) {
                  return error
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE OCCURENCE CUSTOMERS WITH VALID CART
const handle_valid_cart_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               isPaused: { _eq: false },
               isSkipped: { _eq: false },
               cartId: { _is_null: false },
               isItemCountValid: { _eq: true },
               paymentStatus: { _neq: 'SUCCEEDED' },
               subscriptionOccurenceId: { _eq: occurence.id }
            }
         })

      if (customers.length > 0) {
         await client.request(UDPATE_OCCURENCE_CUSTOMER_CARTS, {
            where: { id: { _in: customers.map(node => node.cartId) } },
            _inc: { paymentRetryAttempt: 1 },
            _set: {
               lastUpdatedBy: {
                  type: 'auto',
                  message: "Attempted payment on occurence customer's cart"
               }
            }
         })
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE OCCURENCE CUSTOMERS WITH INVALID CART
const handle_invalid_cart_occurence_customers = async occurence => {
   try {
      if (!occurence.id) return
      const { subscription_view_full_occurence_report: customers = [] } =
         await client.request(CUSTOMERS, {
            where: {
               isPaused: { _eq: false },
               isSkipped: { _eq: false },
               cartId: { _is_null: false },
               isItemCountValid: { _eq: false },
               paymentStatus: { _neq: 'SUCCEEDED' },
               subscriptionOccurenceId: { _eq: occurence.id }
            }
         })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers.map(node => {
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
                     _set: {
                        isSkipped: true,
                        lastUpdatedBy: {
                           type: 'auto',
                           message:
                              'Skipped occurence customer since cart is not full yet.'
                        }
                     },
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  })
                  return update_subscription_subscriptionOccurence_customer_by_pk
               } catch (error) {
                  return error
               }
            })
         )
      }

      return customers
   } catch (error) {
      throw error
   }
}
