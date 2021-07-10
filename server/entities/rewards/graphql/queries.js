export const REWARDS = `
    query Rewards($rewardIds : [Int!]!) {
        rewards(where: {id: {_in: $rewardIds}}, order_by: {priority: desc}) {
            id
            voucher
            priority
            loyaltyPointCredit
            loyaltyPointDebit
            walletAmountCredit
            rewardsType {
              isRewardsMulti
            }
        }
    }
`

export const CUSTOMER = `
    query Customer($keycloakId : String!) {
        customer(keycloakId: $keycloakId){
            id
            wallet {
                id
                amount
            }
            loyaltyPoint {
                id
                points
            }
        }
    }
`
