import { Router } from 'express'

import {
   handleOrderSachetCreation,
   handleBulkItemHistory,
   handleSachetItemHistory,
   handlePurchaseOrderCreateUpdate,
   handleBulkWorkOrderCreateUpdate,
   handleSachetWorkOrderCreateUpdate,
   handlePackagingHistory
} from './controllers'

const router = Router()

// test -> passes
router.post('/purchase-order-create-update', handlePurchaseOrderCreateUpdate)

// test -> passes
router.post('/bulk-item-history-created-updated', handleBulkItemHistory)

// test -> passes
router.post('/packaging-history', handlePackagingHistory)

// test -> passes
router.post('/bulk-work-order-created-updated', handleBulkWorkOrderCreateUpdate)

// test -> passes
router.post(
   '/sachet-work-order-created-updated',
   handleSachetWorkOrderCreateUpdate
)

// test -> passes
router.post('/sachet-item-history-created-updated', handleSachetItemHistory)

// test -> passes
router.post('/order-sachet-created-updated', handleOrderSachetCreation)

export default router
