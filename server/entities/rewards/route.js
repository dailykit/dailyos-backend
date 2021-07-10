import express from 'express'
import { processRewards } from './controllers'

const router = express.Router()

router.route('/process').post(processRewards)

export default router
