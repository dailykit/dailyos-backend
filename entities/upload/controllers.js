const AWS = require('aws-sdk')
const fs = require('fs')
const fileType = require('file-type')
const multiparty = require('multiparty')
const { listS3Files, uploadFile, createUrl } = require('../../utils')

const s3 = new AWS.S3()

export const upload = (request, response) => {
   const form = new multiparty.Form()
   form.parse(request, async (error, fields, files) => {
      if (error) throw new Error(error)
      try {
         const path = files.file[0].path
         const buffer = fs.readFileSync(path)
         const type = await fileType.fromBuffer(buffer)
         const timestamp = Date.now().toString()
         let fileName
         if (type.mime.includes('image')) {
            fileName = `images/${timestamp}`
         } else if (type.mime.includes('video')) {
            fileName = `videos/${timestamp}`
         }
         const data = await uploadFile(buffer, fileName, type, fields.metadata)
         return response.status(200).send(data)
      } catch (error) {
         return response.status(400).send(error)
      }
   })
}

export const list = async (req, res) => {
   try {
      const { type } = req.query
      const { Contents } = await listS3Files(process.env.S3_BUCKET, type)
      const formatAssets = await Promise.all(
         Contents.map(async item => {
            try {
               const result = await s3
                  .headObject({
                     Bucket: process.env.S3_BUCKET,
                     Key: item.Key
                  })
                  .promise()
               return {
                  key: item.Key,
                  size: item.Size,
                  url: createUrl(item.Key),
                  metadata: result.Metadata
               }
            } catch (error) {
               console.log(error)
            }
         })
      )
      return res.status(200).json({
         success: true,
         data: formatAssets
      })
   } catch (error) {
      console.log('list -> error', error)
      return res.status(400).send(error)
   }
}

export const remove = async (req, res) => {
   try {
      const { key } = req.query
      const data = await s3
         .deleteObject({ Bucket: process.env.S3_BUCKET, Key: key })
         .promise()
      if (data.constructor === Object) {
         return res
            .status(200)
            .json({ success: true, message: 'Succesfully deleted!' })
      }
   } catch (error) {
      console.log(error)
      return res.status(400).send(error)
   }
}
