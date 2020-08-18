import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
   host: 'smtp.gmail.com',
   port: 587,
   secure: false,
   requireTLS: true,
   auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
   }
})

export { transport }
