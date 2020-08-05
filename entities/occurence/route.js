import express from 'express'
import { create, manageOccurence, createScheduledEvent } from './controllers'

const router = express.Router()

router.route('/create').post(create)
router.route('/manage').post(manageOccurence)
router.route('/schedule/create').post(createScheduledEvent)

export default router
