export const CREATE_CUSTOMER = `
   mutation CreateCustomer($object: crm_customer_insert_input!){  
      createCustomer(object: $object) {
         id
         email
         keycloakId
      }
   }
`

export const CREATE_BRAND_CUSTOMER = `
   mutation CreateBrandCustomer($brandId: Int!, $keycloakId: String!){  
      createBrandCustomer(object: { brandId: $brandId,  keycloakId: $keycloakId }) {
         id
      }
   }
`
