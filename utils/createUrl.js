export const createUrl = key =>
   `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`
