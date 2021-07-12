import get_env from '../../get_env'

export const createUrl = key =>
   `https://${get_env('S3_BUCKET')}.s3.amazonaws.com/${key}`
