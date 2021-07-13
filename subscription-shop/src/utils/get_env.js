import get from 'lodash/get'

export const get_env = title => {
   return process.browser
      ? get(window, '_env_.' + title, '')
      : process.env[title]
}
