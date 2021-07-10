import express from 'express'
import { process } from './controllers'

const router = express.Router()

router.route('/').post(process)

export default router
