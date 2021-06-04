import express from 'express'
import { experienceBookingEmail } from './controllers'

const router = express.Router()

router.route('/booking/sendUrl').post(experienceBookingEmail)

export default router
