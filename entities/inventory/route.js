import { Router } from 'express'

import {
   handleOrderSachetCreation,
   handleBulkItemHistory,
   handleSachetItemHistory,
   handlePurchaseOrderCreateUpdate,
   handleBulkWorkOrderCreateUpdate,
   handleSachetWorkOrderCreateUpdate,
} from './controllers'

const router = Router()

router.post('/order-sachet-created-updated', handleOrderSachetCreation)
router.post('/bulk-item-history-created-updated', handleBulkItemHistory)
router.post('/sachet-item-history-created-updated', handleSachetItemHistory)
router.post('/purchase-order-create-update', handlePurchaseOrderCreateUpdate)
router.post('/bulk-work-order-created-updated', handleBulkWorkOrderCreateUpdate)
router.post(
   'sachet-work-order-created-updated',
   handleSachetWorkOrderCreateUpdate
)

export default router
