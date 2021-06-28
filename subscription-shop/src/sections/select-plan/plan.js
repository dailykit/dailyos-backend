import React from 'react'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'
import { useToasts } from 'react-toast-notifications'

import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { Loader } from '../../components'
import { isClient, formatCurrency } from '../../utils'

export const Plan = ({ cameFrom = '', plan, handlePlanClick }) => {
   const router = useRouter()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { configOf } = useConfig('conventions')
   const [defaultItemCount, setDefaultItemCount] = React.useState(null)
   const [defaultServing, setDefaultServing] = React.useState(null)

   React.useEffect(() => {
      if (
         plan.defaultServingId &&
         plan.defaultServing?.isDemo === user?.isDemo
      ) {
         setDefaultServing(plan.defaultServing)
      }
      setDefaultServing(plan.servings[0])
   }, [plan])

   React.useEffect(() => {
      if (defaultServing) {
         if (
            defaultServing.defaultItemCountId &&
            defaultServing.defaultItemCount?.isDemo === user?.isDemo
         ) {
            return setDefaultItemCount(defaultServing.defaultItemCount)
         }
         setDefaultItemCount(defaultServing.itemCounts[0])
      }
   }, [defaultServing])

   const selectPlan = () => {
      if (handlePlanClick) {
         return handlePlanClick(defaultItemCount.id)
      }
      if (isClient) {
         window.localStorage.setItem('plan', defaultItemCount.id)
      }
      addToast('Successfully selected a plan.', {
         appearance: 'success',
      })
      router.push(
         `/get-started/${
            cameFrom === 'our-plans' ? 'register' : 'select-delivery'
         }`
      )
   }

   const config = configOf('primary-labels')
   const colorConfig = configOf('theme-color', 'Visual')
   const yieldLabel = {
      singular: config?.yieldLabel?.singular || 'serving',
      plural: config?.yieldLabel?.singular || 'servings',
   }
   const itemCountLabel = {
      singular: config?.itemLabel?.singular || 'recipe',
      plural: config?.itemLabel?.singular || 'recipes',
   }
   const theme = configOf('theme-color', 'Visual')
   if (!defaultServing) return <Loader inline />
   return (
      <li css={tw`border rounded-lg p-8`}>
         <Title theme={theme}>{plan.title}</Title>
         <section css={tw`h-12 mb-4 flex items-center justify-between`}>
            {plan.servings.length === 1 ? (
               <span
                  css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
               >
                  {plan.servings[0].size}{' '}
                  {plan.servings[0].size > 1
                     ? yieldLabel.singular
                     : yieldLabel.plural}
               </span>
            ) : (
               <>
                  <span
                     css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
                  >
                     No. of {yieldLabel.plural}
                  </span>
                  <CountList>
                     {plan.servings.map(serving => (
                        <CountListItem
                           key={serving.id}
                           onClick={() => setDefaultServing(serving)}
                           className={`${
                              serving.id === defaultServing?.id ? 'active' : ''
                           }`}
                        >
                           {serving.size}
                        </CountListItem>
                     ))}
                  </CountList>
               </>
            )}
         </section>
         <section css={tw`h-12 mb-4 flex items-center justify-between mt-3`}>
            {defaultServing.itemCounts.length === 1 ? (
               <span
                  css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
               >
                  {defaultServing.itemCounts[0].count}{' '}
                  {defaultServing.itemCounts[0].count === 1
                     ? itemCountLabel.singular
                     : itemCountLabel.plural}{' '}
                  per week
               </span>
            ) : (
               <>
                  <span
                     css={tw`uppercase tracking-wider text-gray-600 text-sm font-medium`}
                  >
                     {itemCountLabel.singular} per week
                  </span>
                  <CountList>
                     {defaultServing?.itemCounts.map(item => (
                        <CountListItem
                           key={item.id}
                           onClick={() => setDefaultItemCount(item)}
                           className={`${
                              item.id === defaultItemCount?.id ? 'active' : ''
                           }`}
                        >
                           {item.count}
                        </CountListItem>
                     ))}
                  </CountList>
               </>
            )}
         </section>
         <hr />
         <div tw="mb-6 flex items-center">
            <section tw="h-full flex-1">
               <Price theme={theme}>
                  {formatCurrency(
                     Number.parseFloat(
                        (defaultItemCount?.price || 1) /
                           ((defaultItemCount?.count || 1) *
                              (defaultServing?.size || 1))
                     ).toFixed(2)
                  )}{' '}
               </Price>
               <span tw="text-gray-600">
                  / {yieldLabel.singular} x{' '}
                  {(defaultServing.size || 1) * (defaultItemCount?.count || 1)}
               </span>
            </section>
            <section tw="h-full flex-1 flex flex-col text-right border-l py-1">
               <TotalPrice theme={theme}>
                  {formatCurrency(defaultItemCount?.price)}
               </TotalPrice>
               <span tw="text-gray-600 italic text-sm">
                  {defaultItemCount?.isTaxIncluded
                     ? 'Tax Inclusive'
                     : 'Tax Exclusive'}
               </span>
               <span tw="text-gray-600">Weekly total</span>
            </section>
         </div>
         <Button bg={colorConfig?.accent} onClick={() => selectPlan()}>
            Select
         </Button>
      </li>
   )
}

const Title = styled.h2(
   ({ theme }) => css`
      ${tw`mb-5 text-2xl font-medium tracking-wide text-green-600`}
      ${theme?.accent && `color: ${theme?.accent}`}
   `
)

const Price = styled.span(
   ({ theme }) => css`
      ${tw`font-medium text-green-600`}
      ${theme?.accent && `color: ${theme?.accent}`}
   `
)

const TotalPrice = styled.span(
   ({ theme }) => css`
      ${tw`text-2xl font-medium text-green-600`}
      ${theme?.accent && `color: ${theme?.accent}`}
   `
)

const CountList = styled.ul`
   border-radius: 4px;
   ${tw`
      p-1
      border
      flex items-center justify-between 
   `}
`

const CountListItem = styled.li`
   border-radius: 2px;
   &.active {
      ${tw`text-white bg-green-600`}
   }
   ${tw`
         h-12 w-12 
         cursor-pointer
         flex items-center justify-center 
         hover:text-white hover:bg-green-600 hover:rounded 
      `}
`

const Button = styled.button(
   ({ bg }) => css`
      ${tw`w-full h-12 bg-blue-400 uppercase tracking-wider font-medium text-white rounded-full`};
      ${bg && `background-color: ${bg};`}
   `
)
