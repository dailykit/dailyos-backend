import React from 'react'
import Keycloak from 'keycloak-js'

import App from './App'
import { TabProvider } from './context'
import {
   AuthProvider,
   AccessProvider,
   TooltipProvider,
} from '../../shared/providers'

const keycloak = new Keycloak({
   realm: window._env_.REACT_APP_KEYCLOAK_REALM,
   url: window._env_.REACT_APP_KEYCLOAK_URL,
   clientId: 'content',
   'ssl-required': 'none',
   'public-client': true,
   'bearer-only': false,
   'verify-token-audience': true,
   'use-resource-role-mappings': true,
   'confidential-port': 0,
})

const ContentApp = () => (
   <TooltipProvider app="Content App">
      <TabProvider>
         <App />
      </TabProvider>
   </TooltipProvider>
)

export default ContentApp
