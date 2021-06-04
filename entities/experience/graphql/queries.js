export const EXPERIENCE_CLASS_INFO = `
query EXPERIENCE_CLASS_INFO($where: experiences_experienceClass_bool_exp!) {
   experiences_experienceClass(where: $where) {
     id
     isActive
     isBooked
     ohyay_wsid
     startTimeStamp
     duration
     experience {
       assets
       description
       metaData
       title
     }
   }
 }

`
