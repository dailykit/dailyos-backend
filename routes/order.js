import express from 'express'
import { take } from '../controllers/order'

const router = express.Router()

router.route('/take').post(take)

export default router
