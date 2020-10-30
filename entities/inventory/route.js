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
router.post('/purchase-order-upsert', handlePurchaseOrderCreateUpdate)

// test -> passes
router.post('/bulk-item-history-upsert', handleBulkItemHistory)

// test -> passes
router.post('/packaging-hstory-upsert', handlePackagingHistory)

// test -> passes
router.post('/bulk-work-order-upsert', handleBulkWorkOrderCreateUpdate)

// test -> passes
router.post('/sachet-work-order-upsert', handleSachetWorkOrderCreateUpdate)

// test -> passes
router.post('/sachet-item-history-upsert', handleSachetItemHistory)

// test -> passes
router.post('/order-sachet-upsert', handleOrderSachetCreation)

export default router
