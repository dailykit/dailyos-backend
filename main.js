require('dotenv').config()
import cors from 'cors'
import request from 'request'
import fs from 'fs'
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import AWS from 'aws-sdk'
import bluebird from 'bluebird'
const { createProxyMiddleware } = require('http-proxy-middleware')
import {
   MOFRouter,
   MenuRouter,
   UserRouter,
   OrderRouter,
   sendMail,
   DeviceRouter,
   NutritionInfoRouter,
   UploadRouter,
   RMKMenuRouter,
   initiatePayment,
   OccurenceRouter,
   WorkOrderRouter,
   NotificationRouter,
   RewardsRouter,
   ModifierRouter,
   emailParser,
   ParseurRouter,
   placeAutoComplete,
   placeDetails,
   StoreRouter,
   getDistance,
   authorizeRequest,
   handleImage,
   GetFullOccurenceRouter,
   CustomerRouter
} from './entities'
import { PrintRouter } from './entities/print'
import {
   printKOT,
   getKOTUrls,
   printLabel,
   handleThirdPartyOrder
} from './entities/events'
import {
   handleCustomerSignup,
   handleSubscriptionCancelled
} from './entities/emails'

const app = express()
const { ApolloServer } = require('apollo-server-express')
import depthLimit from 'graphql-depth-limit'

import ServerRouter from './server'
import schema from './template/schema'
import TemplateRouter from './template'


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
app.post('/api/distance-matrix', getDistance)
app.post('/api/sendmail', sendMail)
app.use('/api/rewards', RewardsRouter)
app.get('/api/kot-urls', getKOTUrls)
app.use('/api/modifier', ModifierRouter)
app.use('/api/parseur', ParseurRouter)
app.use('/api/occurences', GetFullOccurenceRouter)
app.use('/api/customer', CustomerRouter)

app.use('/webhook/user', UserRouter)
app.use('/webhook/devices', DeviceRouter)
app.use('/api/actions', NutritionInfoRouter)
app.use('/webhook/notification', NotificationRouter)
app.use('/webhook/occurence', OccurenceRouter)
app.post('/webhook/parse/email', emailParser)
app.post('/webhook/authorize-request', authorizeRequest)

app.post('/event/print-label', printLabel)
app.post('/event/print-kot', printKOT)
app.post('/event/order/third-party', handleThirdPartyOrder)

app.post('/webhook/emails/handle-customer-signup', handleCustomerSignup)
app.post(
   '/webhook/emails/handle-subscription-cancelled',
   handleSubscriptionCancelled
)

app.use('/api/store', StoreRouter)

app.get('/images/:url(*)', handleImage)

/*
   ------------ DAILY OS ------------
*/

app.use('/server', ServerRouter)
app.use('/apps', express.static('dailyos/build'))
app.use('/template', TemplateRouter)
app.use('/template/files', express.static('templates'))

const isProd = process.env.NODE_ENV === 'production' ? true : false

const proxy = createProxyMiddleware({
   target: 'http://localhost:3000',
   changeOrigin: true,
   onProxyReq: (proxyReq, req) => {
      if (req.body) {
         let bodyData = JSON.stringify(req.body)
         proxyReq.setHeader('Content-Type', 'application/json')
         proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
         proxyReq.write(bodyData)
      }
   }
})

app.use('/api/:path(*)', proxy)

const RESTRICTED_FILES = ['env-config.js', 'favicon', '.next', '_next']
const serveSubscription = async (req, res, next) => {
   //     Subscription shop: Browser <-> Express <-> NextJS
   try {
      const { path: routePath } = req.params
      const { preview } = req.query
      const { host } = req.headers
      const brand = host.replace(':', '')

      if (process.env.NODE_ENV === 'development') {
         const url = RESTRICTED_FILES.some(file => routePath.includes(file))
            ? 'http://localhost:3000/' + routePath
            : 'http://localhost:3000/' + brand + '/' + routePath
         request(url, function (error, _, body) {
            if (error) {
               throw error
            } else {
               res.send(body)
            }
         })
      } else {
         const isAllowed = !RESTRICTED_FILES.some(file =>
            routePath.includes(file)
         )
         if (isAllowed) {
            const filePath =
               routePath === ''
                  ? path.join(
                       __dirname,
                       `./subscription-shop/.next/server/pages/${brand}.html`
                    )
                  : path.join(
                       __dirname,
                       `./subscription-shop/.next/server/pages/${brand}/${routePath}.html`
                    )
            if (fs.existsSync(filePath) && preview !== 'true') {
               res.sendFile(filePath)
            } else {
               const url = RESTRICTED_FILES.some(file =>
                  routePath.includes(file)
               )
                  ? 'http://localhost:3000/' + routePath
                  : 'http://localhost:3000/' + brand + '/' + routePath
               request(url, function (error, _, body) {
                  if (error) {
                     console.log(error)
                  } else {
                     res.send(body)
                  }
               })
            }
         } else {
            if (routePath.includes('env-config.js')) {
               res.sendFile(
                  path.join(__dirname, 'subscription-shop/public/env-config.js')
               )
            } else {
               res.sendFile(
                  path.join(
                     __dirname,
                     routePath.replace('_next', 'subscription-shop/.next')
                  )
               )
            }
         }
      }
   } catch (error) {
      res.status(404).json({ success: false, error: 'Page not found!' })
   }
}

app.use('/:path(*)', serveSubscription)

const apolloserver = new ApolloServer({
   schema,
   playground: {
      endpoint: `${process.env.ENDPOINT}/template/graphql`
   },
   introspection: true,
   validationRules: [depthLimit(11)],
   formatError: err => {
      console.log(err)
      if (err.message.includes('ENOENT'))
         return isProd ? new Error('No such folder or file exists!') : err
      return isProd ? new Error(err) : err
   },
   debug: true,
   context: {
      root: process.env.FS_PATH,
      media: process.env.MEDIA_PATH
   }
})

apolloserver.applyMiddleware({ app })

app.listen(PORT, () => {
   console.log(`Server started on ${PORT}`)
})
