export const template_compiler = (text, data) => {
   try {
      const regex = /\{\{([^}]+)\}\}/g

      const evaluate = (path, data) =>
         path.split('.').reduce((o, i) => o[i], data)

      const matches = text.match(regex)

      const parsed = matches.map(match => {
         const key = match.slice(2, -2)
         const value = evaluate(key, data)
         return { [key]: value }
      })

      let obj = {}

      parsed.forEach(i => {
         obj = { ...obj, ...i }
      })

      const result = text.replace(regex, function (match) {
         return obj[match.slice(2, -2)]
      })
      return result
   } catch (error) {
      throw Error(error.message)
   }
}
