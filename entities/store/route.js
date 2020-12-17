import express from 'express'
import { getStoreData } from './controllers'

const router = express.Router()

router.route('/').get(getStoreData)

export default router
