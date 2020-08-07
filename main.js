require('dotenv').config()
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import AWS from 'aws-sdk'
import bluebird from 'bluebird'
import {
   MOFRouter,
   MenuRouter,
   UserRouter,
   OrderRouter,
   DeviceRouter,
   UploadRouter,
   RMKMenuRouter,
   initiatePayment,
   OccurenceRouter,
   WorkOrderRouter,
   NotificationRouter
} from './entities'
import { PrintRouter } from './entities/print'

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
app.use('/api/mof', MOFRouter)
app.use('/api/menu', MenuRouter)
app.use('/api/order', OrderRouter)
app.use('/api/assets', UploadRouter)
app.use('/api/printer', PrintRouter)
app.use('/api/rmk-menu', RMKMenuRouter)
app.use('/api/inventory', WorkOrderRouter)
app.post('/api/initiate-payment', initiatePayment)

app.use('/webhook/user', UserRouter)
app.use('/webhook/devices', DeviceRouter)
app.use('/webhook/notification', NotificationRouter)
app.use('/webhook/occurence', OccurenceRouter)

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
