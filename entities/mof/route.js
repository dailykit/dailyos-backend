import express from 'express'
import { updateMOF, liveMOF } from './controllers'

const router = express.Router()

router.route('/update').post(updateMOF)
router.route('/live').post(liveMOF)

export default router
