import { useMutation } from '@apollo/react-hooks'
import { ComboButton, Flex, RadioGroup, Text, TextButton } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Tooltip } from '../../../../../shared/components/Tooltip'
import { logger, randomSuffix } from '../../../../../shared/utils/index'
import { AddIcon } from '../../../assets/icons'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { useTabs } from '../../../../../shared/providers'
import { CREATE_ITEM } from '../../../graphql'
import { StyledTableActions, StyledTableHeader, StyledWrapper } from '../styled'
import BulkItemsListings from './bulkItemsListing'
import SupplierItemsListings from './supplierItemListing'

export default function ItemListing() {
   const { addTab } = useTabs()
   const [view, setView] = useState('supplierItems')

   const [createItem] = useMutation(CREATE_ITEM, {
      onCompleted: input => {
         const itemData = input.createSupplierItem.returning[0]
         addTab(itemData.name, `/inventory/items/${itemData.id}`)
         toast.success('Supplier Item Added!')
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })

   const options = [
      { id: 'supplierItems', title: 'Supplier Items' },
      { id: 'bulkItems', title: 'Bulk Items' },
   ]

   const createItemHandler = () => {
      // create item in DB
      const name = `item-${randomSuffix()}`
      createItem({
         variables: {
            object: {
               name,
            },
         },
      })
   }

   const tableRef = React.useRef()

   const renderTables = view => {
      switch (view) {
         case 'supplierItems':
            return <SupplierItemsListings tableRef={tableRef} />

         case 'bulkItems':
            return <BulkItemsListings tableRef={tableRef} />

         default:
            break
      }
   }

   return (
      <StyledWrapper>
         <StyledTableHeader>
            <Flex container alignItems="center">
               <Text as="h2">Supplier Items</Text>
               <Tooltip identifier="items_listings_header_title" />
            </Flex>
            <StyledTableActions>
               <TextButton
                  type="outline"
                  onClick={() => tableRef.current?.table?.clearHeaderFilter()}
               >
                  Clear Filters
               </TextButton>
               <ComboButton type="solid" onClick={createItemHandler}>
                  <AddIcon color="#fff" size={24} /> Add Item
               </ComboButton>
            </StyledTableActions>
         </StyledTableHeader>
         <RadioGroup
            options={options}
            active="supplierItems"
            onChange={option => setView(option.id)}
         />

         {renderTables(view)}
      </StyledWrapper>
   )
}
