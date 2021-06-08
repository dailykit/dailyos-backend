import express from 'express'
import { create } from './controllers'

const router = express.Router()

router.route('/create').post(create)

export default router
