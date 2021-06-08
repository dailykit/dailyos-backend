export const FULL_OCCURENCE_REPORT = `
query FullOccurenceReport {
    brandCustomers(where: {isSubscriber: {_eq: true},isSubscriptionCancelled: {_eq: false}}) {
      id
      pastOccurences: subscriptionOccurences(where: {_or: {_and: {subscriptionOccurence: {cutoffTimeStamp: {_lte: "now()"}}, isArchived: {_eq: false}}, cart: {paymentStatus: {_neq: "PENDING"}}}}, order_by: {subscriptionOccurence: {fulfillmentDate: asc}}) {
        subscriptionOccurence {
          id
          fulfillmentDate
          cutoffTimeStamp
          startTimeStamp
          view_subscription {
        rrule
        subscriptionItemCount
        subscriptionServingSize
        title
      }
        }
        betweenPause
        cart {
          id
        paymentRetryAttempt
        paymentStatus
        status
        totalPrice
        discount
        }
        validStatus
        isPaused
        isSkipped
      }
      customer {
        email
      }
      subscription {
        subscriptionOccurences(where: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}) {
          fulfillmentDate
          id
        }
      }
      
      upcomingOccurences: activeSubscriptionOccurenceCustomers(where: {subscriptionOccurence: {cutoffTimeStamp: {_gte: "now()"}, startTimeStamp: {_lte: "now()"}}}) {
        subscriptionOccurence {
          id
          fulfillmentDate
          cutoffTimeStamp
          startTimeStamp
          view_subscription {
            rrule
            subscriptionItemCount
            subscriptionServingSize
            title
          }
        }
        betweenPause
        cart {
          id
        paymentRetryAttempt
        paymentStatus
        status
        totalPrice
        discount
        }
        validStatus
        isPaused
        isSkipped
      }
    }
  }`
