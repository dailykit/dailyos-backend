export const currencyFmt = (amount = 0) =>
   new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: window._env_.REACT_APP_CURRENCY,
   }).format(amount)
