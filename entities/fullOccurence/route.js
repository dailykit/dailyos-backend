import express from 'express'
import { fullOccurenceReport } from './controllers'

const router = express.Router()

router.route('/report').get(fullOccurenceReport)
export default router
