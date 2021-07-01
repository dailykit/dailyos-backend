const axios = require('axios')

const fetchFile = fold => {
   return new Promise(async (resolve, reject) => {
      const { path, linkedCssFiles, linkedJsFiles } = fold.subscriptionDivFileId

      const { data } = await axios.get(
         `${process.env.EXPRESS_URL}/template/files${path}`
      )

      // add css links + html
      const parsedData =
         linkedCssFiles.map(
            ({ cssFile }) =>
               `<link rel="stylesheet" type="text/css" href="${process.env.EXPRESS_URL}/template/files${cssFile.path}" media="screen"/>`
         ).join`` + data

      // script urls
      const scripts = linkedJsFiles.map(
         ({ jsFile }) =>
            `${process.env.EXPRESS_URL}/template/files${jsFile.path}`
      )

      if (data) resolve({ id: fold.id, content: parsedData, scripts })
      else reject('Failed to load file')
   })
}

export const fileParser = async folds => {
   const allFolds = Array.isArray(folds) ? folds : [folds]

   const output = await Promise.all(allFolds.map(fold => fetchFile(fold)))

   return output
}
