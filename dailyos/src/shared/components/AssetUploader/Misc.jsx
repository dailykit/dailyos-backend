import React from 'react'
import styled from 'styled-components'
import { Loader, IconButton, Text, Spacer } from '@dailykit/ui'

import useAssets from './useAssets'

const Misc = ({ onMiscSelect }) => {
   const { misc, status, error, remove } = useAssets('misc')

   if (status === 'LOADING') return <Loader />
   if (status === 'ERROR') return <div>{error}</div>
   return (
      <>
         <StyledList>
            {misc.map(node => (
               <StyledListItem
                  key={node.key}
                  title={node.metadata.title}
                  onClick={() => onMiscSelect(node)}
               >
                  <StyledTag>
                     <p>{node.name.slice(node.name.lastIndexOf('.') + 1)}</p>
                  </StyledTag>
                  <Text as="p">{node.name}</Text>
                  <span>
                     <IconButton
                        size="sm"
                        type="solid"
                        onClick={e => e.stopPropagation() || remove(node.key)}
                     >
                        <Trash />
                     </IconButton>
                  </span>
               </StyledListItem>
            ))}
         </StyledList>
         <Spacer size="14px" />
      </>
   )
}
export default Misc

const StyledList = styled.ul`
   height: 100%;
   display: grid;
   grid-gap: 8px;
   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
   li {
      height: 120px;
      list-style: none;
      text-align: center;
   }
`

const StyledTag = styled.section`
   display: flex;
   height: inherit;
   overflow: hidden;
   border-radius: 3px;
   align-items: center;
   justify-content: center;
   border: 1px solid #e3e3e3;
   p {
      color: #fff;
      padding: 1px 4px;
      border-radius: 2px;
      background: #39d560;
   }
`

const StyledListItem = styled.li`
   position: relative;
   span {
      top: 6px;
      right: 6px;
      display: none;
      position: absolute;
   }
   :hover span {
      display: block;
   }
`

const Trash = ({ size = 16, color = '#ffffff' }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
   </svg>
)
