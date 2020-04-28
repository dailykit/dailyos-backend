export const CREATE_CUSTOMER = `
   mutation createCustomer($object: crm_customer_insert_input!) {
      createCustomer(object: $object) {
         id
      }
   }
`
