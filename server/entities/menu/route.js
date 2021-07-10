import express from 'express'
import { getMenu } from './controllers'

const router = express.Router()

router.route('/').post(getMenu)

export default router
