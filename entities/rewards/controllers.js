import { client } from '../../lib/graphql'
import { REWARDS, CUSTOMER } from './graphql/queries'
import {
   CREATE_LOYALTY_POINTS_TRANSACTION,
   CREATE_WALLET_TRANSACTION,
   CREATE_COUPON
} from './graphql/mutations'

export const processRewards = async (req, res, next) => {
   try {
      const { rewardIds, keycloakId } = req.body.input
      const rewardsResponse = await client.request(REWARDS, {
         rewardIds
      })
      const customerResponse = await client.request(CUSTOMER, {
         keycloakId
      })
      for (const reward of rewardsResponse.rewards) {
         if (reward.loyaltyPointCredit) {
            await client.request(CREATE_LOYALTY_POINTS_TRANSACTION, {
               object: {
                  type: 'CREDIT',
                  points: reward.loyaltyPointCredit,
                  loyaltyPointId: customerResponse.customer.loyaltyPoint.id
               }
            })
         }
         if (reward.walletAmountCredit) {
            await client.request(CREATE_WALLET_TRANSACTION, {
               object: {
                  type: 'CREDIT',
                  amount: reward.walletAmountCredit,
                  walletId: customerResponse.customer.wallet.id
               }
            })
         }
         if (reward.voucher) {
            await client.request(CREATE_COUPON, {
               object: {
                  code: reward.voucher,
                  condition: {},
                  keycloakId
               }
            })
         }
         if (!reward.rewardsType.isRewardsMulti) {
            break
         }
      }
      res.json({ success: true, message: 'Rewards given!' })
   } catch (err) {
      next(err)
   }
}
