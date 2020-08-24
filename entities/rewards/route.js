import express from 'express'
import { handleRewards } from './controllers'

const router = express.Router()

router.route('/').post(handleRewards)

export default router
