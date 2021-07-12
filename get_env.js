import fs from 'fs'
import get from 'lodash/get'
import axios from 'axios'

const get_env = async title => {
   try {
      if (fs.existsSync('config.js')) {
         const config = require('./config.js')
         return get(config, title, '')
      } else {
         const URL =
            (process.env.NODE_ENV === 'development'
               ? 'http://localhost:4000'
               : new URL(process.env.DATA_HUB).origin) + '/server/api/envs'
         const { data } = await axios.post(URL)

         return get(data, 'data.server.' + title, '')
      }
   } catch (error) {
      console.error('error', error.message)
   }
}

export default get_env
