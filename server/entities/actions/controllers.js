import axios from 'axios'

import { client } from '../../lib/graphql'

const FETCH_NUTRITION_INFO = `
   query fetchNutritionInfo($id: Int_comparison_exp!){
      simpleRecipeYields(where: {id: $id}) {
         nutritionId
         nutritionalInfo
      }
   } 
`

const UPDATE_NUTRITION_INFO = `
   mutation updateNutritionInfo($_eq: Int!, $_set: products_nutritionInfo_set_input!) {
      update_products_nutritionInfo(where: {id: {_eq: $_eq}}, _set: $_set) {
      returning {
         id
      }
      }
   }
`
export const nutritionInfo = async (req, res) => {
   try {
      //console.log(req.body.input.simpleRecipeYieldIds)
      const { simpleRecipeYields } = await client.request(
         FETCH_NUTRITION_INFO,
         {
            id: {
               _eq: req.body.input.simpleRecipeYieldIds[0]
            }
         }
      )
      //console.log(simpleRecipeYields[0])
      const nutritionalInfo = simpleRecipeYields[0].nutritionalInfo
      console.log(nutritionalInfo)
      const allowed = [
         'iron',
         'sodium',
         'sugars',
         'calcium',
         'protein',
         'calories',
         'totalFat',
         'transFat',
         'vitaminA',
         'vitaminC',
         'cholesterol',
         'dietaryFibre',
         'saturatedFat',
         'totalCarbohydrates',
         'excludes'
      ]

      const filtered = Object.keys(nutritionalInfo)
         .filter(key => allowed.includes(key))
         .reduce((obj, key) => {
            obj[key] = nutritionalInfo[key]
            return obj
         }, {})
      //console.log(filtered)
      //console.log(simpleRecipeYields[0].nutritionId)
      const { update_products_nutritionInfo } = await client.request(
         UPDATE_NUTRITION_INFO,
         {
            _eq: simpleRecipeYields[0].nutritionId,
            _set: filtered
         }
      )
      //console.log(update_products_nutritionInfo)

      return res.json({
         success: true,
         message: 'Successfully generated nutrition info!'
      })
   } catch (error) {
      console.log(error)
      return res.json({ error: error.message })
   }
}

//const excludes = []
// const nutritionInfo = {
//    iron: 0,
//    sodium: 0,
//    sugars: 0,
//    calcium: 0,
//    protein: 0,
//    calories: 0,
//    totalFat: 0,
//    transFat: 0,
//    vitaminA: 0,
//    vitaminC: 0,
//    cholesterol: 0,
//    dietaryFibres: 0,
//    saturatedFat: 0,
//    totalCarbohyderates: 0,
//    excludes: []
// }
// //
// simpleRecipeYields[0].ingredientSachets.map((item, index) => {
//    if (item.ingredientSachet.nutritionalInfo === null) {
//       nutritionInfo.excludes.push(item.ingredientSachet.ingredient.name)
//    } else {
//       nutritionInfo.iron += item.ingredientSachet.nutritionalInfo.iron
//       nutritionInfo.sodium += item.ingredientSachet.nutritionalInfo.sodium
//       nutritionInfo.sugars += item.ingredientSachet.nutritionalInfo.sugars
//       nutritionInfo.calcium +=
//          item.ingredientSachet.nutritionalInfo.calcium
//       nutritionInfo.protein +=
//          item.ingredientSachet.nutritionalInfo.protein
//       nutritionInfo.calories +=
//          item.ingredientSachet.nutritionalInfo.calories
//       nutritionInfo.totalFat +=
//          item.ingredientSachet.nutritionalInfo.totalFat
//       nutritionInfo.transFat +=
//          item.ingredientSachet.nutritionalInfo.transFat
//       nutritionInfo.vitaminA +=
//          item.ingredientSachet.nutritionalInfo.vitaminA
//       nutritionInfo.vitaminC +=
//          item.ingredientSachet.nutritionalInfo.vitaminC
//       nutritionInfo.cholesterol +=
//          item.ingredientSachet.nutritionalInfo.cholesterol
//       nutritionInfo.dietaryFibres +=
//          item.ingredientSachet.nutritionalInfo.dietaryFibre
//       nutritionInfo.saturatedFat +=
//          item.ingredientSachet.nutritionalInfo.saturatedFat
//       nutritionInfo.totalCarbohyderates +=
//          item.ingredientSachet.nutritionalInfo.totalCarbohydrates
//    }
// })
//console.log(nutritionInfo)
