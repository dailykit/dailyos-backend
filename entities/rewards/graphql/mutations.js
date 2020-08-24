export const CREATE_LOYALTY_POINTS_TRANSACTION = `
    mutation CreateLoyaltyPointsTransaction($object: crm_loyaltyPointTransaction_insert_input!) {
        createLoyaltyPointsTransaction(object: $object) {
            id
        }
    }
`

export const CREATE_WALLET_TRANSACTION = `
    mutation CreateWalletTransaction($object: crm_walletTransaction_insert_input!) {
        createWalletTransaction(object: $object) {
            id
        }
    }
`
