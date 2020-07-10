require('dotenv').config()
import express from 'express'
import cors from 'cors'
const morgan = require('morgan')
const AWS = require('aws-sdk')
const bluebird = require('bluebird')

import {
   OrderRouter,
   MOFRouter,
   UserRouter,
   MenuRouter,
   UploadRouter,
   DeviceRouter,
   RMKMenuRouter,
   WorkOrderRouter,
   initiatePayment,
   OccurenceRouter,
   NotificationRouter
} from './entities'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
   morgan(
      '[:status :method :url] :remote-user [:date[clf]] - [:user-agent] - :response-time ms'
   )
)

AWS.config.update({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

AWS.config.setPromisesDependency(bluebird)

const PORT = process.env.PORT || 4000

// Routes
app.use('/api/order', OrderRouter)
app.use('/api/inventory', WorkOrderRouter)
app.use('/api/menu', MenuRouter)
app.use('/api/rmk-menu', RMKMenuRouter)
app.use('/api/mof', MOFRouter)
app.use('/api/assets', UploadRouter)
app.post('/api/initiate-payment', initiatePayment)

app.use('/webhook/user', UserRouter)
app.use('/webhook/devices', DeviceRouter)
app.use('/webhook/notification', NotificationRouter)
app.use('/webhook/occurence', OccurenceRouter)

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
