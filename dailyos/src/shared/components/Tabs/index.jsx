import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTabs } from '../../providers'
import { useWindowSize } from '../../hooks'
import { StyledTabs, StyledTab, HomeButton } from './styled'
import { CloseIcon, DoubleArrowRightIcon, HomeIcon } from '../../assets/icons'
const Tabs = ({ open }) => {
   const { pathname } = useLocation()
   const view = useWindowSize()
   const { tabs } = useTabs()
   const [firstIndex, setFirstIndex] = useState(0)
   const [lastIndex, setLastIndex] = useState(8)
   let numTabsToShow = Math.floor(
      open ? (view.width - 300) / 100 - 1 : (view.width - 48) / 100 - 1
   )
   useEffect(() => {
      if (view) setLastIndex(numTabsToShow)
   }, [view.width, open])
   return (
      <StyledTabs>
         <HomeButton active={pathname === '/'} to="/">
            <HomeIcon color={pathname === '/' ? '#367BF5' : '#919699'} />
         </HomeButton>
         {tabs.slice(firstIndex, lastIndex).map((tab, index) => (
            <Tab tab={tab} key={tab.path} index={index} />
         ))}

         {lastIndex + 3 <= tabs.length && (
            <button
               onClick={() => {
                  if (lastIndex + 3 <= tabs.length) {
                     setFirstIndex(firstIndex + 3)
                     setLastIndex(lastIndex + 3)
                  }
               }}
            >
               <DoubleArrowRightIcon />
            </button>
         )}
      </StyledTabs>
   )
}

export default Tabs

const Tab = ({ index, tab, ...props }) => {
   const location = useLocation()
   const { switchTab, removeTab } = useTabs()
   const active = tab.path === location.pathname
   return (
      <StyledTab
         key={tab.path}
         onClick={() => switchTab(tab.path)}
         active={active}
         {...props}
      >
         <span title={tab.title}>{tab.title}</span>
         <button
            type="button"
            title="Close Tab"
            onClick={e => {
               e.stopPropagation()
               removeTab({ tab, index })
            }}
         >
            <CloseIcon color={active ? '#367BF5' : '#919699'} size="12" />
         </button>
      </StyledTab>
   )
}
