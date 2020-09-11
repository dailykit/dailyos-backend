import { client } from '../../lib/graphql'

export const printProductLabel = async (req, res) => {
   try {
      const {
         id,
         assemblyStatus,
         labelTemplateId,
         assemblyStationId,
         ...rest
      } = req.body.event.data.new

      if (!labelTemplateId) throw Error('No label template is provided.')
      if (!assemblyStationId) throw Error('Assembly station Id is missing.')
      if (assemblyStatus !== 'COMPLETED')
         throw Error('Product is not packed yet.')

      const { station } = await client.request(STATION, {
         id: assemblyStationId
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

            const url = new URL(process.env.DATA_HUB).origin + '/template'
            const template = `{"name":${labelTemplate.name},"type":"label","format":"pdf"}`

            if ('inventoryProductId' in rest) {
               const { product = {} } = await client.request(
                  INVENTORY_PRODUCT,
                  {
                     id: rest.inventoryProductId
                  }
               )

               const name = product.inventory.name
               if (product.combo) {
                  name += ` - ${product.combo.name}`
               }
               if (product.component) {
                  name += ` (${product.component.label})`
               }

               await client.request(PRINT_JOB, {
                  printerId,
                  source: 'DailyOS',
                  contentType: 'pdf_uri',
                  url: `${url}?template=${template}&data={"id":${id}}`,
                  title: `Order Product: ${name}`
               })

               return res.status(200).json({
                  success: true,
                  message: `Printing product: ${name} label!`
               })
            } else if ('simpleRecipeProductId' in rest) {
               const { option = {} } = await client.request(PRODUCT_TYPE, {
                  id: rest.simpleRecipeProductOptionId
               })

               if (Object.keys(option).length > 0) {
                  await client.request(PRINT_JOB, {
                     printerId,
                     source: 'DailyOS',
                     contentType: 'pdf_uri',
                     url: `${url}?template=${template}&data={"id":${id}}`,
                     title: `Order Product: ${option.product.name}`
                  })

                  return res.status(200).json({
                     success: true,
                     message: `Printing product: ${option.product.name} label!`
                  })
               }
               throw Error('No such product option exists!')
            }
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

const PRODUCT_TYPE = `
   query option($id: Int!) {
      option: simpleRecipeProductOption(id: $id) {
         product: simpleRecipeProduct {
            name
         }
      }
   }
`

const INVENTORY_PRODUCT = `
   query product($id: Int!) {
      product: orderInventoryProduct(id: $id) {
         inventory: inventoryProduct {
            name
         }
         combo: comboProduct {
            name
         }
         component: comboProductComponent {
            label
         }
      }
   }
`
