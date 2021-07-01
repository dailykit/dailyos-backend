import React from 'react'
import { INSIGHT } from './query'
import { useQuery } from '@apollo/react-hooks'
import Insight from '../Insight'
import { toast } from 'react-toastify'
import { logger } from '../../utils'

export default function InsightDashboard({
   appTitle,
   moduleTitle,
   variables,
   includeChart,
   includeTable,
   where,
   limit,
   order,
}) {
   const { data: { insights_insights: insights = [] } = {} } = useQuery(
      INSIGHT,
      {
         variables: {
            options: {
               isActive: { _eq: true },
               apps_modules: {
                  appTitle: { _eq: appTitle },
                  moduleTitle: { _eq: moduleTitle },
               },
            },
         },
         onError: error => {
            toast.error('Something went wrong with insight dashboard query')
            logger(error)
         },
      }
   )
   return (
      <div>
         {insights.map(insight => {
            return (
               <Insight
                  key={insight.identifier}
                  identifier={insight.identifier}
                  variables={variables}
                  includeChart={includeChart}
                  includeTable={includeTable}
                  where={where}
                  limit={limit}
                  order={order}
               />
            )
         })}
      </div>
   )
}
