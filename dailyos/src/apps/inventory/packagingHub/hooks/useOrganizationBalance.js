import { useEffect, useState } from 'react'

const PAYMENTS_URL = window._env_.REACT_APP_DAILYKEY_URL

export default function useOrganizationBalance(accountId) {
   const [data, setData] = useState()
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState()

   useEffect(() => {
      const abortController = new window.AbortController()

      if (accountId) {
         const url = `${PAYMENTS_URL}/api/balance`

         fetch(`${url}?accountId=${accountId}`, {
            signal: abortController.signal,
         })
            .then(x => x.json())
            .then(res => {
               setLoading(false)
               setData(res.data)
            })
            .catch(error => setError(error))
      }

      return function cancelFetch() {
         abortController.abort()
      }
   }, [accountId])

   return { loading, data, error }
}
