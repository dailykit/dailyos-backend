import React from 'react'
import { useLazyQuery } from '@apollo/react-hooks'
import {
   Filler,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { InlineLoader, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { BULK_ITEMS, SACHET_ITEMS } from '../../../../../graphql'
import { TunnelBody } from '../styled'

const EditItemTunnel = ({ closeTunnel }) => {
   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )
   const [items, setItems] = React.useState([])
   const [search, setSearch] = React.useState('')

   const [list, current, selectOption] = useSingleList(items)

   // Queries for fetching items
   const [fetchBulkItems, { loading: bulkItemsLoading }] = useLazyQuery(
      BULK_ITEMS,
      {
         onCompleted: data => {
            const updatedItems = data.bulkItems.map(item => {
               return {
                  id: item.id,
                  title: `${item.supplierItem.name} ${item.processingName}`,
               }
            })
            setItems([...updatedItems])
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      }
   )
   const [fetchSupplierItems, { loading: supplierItemsLoading }] = useLazyQuery(
      SACHET_ITEMS,
      {
         onCompleted: data => {
            const updatedItems = data.sachetItems.map(item => {
               return {
                  id: item.id,
                  title: `${item.bulkItem.supplierItem.name} ${item.bulkItem.processingName} - ${item.unitSize} ${item.unit}`,
               }
            })
            setItems([...updatedItems])
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   React.useEffect(() => {
      if (ingredientState.editMode.type === 'realTime') {
         fetchBulkItems()
      } else {
         fetchSupplierItems()
      }
   }, [])

   React.useEffect(() => {
      if (Object.keys(current).length) {
         ingredientDispatch({
            type: 'EDIT_MODE',
            payload: {
               ...ingredientState.editMode,
               bulkItem:
                  ingredientState.editMode.type === 'realTime' ? current : null,
               sachetItem:
                  ingredientState.editMode.type === 'plannedLot'
                     ? current
                     : null,
            },
         })
         closeTunnel(3)
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title="Select Item"
            close={() => closeTunnel(3)}
            tooltip={<Tooltip identifier="sachet_item_tunnel" />}
         />
         <TunnelBody>
            {bulkItemsLoading || supplierItemsLoading ? (
               <InlineLoader />
            ) : (
               <>
                  {list.length ? (
                     <List>
                        {Object.keys(current).length > 0 ? (
                           <ListItem type="SSL1" title={current.title} />
                        ) : (
                           <ListSearch
                              onChange={value => setSearch(value)}
                              placeholder="type what you’re looking for..."
                           />
                        )}
                        <ListHeader
                           type="SSL1"
                           label={
                              ingredientState.editMode.type === 'realTime'
                                 ? 'Bulk Items'
                                 : 'Sachet Items'
                           }
                        />
                        <ListOptions>
                           {list
                              .filter(option =>
                                 option.title.toLowerCase().includes(search)
                              )
                              .map(option => (
                                 <ListItem
                                    type="SSL1"
                                    key={option.id}
                                    title={option.title}
                                    isActive={option.id === current.id}
                                    onClick={() =>
                                       selectOption('id', option.id)
                                    }
                                 />
                              ))}
                        </ListOptions>
                     </List>
                  ) : (
                     <Filler height="500px" message="No Items found!" />
                  )}
               </>
            )}
         </TunnelBody>
      </>
   )
}

export default EditItemTunnel
