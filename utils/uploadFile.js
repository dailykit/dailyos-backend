const AWS = require('aws-sdk')

const s3 = new AWS.S3()

export const uploadFile = (buffer, name, type, metadata) => {
   const params = {
      ACL: 'public-read',
      Body: buffer,
      Bucket: process.env.S3_BUCKET,
      ContentType: type.mime,
      Key: `${name}.${type.ext}`,
      Metadata: JSON.parse(metadata)
   }

   return s3.upload(params).promise()
}
