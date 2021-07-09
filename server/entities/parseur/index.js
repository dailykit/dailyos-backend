import express from 'express'

import parseur from './controllers'

const router = express.Router()

router.post('/', parseur.insert)
router.delete('/', parseur.delete)
router.get('/:id', parseur.one)

export const ParseurRouter = router
