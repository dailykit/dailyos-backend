export const GET_STORE_DATA = `
   query GetStoreData($domain: String!) {  
      onDemand_getStoreData(args: {requestdomain : $domain }) {
         id
         brandId
         settings
      }
   }
`

export const GET_CUSTOMER = `
   query Customer($keycloakId: String!) {  
      customer(keycloakId: $keycloakId ) {
         id
         email
         keycloakId
      }
   }
`
