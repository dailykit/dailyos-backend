import axios from 'axios'
import get_env from '../../get_env'

export const logger = async args => {
   try {
      await axios({
         method: 'POST',
         url: `${get_env('PLATFORM_URL')}/api/report/error`,
         data: {
            ...args,
            from: {
               url: new URL(get_env('DATA_HUB')).origin
            }
         }
      })
   } catch (error) {
      console.log('failed to report error', error)
   }
}
