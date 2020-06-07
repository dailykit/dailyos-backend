export const CREATE_NOTIFICATION = `
   mutation createDisplayNotification($object: notifications_displayNotification_insert_input!) {
      createDisplayNotification(object: $object) {
         id
      }
   }
`
