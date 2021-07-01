import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Text,
   Form,
   Flex,
   Tunnel,
   Spacer,
   Tunnels,
   Dropdown,
   useTunnel,
   TextButton,
   TunnelHeader,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'

import { useMenu } from './state'
import tableOptions from '../../../tableOption'
import { logger } from '../../../../../shared/utils'
import { useTooltip } from '../../../../../shared/providers'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
} from '../../../../../shared/components'
import {
   PRODUCT_CATEGORIES,
   INSERT_OCCURENCE_PRODUCTS,
   SIMPLE_RECIPE_PRODUCT_OPTIONS,
   INVENTORY_PRODUCT_OPTIONS,
} from '../../../graphql'

const ProductsSection = () => {
   const { tooltip } = useTooltip()
   const { state, dispatch } = useMenu()
   const mealKitTableRef = React.useRef()
   const readyToEatTableRef = React.useRef()
   const inventoryTableRef = React.useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const columns = [
      {
         title: 'Product',
         headerFilter: true,
         field: 'product.name',
         headerFilterPlaceholder: 'Search products...',
         headerTooltip: column => {
            const identifier = 'product_listing_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Serving',
         field: 'recipeYield.size',
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 100,
         headerTooltip: column => {
            const identifier = 'product_listing_column_serving'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Label',
         field: 'label',
         width: 100,
         headerTooltip: column => {
            const identifier = 'product_listing_column_label'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Quantity',
         field: 'quantity',
         hozAlign: 'right',
         headerHozAlign: 'right',
         width: 100,
         headerTooltip: column => {
            const identifier = 'product_listing_column_quantity'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Author',
         headerFilter: true,
         field: 'recipeYield.recipe.author',
         headerTooltip: column => {
            const identifier = 'product_listing_column_author'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   const handleRowSelection = row => {
      const data = row.getData()

      if (row.isSelected()) {
         dispatch({
            type: 'SET_PRODUCT',
            payload: {
               option: { id: data.id },
            },
         })
      } else {
         dispatch({
            type: 'REMOVE_PRODUCT',
            payload: data.id,
         })
      }
   }

   const handleRowValidation = row => {
      const data = row.getData()
      if (!localStorage.getItem('serving_size')) return true

      let compareWith
      if (['mealKit', 'readyToEat'].includes(data.type)) {
         compareWith = data.recipeYield.size
      }
      return compareWith === parseInt(localStorage.getItem('serving_size'), 10)
   }

   const isValid =
      !isEmpty(state.plans.selected) &&
      !isEmpty(state.products.selected) &&
      state.products.selected.length > 0
   return (
      <Wrapper>
         <Flex
            container
            height="48px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">Products</Text>
               <Tooltip identifier="listing_menu_section_products_heading" />
            </Flex>
            <TextButton
               size="sm"
               type="outline"
               disabled={!isValid}
               onClick={() => openTunnel(1)}
            >
               Continue
            </TextButton>
         </Flex>
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>Ready To Eats</HorizontalTab>
               <HorizontalTab>Meal Kits</HorizontalTab>
               <HorizontalTab>Inventory</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel style={{ padding: '14px 0' }}>
                  {isEmpty(state.plans.selected) ? (
                     <Text as="h3">Select a plan to start</Text>
                  ) : (
                     <ReadyToEats
                        columns={columns}
                        readyToEatTableRef={readyToEatTableRef}
                        handleRowSelection={handleRowSelection}
                        handleRowValidation={handleRowValidation}
                     />
                  )}
               </HorizontalTabPanel>
               <HorizontalTabPanel style={{ padding: '14px 0' }}>
                  {isEmpty(state.plans.selected) ? (
                     <Text as="h3">Select a plan to start</Text>
                  ) : (
                     <MealKits
                        columns={columns}
                        mealKitTableRef={mealKitTableRef}
                        handleRowSelection={handleRowSelection}
                        handleRowValidation={handleRowValidation}
                     />
                  )}
               </HorizontalTabPanel>
               <HorizontalTabPanel style={{ padding: '14px 0' }}>
                  {isEmpty(state.plans.selected) ? (
                     <Text as="h3">Select a plan to start</Text>
                  ) : (
                     <Inventory
                        inventoryTableRef={inventoryTableRef}
                        handleRowSelection={handleRowSelection}
                     />
                  )}
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
         <SaveTunnel
            tunnels={tunnels}
            openTunnel={openTunnel}
            closeTunnel={closeTunnel}
            mealKitTableRef={mealKitTableRef}
            inventoryTableRef={inventoryTableRef}
            readyToEatTableRef={readyToEatTableRef}
         />
      </Wrapper>
   )
}

export default ProductsSection

const MealKits = ({
   columns,
   mealKitTableRef,
   handleRowSelection,
   handleRowValidation,
}) => {
   const {
      error,
      loading,
      data: { productOptions = {} } = {},
   } = useSubscription(SIMPLE_RECIPE_PRODUCT_OPTIONS, {
      variables: {
         type: {
            _eq: 'mealKit',
         },
      },
   })

   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      toast.error('Could not fetch meal kit products!')
      return <ErrorState message="Could not fetch meal kit products!" />
   }
   return (
      <ReactTabulator
         columns={columns}
         ref={mealKitTableRef}
         rowSelected={handleRowSelection}
         data={productOptions.nodes || []}
         rowDeselected={handleRowSelection}
         selectableCheck={handleRowValidation}
         options={{
            ...tableOptions,
            selectable: true,
            groupBy: 'product.name',
         }}
      />
   )
}

const ReadyToEats = ({
   columns,
   handleRowSelection,
   readyToEatTableRef,
   handleRowValidation,
}) => {
   const {
      error,
      loading,
      data: { productOptions = {} } = {},
   } = useSubscription(SIMPLE_RECIPE_PRODUCT_OPTIONS, {
      variables: {
         type: {
            _eq: 'readyToEat',
         },
      },
   })

   if (loading) return <InlineLoader />
   if (error)
      if (error) {
         logger(error)
         toast.error('Could not fetch ready to eat products!')
         return <ErrorState message="Could not fetch ready to eat products!" />
      }
   return (
      <ReactTabulator
         columns={columns}
         ref={readyToEatTableRef}
         rowSelected={handleRowSelection}
         data={productOptions.nodes || []}
         rowDeselected={handleRowSelection}
         selectableCheck={handleRowValidation}
         options={{
            ...tableOptions,
            selectable: true,
            groupBy: 'product.name',
         }}
      />
   )
}

const Inventory = ({ inventoryTableRef, handleRowSelection }) => {
   const { tooltip } = useTooltip()
   const {
      error,
      loading,
      data: { productOptions = {} } = {},
   } = useSubscription(INVENTORY_PRODUCT_OPTIONS, {
      variables: {
         type: { _eq: 'inventory' },
      },
   })

   const columns = [
      {
         title: 'Product',
         headerFilter: true,
         field: 'product.name',
         headerFilterPlaceholder: 'Search products...',
         headerTooltip: column => {
            const identifier = 'product_listing_column_name'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Label',
         headerFilter: true,
         field: 'label',
         headerFilterPlaceholder: 'Search...',
         headerTooltip: column => {
            const identifier = 'product_listing_column_label'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         width: 100,
         title: 'Quantity',
         field: 'quantity',
         hozAlign: 'right',
         headerHozAlign: 'right',
         headerTooltip: column => {
            const identifier = 'product_listing_column_quantity'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      toast.error('Could not fetch inventory products!')
      return <ErrorState message="Could not fetch inventory products!" />
   }
   return (
      <ReactTabulator
         columns={columns}
         ref={inventoryTableRef}
         selectableCheck={() => true}
         rowSelected={handleRowSelection}
         rowDeselected={handleRowSelection}
         data={productOptions.nodes || []}
         options={{
            ...tableOptions,
            selectable: true,
            groupBy: 'product.name',
         }}
      />
   )
}

const SaveTunnel = ({
   tunnels,
   closeTunnel,
   mealKitTableRef,
   inventoryTableRef,
   readyToEatTableRef,
}) => {
   const { state, dispatch } = useMenu()
   const [checked, setChecked] = React.useState(false)
   const [form, setForm] = React.useState({
      addOnLabel: '',
      addOnPrice: '',
      productCategory: '',
   })
   const { data: { productCategories = [] } = {} } = useQuery(
      PRODUCT_CATEGORIES
   )
   const [insertOccurenceProducts] = useMutation(INSERT_OCCURENCE_PRODUCTS, {
      onCompleted: () => {
         setForm({
            addOnLabel: '',
            addOnPrice: '',
            productCategory: '',
         })
         closeTunnel(1)
         dispatch({ type: 'CLEAR_STATE' })
         const mealKitRows =
            mealKitTableRef?.current?.table?.getSelectedRows() || []
         const readyToEatRows =
            readyToEatTableRef?.current?.table?.getSelectedRows() || []
         const inventoryRows =
            inventoryTableRef?.current?.table?.getSelectedRows() || []
         mealKitRows.forEach(row => row.deselect())
         readyToEatRows.forEach(row => row.deselect())
         inventoryRows.forEach(row => row.deselect())
         localStorage.removeItem('serving_size')
         toast.success('Successfully added the products to the subscription!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to add the products to the subscription!')
      },
   })

   const save = async () => {
      const plans = state.plans.selected
      const products = state.products.selected

      const objects = await Promise.all(
         plans.map(plan => {
            const result = products.map(product => ({
               isSingleSelect: !checked,
               addOnLabel: form.addOnLabel,
               productOptionId: product.option.id,
               addOnPrice: Number(form.addOnPrice),
               productCategory: form.productCategory,
               ...(state.plans.isPermanent
                  ? { subscriptionId: plan.subscription.id }
                  : { subscriptionOccurenceId: plan.occurence.id }),
            }))
            return result
         })
      )
      insertOccurenceProducts({
         variables: {
            objects: objects.flat(),
         },
      })
   }

   const handleChange = e => {
      const { name, value } = e.target
      setForm({ ...form, [name]: value })
   }

   const selectOption = option => {
      setForm({ ...form, productCategory: option.title })
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader
               title="Occurence Products"
               close={() => closeTunnel(1)}
               right={{
                  title: 'Save',
                  action: () => save(),
                  disabled: !form.productCategory,
               }}
               tooltip={<Tooltip identifier="listing_menu_tunnel_heading" />}
            />
            <Main>
               <Spacer size="24px" />
               <Form.Group>
                  <Flex container alignItems="center">
                     <Form.Label htmlFor="addOnLabel" title="addOnLabel">
                        Add On Label
                     </Form.Label>
                     <Tooltip identifier="listing_menu_tunnel_field_addonlabel" />
                  </Flex>
                  <Form.Text
                     id="addOnLabel"
                     name="addOnLabel"
                     onChange={handleChange}
                     value={form.addOnLabel}
                     placeholder="Enter the add on label"
                  />
               </Form.Group>
               <Spacer size="24px" />
               <Form.Group>
                  <Flex container alignItems="center">
                     <Form.Label htmlFor="addOnPrice" title="addOnPrice">
                        Add On Price
                     </Form.Label>
                     <Tooltip identifier="listing_menu_tunnel_field_addOnPrice" />
                  </Flex>
                  <Form.Text
                     id="addOnPrice"
                     name="addOnPrice"
                     onChange={handleChange}
                     value={form.addOnPrice}
                     placeholder="Enter the add on price"
                  />
               </Form.Group>
               <Spacer size="24px" />
               <Flex container alignItems="center">
                  <Form.Toggle
                     name="is_multi"
                     value={checked}
                     onChange={() => setChecked(!checked)}
                  >
                     Can be added multiple times in cart?
                  </Form.Toggle>
                  <Tooltip identifier="listing_menu_tunnel_field_is_multi" />
               </Flex>
               <Spacer size="24px" />
               <Dropdown
                  type="single"
                  searchedOption={() => {}}
                  options={productCategories}
                  selectedOption={selectOption}
                  placeholder="search for a product category"
               />
            </Main>
         </Tunnel>
      </Tunnels>
   )
}

const Wrapper = styled.main`
   padding: 0 16px;
`

const Main = styled.main`
   padding: 0 24px;
`
