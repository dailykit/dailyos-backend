import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

export const StyledTabs = styled.ul(
   () => css`
      display: flex;
      align-items: center;
      margin-top: 20px;
      border-bottom: 1px solid #ebf1f4;
   `
)

export const StyledTab = styled.li(
   ({ active }) => css`
      width: 97px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 4px 4px 0px 0px;
      cursor: pointer;
      border: ${active ? 'none' : '1px solid #ebf1f4'};
      border-bottom: none;
      height: ${active ? '32px' : '28px'};
      background: ${active ? '#F6F6F6' : 'transparent'};
      box-shadow: ${active
         ? '1px 1px 2px rgba(255, 255, 255, 0.3), -1px -1px 2px rgba(234, 234, 234, 0.5), inset -2px 2px 4px rgba(234, 234, 234, 0.2), inset 2px -2px 4px rgba(234, 234, 234, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(234, 234, 234, 0.9)'
         : 'none'};

      span {
         color: ${active ? '#367BF5' : '#919699'};
         display: inline-block;
         width: 80px;
         font-size: 12px;
         font-weight: 700;
         padding-left: 6px;
         white-space: nowrap;
         overflow: hidden;
      }
      button {
         border: none;
         display: flex;
         cursor: pointer;
         align-items: center;
         justify-content: center;
         padding: 4px;
         background: transparent;
      }
   `
)
export const HomeButton = styled(Link)`
   display: flex;
   align-items: center;
   justify-content: center;
   border: ${({ active }) => (active ? 'none' : '1px solid #ebf1f4')};
   border-bottom: none;
   border-radius: 4px 4px 0px 0px;
   width: 40px;
   height: ${({ active }) => (active ? '32px' : '28px')};
   background: ${({ active }) => (active ? '#F6F6F6' : 'transparent')};
   box-shadow: ${({ active }) =>
      active
         ? '1px 1px 2px rgba(255, 255, 255, 0.3), -1px -1px 2px rgba(234, 234, 234, 0.5), inset -2px 2px 4px rgba(234, 234, 234, 0.2), inset 2px -2px 4px rgba(234, 234, 234, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(234, 234, 234, 0.9)'
         : 'none'};
`
