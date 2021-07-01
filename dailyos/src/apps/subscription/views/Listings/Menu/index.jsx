import React from 'react'

import 'react-datepicker/dist/react-datepicker.css'

import { Wrapper } from './styled'
import { MenuProvider } from './state'
import DateSection from './DateSection'
import PlansSection from './PlansSection'
import ProductsSection from './ProductsSection'
import { useTabs } from '../../../../../shared/providers'

export const Menu = () => {
   const { tab, addTab } = useTabs()

   React.useEffect(() => {
      if (!tab) {
         localStorage.removeItem('serving_size')
         addTab('Menu', '/subscription/menu')
      }
   }, [tab, addTab])

   return (
      <MenuProvider>
         <Wrapper>
            <div>
               <DateSection />
               <PlansSection />
               <ProductsSection />
            </div>
         </Wrapper>
      </MenuProvider>
   )
}
