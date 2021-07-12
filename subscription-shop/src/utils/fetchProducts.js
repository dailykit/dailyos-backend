import gql from 'graphql-tag'
import { graphQLClient } from '../lib'

const BRAND_ID_QUERY = gql`
   query Brands($domain: String!) {
      brands(where: { domain: { _eq: $domain }, isDefault: { _eq: true } }) {
         id
         domain
      }
   }
`

const GET_MENU_QUERY = gql`
   query GetMenu($params: jsonb!) {
      onDemand_getMenuV2(args: { params: $params }) {
         data
      }
   }
`

const PRODUCTS = gql`
   query Products($ids: [Int!]!) {
      products(
         where: {
            id: { _in: $ids }
            isPublished: { _eq: true }
            isArchived: { _eq: false }
         }
      ) {
         id
         name
         assets
         price
         discount
      }
   }
`

const getMenu = async (brandId, date) => {
   const { onDemand_getMenuV2 } = await graphQLClient.request(GET_MENU_QUERY, {
      params: {
         brandId,
         date,
      },
   })

   const [result] = onDemand_getMenuV2
   const { menu } = result.data

   return menu
}

const fillProductsInMenu = async menu => {
   const updatedMenu = []

   for (const category of menu) {
      const { products } = await graphQLClient.request(PRODUCTS, {
         ids: category.products,
      })
      updatedMenu.push({ name: category.name, products })
   }

   return updatedMenu
}

export const fetchProducts = async domain => {
   const today = new Date()
   const date = `${today.getDate()}/${
      today.getMonth() + 1
   }/${today.getFullYear()}`

   const { brands } = await graphQLClient.request(BRAND_ID_QUERY, {
      domain,
   })

   if (brands.length) {
      const [brand] = brands
      const menu = await getMenu(brand.id, date)
      const menuWithProducts = await fillProductsInMenu(menu)

      return menuWithProducts
   }

   return []
}
