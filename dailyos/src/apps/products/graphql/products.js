import gql from 'graphql-tag'

export const PRODUCTS = {
   COUNT: gql`
      subscription ProductsCount {
         productsAggregate(where: { isArchived: { _eq: false } }) {
            aggregate {
               count
            }
         }
      }
   `,
   CREATE: gql`
      mutation CreateProduct($object: products_product_insert_input!) {
         createProduct(object: $object) {
            id
            name
         }
      }
   `,
   DELETE: gql`
      mutation UpdateProduct($id: Int!) {
         updateProduct(pk_columns: { id: $id }, _set: { isArchived: true }) {
            id
         }
      }
   `,
   LIST: gql`
      subscription Products($where: products_product_bool_exp) {
         products(where: $where) {
            id
            name
            title: name
            isPublished
         }
      }
   `,
}

export const PRODUCT = {
   UPDATE: gql`
      mutation UpdateProduct($id: Int!, $_set: products_product_set_input) {
         updateProduct(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
   VIEW: gql`
      subscription Product($id: Int!) {
         product(id: $id) {
            id
            name
            type
            assets
            tags
            additionalText
            description
            price
            discount
            isPopupAllowed
            isValid
            isPublished
            productOptions(
               where: { isArchived: { _eq: false } }
               order_by: { position: desc_nulls_last }
            ) {
               id
               position
               type
               label
               price
               discount
               quantity
               simpleRecipeYield {
                  id
                  yield
                  simpleRecipe {
                     id
                     name
                  }
               }
               inventoryProductBundle {
                  id
                  label
               }
               modifier {
                  id
                  name
               }
               operationConfig {
                  id
                  name
               }
            }
            customizableProductComponents(
               where: { isArchived: { _eq: false } }
               order_by: { position: desc_nulls_last }
            ) {
               id
               options
               selectedOptions {
                  productOption {
                     id
                     label
                     quantity
                  }
                  price
                  discount
               }
               linkedProduct {
                  id
                  name
                  type
                  assets
               }
            }
            comboProductComponents(
               where: { isArchived: { _eq: false } }
               order_by: { position: desc_nulls_last }
            ) {
               id
               label
               options
               selectedOptions {
                  productOption {
                     id
                     label
                     quantity
                  }
                  price
                  discount
               }
               linkedProduct {
                  id
                  name
                  type
                  assets
               }
            }
         }
      }
   `,
}

export const PRODUCT_OPTION = {
   CREATE: gql`
      mutation CreateProductOption(
         $object: products_productOption_insert_input!
      ) {
         createProductOption(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation UpdateProductOption($id: Int!) {
         updateProductOption(
            pk_columns: { id: $id }
            _set: { isArchived: true }
         ) {
            id
         }
      }
   `,
   LIST_QUERY: gql`
      query ProductOptions($where: products_productOption_bool_exp) {
         productOptions(where: $where) {
            id
            label
            price
            discount
            product {
               id
               name
               assets
            }
         }
      }
   `,
   LIST: gql`
      subscription ProductOptions($where: products_productOption_bool_exp) {
         productOptions(where: $where) {
            id
            label
            price
            discount
            product {
               id
               name
            }
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateProductOption(
         $id: Int!
         $_set: products_productOption_set_input
      ) {
         updateProductOption(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
}

export const CUSTOMIZABLE_PRODUCT_COMPONENT = {
   CREATE: gql`
      mutation CreateCustomizableProductComponent(
         $object: products_customizableProductComponent_insert_input!
      ) {
         createCustomizableProductComponent(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation UpdateCustomizableProductComponent($id: Int!) {
         updateCustomizableProductComponent(
            pk_columns: { id: $id }
            _set: { isArchived: true }
         ) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateCustomizableProductComponent(
         $id: Int!
         $_set: products_customizableProductComponent_set_input
      ) {
         updateCustomizableProductComponent(
            pk_columns: { id: $id }
            _set: $_set
         ) {
            id
         }
      }
   `,
}

export const COMBO_PRODUCT_COMPONENT = {
   CREATE: gql`
      mutation CreateComboProductComponent(
         $objects: [products_comboProductComponent_insert_input!]!
      ) {
         createComboProductComponents(objects: $objects) {
            returning {
               id
            }
         }
      }
   `,
   DELETE: gql`
      mutation UpdateComboProductComponent($id: Int!) {
         updateComboProductComponent(
            pk_columns: { id: $id }
            _set: { isArchived: true }
         ) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateComboProductComponent(
         $id: Int!
         $_set: products_comboProductComponent_set_input
      ) {
         updateComboProductComponent(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
}

export const PRODUCT_OPTION_TYPES = {
   LIST: gql`
      subscription ProductOptionTypes {
         productOptionTypes {
            id: title
            title
            orderMode
         }
      }
   `,
}
