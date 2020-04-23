import express from 'express'
import { take } from './controllers'

const router = express.Router()

router.route('/take').post(take)

export default router
