import express from 'express'
import { take, handleStatusChange } from './controllers'

const router = express.Router()

router.route('/take').post(take)
router.route('/status').post(handleStatusChange)

export default router
