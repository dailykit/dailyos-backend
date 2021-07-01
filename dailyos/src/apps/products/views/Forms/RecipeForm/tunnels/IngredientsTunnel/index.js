import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
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
import { RecipeContext } from '../../../../../context/recipe'
import { CREATE_INGREDIENT, S_INGREDIENTS } from '../../../../../graphql'
import { TunnelBody } from '../styled'

const IngredientsTunnel = ({ closeTunnel, openTunnel }) => {
   const { recipeDispatch } = React.useContext(RecipeContext)

   // State for search input
   const [search, setSearch] = React.useState('')
   const [ingredients, setIngredients] = React.useState([])
   const [list, current, selectOption] = useSingleList(ingredients)

   // Query
   const { loading } = useSubscription(S_INGREDIENTS, {
      onSubscriptionData: data => {
         const updatedIngredients = data.subscriptionData.data.ingredients.map(
            ({ id, name }) => ({ id, title: name })
         )
         setIngredients(updatedIngredients)
      },
   })

   const [createIngredient] = useMutation(CREATE_INGREDIENT, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const select = option => {
      console.log(option)
      selectOption('id', option.id)
      recipeDispatch({
         type: 'ADD_INGREDIENT',
         payload: option,
      })
      openTunnel(2)
   }

   const quickCreateIngredient = () => {
      const ingredientName = search.slice(0, 1).toUpperCase() + search.slice(1)
      createIngredient({
         variables: {
            name: ingredientName,
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Select Ingredient"
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="ingredients_tunnel" />}
         />
         <TunnelBody>
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <List>
                     {Object.keys(current).length > 0 ? (
                        <ListItem type="SSL1" title={current.title} />
                     ) : (
                        <ListSearch
                           onChange={value => setSearch(value)}
                           placeholder="type what you’re looking for..."
                        />
                     )}
                     <ListHeader type="SSL1" label="Ingredients" />
                     <ListOptions
                        search={search}
                        handleOnCreate={quickCreateIngredient}
                     >
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
                                 onClick={() => select(option)}
                              />
                           ))}
                     </ListOptions>
                  </List>
               </>
            )}
         </TunnelBody>
      </>
   )
}

export default IngredientsTunnel
