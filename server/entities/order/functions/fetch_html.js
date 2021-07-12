import axios from 'axios'
import get_env from '../../../../get_env'
import { template_compiler } from '../../../utils'

export default async function (template, data) {
   try {
      const parsed = JSON.parse(
         template_compiler(JSON.stringify(template), data)
      )

      const { origin } = new URL(get_env('DATA_HUB'))
      const template_data = encodeURI(JSON.stringify(parsed.data))
      const template_options = encodeURI(JSON.stringify(parsed.template))

      const url = `${origin}/template/?template=${template_options}&data=${template_data}`

      const { data: html } = await axios.get(url)
      return html
   } catch (error) {
      console.log('getHtml -> error', error)
      throw Error(error.message)
   }
}
