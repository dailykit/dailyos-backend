require('dotenv').config()
import cors from 'cors'
import { StatusCodes } from 'http-status-codes'
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
   RewardsRouter,
   ModifierRouter
   placeAutoComplete,
   placeDetails
} from './entities'
import { PrintRouter } from './entities/print'
import {
   printKOT,
   getKOTUrls,
   printSachetLabel,
   printProductLabel
} from './entities/events'

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
app.get('/api/place/autocomplete/json', placeAutoComplete)
app.get('/api/place/details/json', placeDetails)
app.post('/api/sendmail', sendMail)
app.use('/api/rewards', RewardsRouter)
app.get('/api/kot-urls', getKOTUrls)
app.use('/api/modifier', ModifierRouter)

app.use('/webhook/user', UserRouter)
app.use('/webhook/devices', DeviceRouter)
app.use('/webhook/notification', NotificationRouter)
app.use('/webhook/occurence', OccurenceRouter)

app.post('/event/print-sachet', printSachetLabel)
app.post('/event/print-product', printProductLabel)
app.post('/event/print-kot', printKOT)

app.use((_req, _res, next) => {
   const error = new Error('Not found')
   error.status = StatusCodes.NOT_FOUND
   next(error)
})

app.use((error, _req, res, next) => {
   res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: error.message,
      stack: error.stack
   })
})

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
