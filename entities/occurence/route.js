import express from 'express'
import {
   create,
   manageOccurence,
   createScheduledEvent,
   reminderMail
} from './controllers'

const router = express.Router()

router.route('/create').post(create)
router.route('/manage').post(manageOccurence)
router.route('/schedule/create').post(createScheduledEvent)
router.route('/reminder').post(reminderMail)

export default router
