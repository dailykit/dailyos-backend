import express from 'express'

import parseur from './controllers'

const router = express.Router()

router.post('/', parseur.insert)

export const ParseurRouter = router
