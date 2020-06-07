import express from 'express'
import { manage, trigger } from './controllers'

const router = express.Router()

router.route('/manage').post(manage)
router.route('/trigger').post(trigger)

export default router
