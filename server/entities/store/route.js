import express from 'express'
import { getStoreData } from './controllers'

const router = express.Router()

router.route('/data').post(getStoreData)

export default router
