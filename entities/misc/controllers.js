const fetch = require('node-fetch')

export const initiatePayment = async (req, res) => {
   try {
      const data = req.body.event.data.new

      if (data.status === 'PROCESS') {
         const body = {
            organizationId: process.env.ORGANIZATION_ID,
            cart: {
               id: data.id,
               amount: data.amount
            },
            customer: {
               paymentMethod: data.paymentMethodId,
               stripeCustomerId: data.stripeCustomerId
            }
         }
         await fetch(`${process.env.PAYMENTS_API}/api/initiate-payment`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
         })
      }

      res.status(200).json({
         success: true,
         message: 'Payment initiated!'
      })
   } catch (error) {
      console.log(error)
      res.status(400).json({
         success: false,
         message: error.message
      })
   }
}
