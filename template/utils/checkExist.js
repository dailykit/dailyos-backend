const fs = require('fs')
let count = 0
const copyName = async url => {
   try {
      const isExist = fs.existsSync(
         `${process.env.FS_PATH}${process.env.MARKET_PLACE_PATH}${url}`
      )
      if (isExist) {
         // let folderName = url.replace(/^\//g, '').split(/\//g)[0]
         let newPath = url
         count += 1
         if (count <= 1) {
            newPath = newPath.concat(`(${count})`)
         } else {
            newPath = newPath.split('(')[0].concat(`(${count})`)
         }
         const result = await copyName(newPath)
         return result
         //  const checkAgain = copyName()
      } else {
         count = 0
         return `${process.env.MARKET_PLACE_PATH}${url}`
      }
   } catch (err) {
      return new Error(err)
   }
}

module.exports = copyName
