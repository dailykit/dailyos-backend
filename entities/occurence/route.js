import express from 'express'
import { create, createScheduledEvent } from './controllers'

const router = express.Router()

router.route('/create').post(create)
router.route('/schedule/create').post(createScheduledEvent)

export default router
