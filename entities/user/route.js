import { Router } from 'express'

import { manage } from './controllers'

const router = Router()

router.post('/', manage)

export default router
