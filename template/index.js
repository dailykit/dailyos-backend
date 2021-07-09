import puppeteer from 'puppeteer'
import express from 'express'

const checkExist = require('./utils/checkExist')
const copyFolder = require('./utils/copyFolder')

const router = express.Router()

export const root = async (req, res) => {
   try {
      if (!('template' in req.query)) {
         return res.status(400).json({
            success: false,
            error: 'template query param is required!'
         })
      }
      if (!('data' in req.query)) {
         return res
            .status(400)
            .json({ success: false, error: 'data query param is required!' })
      }

      const template = await JSON.parse(req.query.template)
      const data = await JSON.parse(req.query.data)
      let method
      if (template.path) {
         method = require(`./templates/${template.path}`)
      } else {
         method = require(`./templates/${template.type}/${template.name}/index`)
      }
      let result = await method.default(data, template)

      switch (template.format) {
         case 'html':
            return res.send(result)
         case 'pdf': {
            const browser = await puppeteer.launch({
               args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
            const page = await browser.newPage()
            await page.setContent(result)
            const buffer = await page.pdf({
               path: `${template.type}.pdf`
            })
            await browser.close()
            fs.unlinkSync(`${template.type}.pdf`)
            res.type('application/pdf')
            return res.send(buffer)
         }
         default:
            throw Error('Invalid Format')
      }
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const download = async (req, res) => {
   try {
      const src = `/${req.params.path}`
      const dest = await checkExist(src)
      const result = await copyFolder(src, dest)
      res.send(result)
   } catch (err) {
      console.log(err)
   }
}

router.get('/', root)
router.post('/download/:path(*)', download)

export default router
