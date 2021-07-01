import styled from 'styled-components'

const Styles = {
   Header: styled.header`
      display: flex;
      flex-direction: column;
      justify-content: center;
   `,
   Logo: styled.span`
      display: flex;
      align-items: center;
      > span {
         margin-left: 6px;
         color: #8ac03b;
         font-weight: 500;
         font-size: 28px;
         line-height: 24px;
      }
   `,
   TabStatus: styled.span`
      display: flex;
      align-items: center;
      margin-left: 34px;
      > span {
         height: 24px;
         font-size: 14px;
         color: #919699;
      }
      > button {
         border: none;
         border-radius: 4px;
         margin-left: 16px;
         height: 28px;
         color: #367bf5;
         font-weight: 700;
         font-size: 14px;
         line-height: 24px;
         padding: 2px 16px;
         background-color: #ebf1f4;
      }
   `,
}

export default Styles
