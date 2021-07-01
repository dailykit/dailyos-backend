import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { useTranslation } from 'react-i18next'

import { useTabs } from '../../../../shared/providers'
import { StyledHome, StyledCardList } from './styled'

import { RECIPES_COUNT, PRODUCTS, INGREDIENTS_COUNT } from '../../graphql'

const address = 'apps.products.views.home.'

const Home = () => {
   const { addTab } = useTabs()
   const { t } = useTranslation()

   const { data: ingredientsData } = useSubscription(INGREDIENTS_COUNT)
   const { data: recipeData } = useSubscription(RECIPES_COUNT)
   const { data: productsData } = useSubscription(PRODUCTS.COUNT)

   return (
      <StyledHome>
         <h1>{t(address.concat('products app'))}</h1>
         <StyledCardList>
            <DashboardTile
               title={t(address.concat('products'))}
               count={productsData?.productsAggregate.aggregate.count || '...'}
               conf="All available"
               onClick={() => addTab('Products', '/products/products')}
            />
            <DashboardTile
               title={t(address.concat('recipes'))}
               count={
                  recipeData?.simpleRecipesAggregate.aggregate.count || '...'
               }
               conf="All available"
               onClick={() => addTab('Recipes', '/products/recipes')}
            />
            <DashboardTile
               title={t(address.concat('ingredients'))}
               count={
                  ingredientsData?.ingredientsAggregate.aggregate.count || '...'
               }
               conf="All available"
               onClick={() => addTab('Ingredients', '/products/ingredients')}
            />
         </StyledCardList>
      </StyledHome>
   )
}

export default Home
