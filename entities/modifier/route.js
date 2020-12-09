import express from 'express'
import { handle } from './controllers'

const router = express.Router()

router.route('/').post(handle)

export default router
