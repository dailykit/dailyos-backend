import express from 'express'
import { fullOccurenceReport } from './controllers'

const router = express.Router()

router.route('/getfulloccurence').get(fullOccurenceReport)
export default router
