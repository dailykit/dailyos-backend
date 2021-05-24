export const EXPERIENCE_INFO = `
   query EXPERIENCE_INFO($id: Int!) {
      experiences_experience_by_pk(id: $id) {
         ohyay_wsid
         id
      }
   }
`
