require('dotenv').config()
import express from 'express'
import cors from 'cors'
const morgan = require('morgan')

import { OrderRouter, WorkOrderRouter, MOFRouter, MenuRouter } from './entities'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const PORT = process.env.PORT || 4000

// Routes
app.use('/api/orders', OrderRouter)
app.use('/api/inventory', WorkOrderRouter)
app.use('/api/menu/', MenuRouter)
app.use('/api/mof/', MOFRouter)

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
