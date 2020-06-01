require('dotenv').config()
import express from 'express'
import cors from 'cors'
const morgan = require('morgan')
const AWS = require('aws-sdk')
const bluebird = require('bluebird')

import {
   OrderRouter,
   WorkOrderRouter,
   MOFRouter,
   MenuRouter,
   UploadRouter,
   DeviceRouter,
   initiatePayment
} from './entities'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

AWS.config.update({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

AWS.config.setPromisesDependency(bluebird)

const PORT = process.env.PORT || 4000

// Routes
app.use('/api/order', OrderRouter)
app.use('/api/inventory', WorkOrderRouter)
app.use('/api/menu/', MenuRouter)
app.use('/api/mof/', MOFRouter)
app.use('/api/assets', UploadRouter)
app.post('/api/initiate-payment', initiatePayment)

app.use('/webhook/devices', DeviceRouter)

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
