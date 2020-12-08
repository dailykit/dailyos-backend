import { client } from '../../lib/graphql'

export const printSachetLabel = async (req, res) => {
   try {
      const {
         id,
         isPortioned,
         ingredientName,
         processingName,
         labelTemplateId,
         packingStationId
      } = req.body.event.data.new

      if (!isPortioned) throw Error('Sachet has not been portioned yet.')
      if (!labelTemplateId) throw Error('No label template assigned.')
      if (!packingStationId) throw Error('No station assigned.')

      const { station } = await client.request(STATION, {
         id: packingStationId
      })

      if (
         !station.defaultLabelPrinterId &&
         station.attachedLabelPrinters.length === 0
      ) {
         throw Error('Assigned station has no printers available.')
      }

      const { settings } = await client.request(PRINT_SETTINGS, {
         app: { _eq: 'order' },
         identifier: { _eq: 'print simulation' }
      })

      if (settings.length > 0) {
         const [setting] = settings
         if (setting.isActive) {
            await client.request(UPDATE_ORDER_SACHET, {
               id,
               _set: {
                  status: 'PACKED',
                  isLabelled: true
               }
            })
            return res
               .status(200)
               .json({ success: true, message: 'Print simulation is on!' })
         } else {
            const { labelTemplate = {} } = await client.request(
               LABEL_TEMPLATE,
               {
                  id: labelTemplateId
               }
            )
            const printerId =
               station.defaultLabelPrinterId ||
               station.attachedLabelPrinters[0].printNodeId

            const url = new URL(process.env.DATA_HUB).origin + '/template/'
            const template = `{"name":${labelTemplate.name},"type":"label","format":"pdf"}`

            await client.request(PRINT_JOB, {
               printerId,
               source: 'DailyOS',
               contentType: 'pdf_uri',
               url: `${url}?template=${template}&data={"id":${id}}`,
               title: `Sachet: ${processingName} - ${ingredientName}`
            })

            await client.request(UPDATE_ORDER_SACHET, {
               id,
               _set: {
                  status: 'PACKED',
                  isLabelled: true
               }
            })

            return res.status(200).json({
               success: true,
               message: `Printing sachet: ${processingName} - ${ingredientName}.`
            })
         }
      }
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

const PRINT_SETTINGS = `
   query settings(
      $identifier: String_comparison_exp!
      $app: String_comparison_exp!
   ) {
      settings: settings_appSettings(
         where: { app: $app, identifier: $identifier }
      ) {
         id
         isActive: value(path: "isActive")
      }
   }
`

const PRINT_JOB = `
   mutation createPrintJob(
      $contentType: String!
      $printerId: Int!
      $source: String!
      $title: String!
      $url: String!
   ) {
      createPrintJob(
         contentType: $contentType
         printerId: $printerId
         source: $source
         title: $title
         url: $url
      ) {
         message
         success
      }
   }
`

const STATION = `
   query station($id: Int!) {
      station(id: $id) {
         defaultLabelPrinter {
            printNodeId
         }
         attachedLabelPrinters {
            printNodeId
         }
      }
   }
`

const LABEL_TEMPLATE = `
   query labelTemplate($id: Int!) {
      labelTemplate(id: $id) {
         id
         name
      }
   }
`

const UPDATE_ORDER_SACHET = `
   mutation updateOrderSachet($id: Int!, $_set: order_orderSachet_set_input!) {
      updateOrderSachet(pk_columns: { id: $id }, _set: $_set) {
         id
      }
   }
`
