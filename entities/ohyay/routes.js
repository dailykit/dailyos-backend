import express from 'express'
import { cloneWorkspace } from './controllers'

const router = express.Router()

router.route('/cloneWorkspace').post(cloneWorkspace)

export default router
