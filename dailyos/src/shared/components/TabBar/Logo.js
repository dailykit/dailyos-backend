import React from 'react'
import Styles from './styled'

const Logo = () => {
   return (
      <Styles.Logo>
         <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <circle
               cx="20"
               cy="20"
               r="19.6"
               fill="white"
               stroke="#8AC03B"
               strokeWidth="0.8"
            />
            <path
               fillRule="evenodd"
               clipRule="evenodd"
               d="M20.9436 18.8775L29.4058 12.4741L30.8608 12.5096L30.171 13.7122L21.2007 19.3938L20.9436 18.8775ZM20.9603 20.7394L25.9734 25.662L27.2477 25.8512L26.8745 24.7063L21.2626 20.328L20.9603 20.7394Z"
               fill="#8AC03B"
            />
            <path
               d="M20 34.7059C28.1218 34.7059 34.7059 28.1219 34.7059 20C34.7059 11.8782 28.1218 5.29416 20 5.29416"
               stroke="#8AC03B"
               strokeWidth="1.5"
               strokeLinecap="round"
            />
            <circle cx="20.2936" cy="19.7059" r="1.47059" fill="#8AC03B" />
         </svg>
         <span>DailyOS</span>
      </Styles.Logo>
   )
}

export default Logo
