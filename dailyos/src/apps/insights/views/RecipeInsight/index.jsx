import React from 'react'
import { Flex } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'

import { useTabs } from '../../../../shared/providers'
import { Insight, InlineLoader } from '../../../../shared/components'

import { INSIGHTS } from '../../graphql'

const ReferralPlansListing = () => {
   const { tab, addTab } = useTabs()
   const {
      data: { insights_insights: insights = [] } = {},
      loading,
   } = useQuery(INSIGHTS, {
      onError: error => {
         console.log(error)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab('Recipe Insights', '/insights/recipe')
      }
   }, [tab, addTab])

   if (loading) return <InlineLoader />

   return (
      <Flex
         padding="16px"
         overflowY="auto"
         height="calc(100vh - 40px)"
         style={{ background: '#ececec' }}
      >
         {insights.map(insight => {
            return (
               <Flex key={insight.identifier}>
                  <Insight
                     identifier={insight.identifier}
                     includeChart
                     // where={{ amountPaid: { _lte: 2 } }}
                     // limit={2}
                     // order={{ amountPaid: 'desc' }}
                     variables={{ amountVar: 90 }}
                  />
               </Flex>
            )
         })}
      </Flex>
   )
}

export default ReferralPlansListing
