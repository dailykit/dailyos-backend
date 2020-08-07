import express from 'express'
import { print, printJobs } from './controllers'

const router = express.Router()

router.route('/print').post(print)
router.route('/print/jobs').post(printJobs)

export default router
