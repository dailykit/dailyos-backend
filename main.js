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
   sendMail,
   DeviceRouter,
   UploadRouter,
   RMKMenuRouter,
   initiatePayment,
   OccurenceRouter,
   WorkOrderRouter,
   NotificationRouter,
   RewardsRouter
} from './entities'
import { PrintRouter } from './entities/print'
import { printSachetLabel, printProductLabel } from './entities/events'

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
app.post('/api/sendmail', sendMail)
app.use('/api/rewards', RewardsRouter)

app.use('/webhook/user', UserRouter)
app.use('/webhook/devices', DeviceRouter)
app.use('/webhook/notification', NotificationRouter)
app.use('/webhook/occurence', OccurenceRouter)

app.post('/event/print-sachet', printSachetLabel)
app.post('/event/print-product', printProductLabel)

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
