import { client } from '../../lib/graphql'
import { REWARDS } from './graphql/queries'

export const handleRewards = async (req, res, next) => {
   try {
      const { rewardIds, keycloakId } = req.body
      const response = await client.request(REWARDS, {
         rewardIds
      })
      for (const reward of response?.rewards || []) {
         if (reward.loyaltyPointCredit) {
            // mutation for loyalty points
         }
         if (reward.walletAmountCredit) {
            // mutation for wallet amount
         }
      }
      res.json({ success: true, message: 'Rewards given!' })
   } catch (err) {
      next(err)
   }
}
