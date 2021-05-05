import axios from 'axios'
import { client } from '../../lib/graphql'
import { template_compiler } from '..'
import { SEND_MAIL } from '../../entities/occurence/graphql'

export const emailTrigger = async ({ title, variables = {}, to }) => {
   try {
      const { templateSettings = [] } = await client.request(
         GET_TEMPLATE_SETTINGS,
         {
            title
         }
      )
      if (templateSettings.length === 1) {
         const [
            {
               requiredVar = [],
               subjectLineTemplate,
               fromEmail,
               functionFile = {},
               emailTemplateFile = {}
            }
         ] = templateSettings

         let proceed = true
         requiredVar.every(item => {
            proceed = variables.hasOwnProperty(item)
            return proceed
         })
         console.log(functionFile, emailTemplateFile.fileName)
         if (proceed) {
            let html = await getHtml(
               functionFile,
               emailTemplateFile.fileName,
               variables
            )
            console.log(html)
            let subjectLine = await getHtml(
               functionFile,
               emailTemplateFile.fileName,
               variables,
               subjectLineTemplate
            )

            await client.request(SEND_MAIL, {
               emailInput: {
                  from: fromEmail,
                  to,
                  subject: subjectLine,
                  attachments: [],
                  html
               }
            })
         } else {
            console.log(
               'Could not send email as required variables were not provided'
            )
         }
      }
   } catch (error) {
      // throw Error(error.message)
      console.log(error)
   }
}

const getHtml = async (
   functionFile,
   emailTemplateFileName,
   variables,
   subjectLineTemplate
) => {
   try {
      const { origin } = new URL(process.env.TEMPLATE_BASE_URL)
      console.log(origin)
      const template_variables = encodeURI(
         JSON.stringify({ ...variables, emailTemplateFileName })
      )
      const template_options = encodeURI(
         JSON.stringify({ path: functionFile.path, format: 'html' })
      )
      if (subjectLineTemplate) {
         const url = `${origin}/?template=${template_options}&data=${template_variables}&readVar=true`
         console.log("👩lineno-83", url)
         const { data } = await axios.get(url)

         const result = template_compiler(subjectLineTemplate, { data })
         console.log("subjectLine: ", result)
         return result
      } else {
         const url = `${origin}/?template=${template_options}&data=${template_variables}`
         console.log(url)
         const { data: html } = await axios.get(url)
         return html
      }
   } catch (error) {
      throw Error(error.message)
   }
}

export const GET_TEMPLATE_SETTINGS = `
query templateSettings($title: String!) {
   templateSettings: notifications_emailTriggers(where: {title: {_eq: $title}}) {
     id
     title
     requiredVar: var
     subjectLineTemplate
     functionFile {
       fileName
       path
     }
     emailTemplateFile {
       fileName
       path
     }
     fromEmail
   }
 }  
`

