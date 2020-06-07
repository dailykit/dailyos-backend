export const FETCH_TYPE = `
   query notificationTypes($name: String_comparison_exp!) {
      notificationTypes(where: {name: $name}) {
         id
         op
         app
         name
         table
         fields
         schema
         isLocal
         isGlobal
         template
         isActive
         audioUrl
         playAudio
         description
      }
   }
`
