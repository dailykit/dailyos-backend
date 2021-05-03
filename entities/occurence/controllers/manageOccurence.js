import { client } from '../../../lib/graphql'
import {
   CUSTOMERS,
   INSERT_OCCURENCE_CUSTOMER,
   UDPATE_SUBSCRIPTION_OCCURENCES,
   UDPATE_OCCURENCE_CUSTOMER_CARTS,
   UPDATE_OCCURENCE_CUSTOMER_BY_PK,
   DELETE_OCCURENCE_CUSTOMER,
   DELETE_CART,
   INSERT_ACTIVITY_LOGS
} from '../graphql'

export const manageOccurence = async (req, res) => {
   try {
      const occurence = {
         id: null,
         cutoffTimeStamp: null
      }
      if (typeof req.body.payload === 'string') {
         const { id, cutoffTimeStamp } = JSON.parse(req.body.payload)
         occurence.id = id
         occurence.cutoffTimeStamp = cutoffTimeStamp
      } else {
         const { id, cutoffTimeStamp } = req.body.payload
         occurence.id = id
         occurence.cutoffTimeStamp = cutoffTimeStamp
      }

      // HANDLE NO OCCURENCE CUSTOMERS
      await handle_no_occurence_customers(occurence)

      // HANDLE PAUSED OCCURENCE CUSTOMERS
      await handle_paused_occurence_customers(occurence)

      // HANDLE NO CART OCCURENCE CUSTOMERS
      await handle_no_cart_occurence_customers(occurence)

      // HANDLE CANCELLED SUBSCRIPTION OCCURENCE CUSTOMERS
      await handle_cancelled_subscription_occurence_customers(occurence)

      // HANDLE NON SUBSCRIBER OCCURENCE CUSTOMERS
      await handle_non_subscriber_occurence_customers(occurence)

      // HANDLE OCCURENCE CUSTOMERS THAT HAVE CHANGED PLAN
      await handle_changed_plan_occurence_customers(occurence)

      // HANDLE OCCURENCE CUSTOMERS WITH VALID CART
      await handle_valid_cart_occurence_customers(occurence)

      // HANDLE OCCURENCE CUSTOMERS WITH INVALID CART
      await handle_invalid_cart_occurence_customers(occurence)

      return res.status(200).json({
         success: true,
         message: 'Successfully updated carts!'
      })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

// HANDLE NO OCCURENCE CUSTOMERS
const handle_no_occurence_customers = async occurence => {
   try {
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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
                  subscriptionOccurenceId: node.subscriptionOccurenceId
               }
            })
         )
         // CREATE ENTRY FOR PENDING CUSTOMERS IN OCCURENCE_CUSTOMER
         const {
            insertSubscriptionOccurenceCustomers = {}
         } = await client.request(INSERT_OCCURENCE_CUSTOMER, {
            objects: rows
         })
         await client.request(INSERT_ACTIVITY_LOGS, {
            objects: insertSubscriptionOccurenceCustomers.returning.map(
               node => {
                  return {
                     type: 'Manage Occurence',
                     keycloakId: node.keycloakId,
                     brand_customerId: node.brand_customerId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId,
                     log: {
                        operation: 'UPDATE',
                        message:
                           'Creating occurence customer due to no action being taken by customer.'
                     }
                  }
               }
            )
         })
      }

      return customers
   } catch (error) {
      throw error
   }
}

// HANDLE PAUSED OCCURENCE CUSTOMERS
const handle_paused_occurence_customers = async occurence => {
   try {
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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
                        ? { isPaused: true, isSkipped: true }
                        : { isPaused: false })
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
                  if (_set.isPaused) {
                     const {
                        cartId = null,
                        keycloakId = null,
                        brand_customerId = null,
                        subscriptionOccurenceId = null
                     } = update_subscription_subscriptionOccurence_customer_by_pk
                     await client.request(INSERT_ACTIVITY_LOGS, {
                        objects: [
                           {
                              keycloakId,
                              brand_customerId,
                              subscriptionOccurenceId,
                              type: 'Manage Occurence',
                              ...(cartId && { cartId }),
                              log: {
                                 fields: _set,
                                 operation: 'UPDATE',
                                 message:
                                    'Occurence customer has been paused and skipped due to paused subscription.'
                              }
                           }
                        ]
                     })
                  }
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
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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
                     _set: { isSkipped: true },
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  })

                  const {
                     keycloakId = null,
                     brand_customerId = null,
                     subscriptionOccurenceId = null
                  } = update_subscription_subscriptionOccurence_customer_by_pk
                  await client.request(INSERT_ACTIVITY_LOGS, {
                     objects: [
                        {
                           keycloakId,
                           brand_customerId,
                           subscriptionOccurenceId,
                           type: 'Manage Occurence',
                           log: {
                              operation: 'UPDATE',
                              fields: { isSkipped: true },
                              message:
                                 'Skipping occurence customer since there is no cart.'
                           }
                        }
                     ]
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
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
         where: {
            subscriptionOccurenceId: { _eq: occurence.id },
            brandCustomer: { isSubscriptionCancelled: { _eq: true } }
         }
      })

      if (customers.length > 0) {
         const rows = await Promise.all(
            customers
               .filter(node => node.paymentStatus !== 'SUCCEEDED')
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
                  const {
                     keycloakId = null,
                     brand_customerId = null,
                     subscriptionOccurenceId = null
                  } = deleteOccurenceCustomer
                  await client.request(INSERT_ACTIVITY_LOGS, {
                     objects: [
                        {
                           keycloakId,
                           brand_customerId,
                           subscriptionOccurenceId,
                           type: 'Manage Occurence',
                           log: {
                              operation: 'DELETE',
                              message:
                                 'Deleted occurence customer due to cancelled subscription'
                           }
                        }
                     ]
                  })
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
      // DELETE OCCURENCE_CUSTOMER/CART IF NOT SUBSCRIBER
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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

                  const {
                     keycloakId = null,
                     brand_customerId = null,
                     subscriptionOccurenceId = null
                  } = deleteOccurenceCustomer
                  await client.request(INSERT_ACTIVITY_LOGS, {
                     objects: [
                        {
                           keycloakId,
                           brand_customerId,
                           subscriptionOccurenceId,
                           type: 'Manage Occurence',
                           log: {
                              operation: 'DELETE',
                              message:
                                 'Deleted occurence customer since customer is not a subscriber yet.'
                           }
                        }
                     ]
                  })
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
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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

                  const {
                     keycloakId = null,
                     brand_customerId = null,
                     subscriptionOccurenceId = null
                  } = deleteOccurenceCustomer
                  await client.request(INSERT_ACTIVITY_LOGS, {
                     objects: [
                        {
                           keycloakId,
                           brand_customerId,
                           subscriptionOccurenceId,
                           type: 'Manage Occurence',
                           log: {
                              operation: 'DELETE',
                              message:
                                 'Deleted occurence customer due to changed subscription plan.'
                           }
                        }
                     ]
                  })
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
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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
                     _set: { isSkipped: true },
                     pk_columns: {
                        keycloakId: row.keycloakId,
                        brand_customerId: row.brand_customerId,
                        subscriptionOccurenceId: row.subscriptionOccurenceId
                     }
                  })
                  const {
                     cartId = null,
                     keycloakId = null,
                     brand_customerId = null,
                     subscriptionOccurenceId = null
                  } = update_subscription_subscriptionOccurence_customer_by_pk
                  await client.request(INSERT_ACTIVITY_LOGS, {
                     objects: [
                        {
                           cartId,
                           keycloakId,
                           brand_customerId,
                           subscriptionOccurenceId,
                           type: 'Manage Occurence',
                           log: {
                              operation: 'UPDATE',
                              fields: { isSkipped: true },
                              message:
                                 'Skipped occurence customer since cart is not full yet.'
                           }
                        }
                     ]
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

// HANDLE OCCURENCE CUSTOMERS WITH INVALID CART
const handle_invalid_cart_occurence_customers = async occurence => {
   try {
      const {
         subscription_view_full_occurence_report: customers = []
      } = await client.request(CUSTOMERS, {
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
         // ATTEMPT PAYMENT ON OCCURENCE_CUSTOMERS THAT HAVE VALID CART
         if (customers.length > 0) {
            await client.request(UDPATE_OCCURENCE_CUSTOMER_CARTS, {
               where: { id: { _in: customers.map(node => node.cartId) } },
               _inc: { paymentRetryAttempt: 1 }
            })
            await client.request(INSERT_ACTIVITY_LOGS, {
               objects: customers.map(node => {
                  return {
                     cartId: node.cartId,
                     keycloakId: node.keycloakId,
                     brand_customerId: node.brand_customerId,
                     subscriptionOccurenceId: node.subscriptionOccurenceId,
                     type: 'Manage Occurence',
                     log: {
                        operation: 'UPDATE',
                        message:
                           "Attempted payment on occurence customer's cart"
                     }
                  }
               })
            })
         }
      }

      return customers
   } catch (error) {
      throw error
   }
}
