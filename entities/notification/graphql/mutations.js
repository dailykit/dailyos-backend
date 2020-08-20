export const CREATE_NOTIFICATION = `
   mutation createDisplayNotification($object: notifications_displayNotification_insert_input!) {
      createDisplayNotification(object: $object) {
         id
      }
   }
`

export const PRINT_JOB = `
   mutation createPrintJob(
      $url: String!
      $title: String!
      $printerId: Int!
      $source: String!
      $contentType: String!
   ) {
      createPrintJob(
         url: $url
         title: $title
         source: $source
         printerId: $printerId
         contentType: $contentType
      ) {
         message
         success
      }
   }
`

export const SEND_MAIL = `
   mutation sendEmail($emailInput: EmailInput!) {
      sendEmail(emailInput: $emailInput) {
         message
         success
      }
   }
`
