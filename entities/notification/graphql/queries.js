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
            isActive
            template
            printerPrintNodeId
         }
      }
   }
`
