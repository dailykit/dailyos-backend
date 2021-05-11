import express from 'express'
import {
   create,
   autoSelect,
   manageOccurence,
   createScheduledEvent,
   reminderMail
} from './controllers'

const router = express.Router()

router.route('/create').post(create)
router.route('/manage').post(manageOccurence)
router.route('/schedule/create').post(createScheduledEvent)
router.route('/reminder').post(reminderMail)
router.route('/auto-select').post(autoSelect)

export default router
