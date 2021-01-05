import axios from 'axios'

export const logger = async args => {
   try {
      await axios({
         method: 'POST',
         url: `${process.env.PLATFORM_URL}/api/report/error`,
         data: {
            ...args,
            from: {
               url: new URL(process.env.DATA_HUB).origin
            }
         }
      })
   } catch (error) {
      console.log('failed to report error', error)
   }
}
