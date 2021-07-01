import React from 'react'
import styled from 'styled-components'

import { Header, Categories, CartButton } from './components'

export default function PackaginHub() {
   return (
      <Wrapper>
         <CartButton />
         <Header />
         <Categories />
      </Wrapper>
   )
}

const Wrapper = styled.div`
   position: relative;
`
