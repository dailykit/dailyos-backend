import express from 'express'
import * as controllers from './controllers'

const router = express.Router()

router.route('/plans').post(controllers.Plan.Create)

export default router
