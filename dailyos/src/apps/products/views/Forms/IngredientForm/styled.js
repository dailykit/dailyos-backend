import styled from 'styled-components'

export const HeaderWrapper = styled.div`
   display: flex;
   width: 100%;
   align-items: center;
   padding: 16px 32px;
   justify-content: space-between;
   @media screen and (max-width: 767px) {
      flex-direction: column;
   }
`
export const InputTextWrapper = styled.div`
   width: 100%;
   display: flex;
   align-items: center;

   @media screen and (max-width: 767px) {
      flex-direction: column;
      section {
         width: calc(100vw - 64px);
      }
   }
`
