export const FETCH_TYPE = `
   query notificationTypes($name: String_comparison_exp!) {
      notificationTypes(where: { name: $name }) {
         id
         isLocal
         isGlobal
         template
         isActive
         printConfigs(where: { isActive: { _eq: true } }) {
            id
            template
            printerPrintNodeId
         }
         emailConfigs(where: { isActive: { _eq: true } }) {
            id
            email
            template
         }
      }
   }
`

export const EMAIL = `
   query email {
      email: storeSettings(
         where: { identifier: { _eq: "Email Notification" } }
      ) {
         id
         value
      }
   }
`
