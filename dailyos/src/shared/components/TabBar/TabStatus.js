import React from 'react'
import { useTabs } from '../../providers'
import Styles from './styled'

const TabStatus = () => {
   const { tabs, closeAllTabs } = useTabs()
   return (
      <Styles.TabStatus>
         <span>{tabs.length} opened tabs</span>
         <button onClick={() => closeAllTabs()}>Close all Tabs</button>
      </Styles.TabStatus>
   )
}

export default TabStatus
