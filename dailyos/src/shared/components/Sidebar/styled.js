import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Styles = {
   Sidebar: styled.aside`
      color: #202020;
      display: flex;
      flex-direction: column;
      margin-top: 4px;
      height: calc(100vh - 4px);
      border-radius: 0px 13px 13px 0px;
      background: #fff;
      box-shadow: 5px -5px 10px rgba(219, 219, 219, 0.2),
         -5px 5px 10px rgba(219, 219, 219, 0.2),
         5px 5px 10px rgba(255, 255, 255, 0.9),
         -5px -5px 13px rgba(219, 219, 219, 0.9),
         inset -1px -1px 2px rgba(255, 255, 255, 0.3),
         inset 1px 1px 2px rgba(219, 219, 219, 0.5);
      overflow-y: auto;
      ::-webkit-scrollbar {
         width: 6px;
      }
      ::-webkit-scrollbar-thumb {
         background-color: rgba(196, 196, 196, 0.9);
         border-radius: 4px;
      }
   `,
   AppTitle: styled.h4`
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      color: #202020;
      letter-spacing: 0.44px;
      line-height: 24px;
      margin-left: 16px;
   `,
   Heading: styled.h3`
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      color: #367bf5;
   `,
   Pages: styled.ul`
      > :first-child {
         margin: 0px 0px 10px 68px;
      }
   `,
   PageItem: styled.li`
      display: flex;
      align-items: center;
      margin: 10px 0px 0px 68px;
      color: #202020;
      font-weight: 500;
      font-size: 12px;
      line-height: 14px;
      cursor: pointer;
      > span {
         display: block;
         margin-left: 6px;
      }
   `,
   Apps: styled.ul``,

   AppItem: styled(Link)`
      margin: 10px 0px 10px 12px;
      text-decoration: none;
   `,
   CreateNewItems: styled.div`
      display: flex;
      flex-direction: column;
      padding-bottom: 18px;
   `,
   Menu: styled.button`
      margin-top: 4px;
      width: 48px;
      height: 48px;
      border: none;
      cursor: pointer;
      background-color: #fff;
      :hover,
      :focus {
         background: #fff;
      }
      border-radius: 0px 24px 24px 0px;
      box-shadow: 5px -5px 10px rgba(219, 219, 219, 0.2),
         -5px 5px 10px rgba(219, 219, 219, 0.2),
         5px 5px 10px rgba(255, 255, 255, 0.9),
         -5px -5px 13px rgba(219, 219, 219, 0.9),
         inset -1px -1px 2px rgba(255, 255, 255, 0.3),
         inset 1px 1px 2px rgba(219, 219, 219, 0.5);
   `,
   AppIcon: styled.img`
      height: 32px;
      width: 32px;
      display: inline-block;
   `,
   Logout: styled.button`
      padding: 8px 0px;
      color: #202020;
      font-weight: 500;
      font-size: 16px;
      margin: 16px;
      background-color: #fff;
      border-radius: 4px;
      border: 1px solid #e5e5e5;
   `,
}

export default Styles
