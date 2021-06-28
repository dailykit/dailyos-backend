import { isClient } from './isClient'

export const formatCurrency = (input = 0) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: isClient ? window._env_.CURRENCY : 'USD',
   }).format(input)
}
