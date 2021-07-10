export const UPDATE_USER = `
   mutation update_settings_user_by_pk($id: Int!, $keycloakId: String!) {
      update_settings_user_by_pk(pk_columns: {id: $id}, _set: {keycloakId: $keycloakId}) {
         id
      }
   }
`
