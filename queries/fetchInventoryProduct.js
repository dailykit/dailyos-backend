export const FETCH_INVENTORY_PRODUCT = `
   query inventoryProduct($id: Int!){
      inventoryProduct(id: $id) {
         id
         assemblyStationId
      }
   }      
`
