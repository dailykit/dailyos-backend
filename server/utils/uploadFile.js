import get_env from '../../get_env'

const AWS = require('aws-sdk')

const s3 = new AWS.S3()

export const uploadFile = (buffer, name, type) => {
   const params = {
      ACL: 'public-read',
      Body: buffer,
      Bucket: get_env('S3_BUCKET'),
      ContentType: type.mime,
      Key: `${name}.${type.ext}`,
      Metadata: {}
   }

   return s3.upload(params).promise()
}
