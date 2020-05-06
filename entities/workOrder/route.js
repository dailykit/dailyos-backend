import { Router } from 'express'

const router = Router()

router.get('/test', (req, res) => {
   res.send('hello world')
})

export default router
