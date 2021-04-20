import fs from 'fs'
import request from 'request'

const download = function (uri, filename, callback) {
   request.head(uri, function (err, res, body) {
      request(uri)
         .pipe(fs.createWriteStream(__dirname + '/' + filename))
         .on('close', callback)
   })
}

export const handleImage = (req, res) => {
   const { path } = req.params
   const name = path.slice(path.lastIndexOf('/') + 1)
   download(path, name, async () => {
      res.sendFile(__dirname + '/' + name, () => {
         fs.unlinkSync(__dirname + '/' + name)
      })
   })
}
