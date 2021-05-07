import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

import { client } from '../../../lib/graphql'

const RRULE_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
const ZIPCODES = [
   '60601',
   '60602',
   '60603',
   '60604',
   '60605',
   '60606',
   '60607',
   '60608',
   '60609',
   '60610',
   '60611',
   '60612',
   '60613',
   '60614',
   '60615',
   '60616',
   '60617',
   '60618',
   '60619',
   '60620',
   '60621',
   '60622',
   '60623',
   '60624',
   '60625',
   '60626',
   '60628',
   '60629',
   '60630',
   '60631',
   '60632',
   '60633',
   '60634',
   '60636',
   '60637',
   '60638',
   '60639',
   '60640',
   '60641',
   '60642',
   '60643',
   '60644',
   '60645',
   '60646',
   '60647',
   '60649',
   '60651',
   '60652',
   '60653',
   '60654',
   '60655',
   '60656',
   '60657',
   '60659',
   '60660',
   '60661',
   '60664',
   '60666',
   '60668',
   '60669',
   '60670',
   '60673',
   '60674',
   '60675',
   '60677',
   '60678',
   '60680',
   '60681',
   '60682',
   '60684',
   '60685',
   '60686',
   '60687',
   '60688',
   '60689',
   '60690',
   '60691',
   '60693',
   '60694',
   '60695',
   '60696',
   '60697',
   '60699',
   '60701'
]

const random_number = (min, max) => {
   min = Math.ceil(min)
   max = Math.floor(max)
   return Math.floor(Math.random() * (max - min + 1)) + min
}

export const Plan = {
   Create: async (req, res) => {
      try {
         // CREATE SUBSCRIPTION TITLE
         const titles = await create_titles()

         if (titles.length === 0)
            return res.status(400).json({
               success: false,
               error: `Failed to create subscription title!`
            })

         // CREATE SUBSCRIPTION SERVINGS
         const servings = await create_servings({ titles, sizes: [] })

         // CREATE SUBSCRIPTION ITEM COUNT
         const item_count = await create_item_count({ servings })

         // CREATE SUBSCRIPTION
         const subscription = await create_subscription({ item_count })

         // CREATE ZIP CODES
         const zipcode = await create_zipcode({ subscription })

         return res.status(200).json({
            success: true,
            message: 'Successfully created plan!',
            data: {
               title,
               serving,
               item_count,
               subscription,
               zipcode
            }
         })
      } catch (error) {
         return res.status(500).json({ success: false, error })
      }
   }
}

export const create_titles = async (titles = []) => {
   try {
      const variables = (title = '') => ({
         isDemo: true,
         title: title.trim() || 'plan-' + uuidv4().slice(0, 8)
      })
      const { createSubsriptionTitles = [] } = await client.request(
         INSERT_SUBSCRIPTION_TITLES,
         {
            objects:
               titles.length > 0
                  ? titles.map(({ title }) => variables(title))
                  : [variables()]
         }
      )

      if (createSubsriptionTitles.affected_rows > 0) {
         return createSubsriptionTitles.returning
      }
      return []
   } catch (error) {
      throw error
   }
}

export const create_servings = async ({ titles = [], sizes = [] }) => {
   try {
      if (titles.length === 0) return []

      const titles_sizes = []

      for (let x = 0; x < titles.length; x++) {
         const title = titles[x]
         for (let x = 0; x < sizes.length; x++) {
            const size = sizes[x]
            titles_sizes.push({ title: title.id, size })
         }
      }

      if (titles_sizes.length > 0) {
         const result = await Promise(
            titles_sizes.map(async node => {
               try {
                  const {
                     createSubsriptionServings = {}
                  } = await client.request(INSERT_SUBSCRIPTION_SERVINGS, {
                     objects: [
                        {
                           isDemo: true,
                           subscriptionTitleId: node.title,
                           servingSize: node.size || random_number(1, 10)
                        }
                     ]
                  })
                  if (createSubsriptionServings.affected_rows > 0) {
                     return {
                        success: true,
                        data: createSubsriptionServings.returning[0]
                     }
                  }
                  return { success: false }
               } catch (error) {
                  return { success: false }
               }
            })
         )

         return result.filter(({ success }) => success).map(node => node.data)
      } else if (Array.isArray(sizes) && sizes.length === 0) {
         let rows = titles.map(({ id }) => ({ id, size: random_number(1, 10) }))
         const { createSubsriptionServings = {} } = await client.request(
            INSERT_SUBSCRIPTION_SERVINGS,
            {
               objects: rows.map(row => [
                  {
                     isDemo: true,
                     servingSize: row.size,
                     subscriptionTitleId: row.id
                  }
               ])
            }
         )
         if (createSubsriptionServings.affected_rows > 0) {
            return createSubsriptionServings.returning
         }
      }
   } catch (error) {
      throw error
   }
}

export const create_item_count = async args => {
   try {
      const {
         serving = {},
         price = null,
         count = null,
         isTaxIncluded = null
      } = args
      if (!Boolean('id' in serving && serving.id)) return null

      const { createSubsriptionItemCount = {} } = await client.request(
         INSERT_SUBSCRIPTION_ITEM_COUNT,
         {
            object: {
               isDemo: true,
               subscriptionServingId: serving.id,
               count: count || random_number(1, 10),
               price: price || random_number(10, 60),
               isTaxIncluded:
                  isTaxIncluded || [true, false][random_number(0, 1)]
            }
         }
      )

      if (createSubsriptionItemCount.id) {
         return createSubsriptionItemCount
      }
      return null
   } catch (error) {
      throw error
   }
}

export const create_subscription = async args => {
   try {
      const {
         rrule = null,
         endDate = null,
         leadTime = null,
         item_count = null,
         startTime = null,
         startDate = null,
         cutOffTime = null,
         reminderSettings = null
      } = args
      if (!Boolean('id' in item_count && item_count.id)) return null

      const { createSubscription = {} } = await client.request(
         INSERT_SUBSCRIPTION,
         {
            object: {
               isDemo: true,
               subscriptionItemCountId: item_count.id,
               startDate: startDate || moment().format('YYYY-MM-DD'),
               cutOffTime: cutOffTime || random_number(14, 20) + ':00:00',
               endDate:
                  endDate || moment().add(1, 'month').format('YYYY-MM-DD'),
               leadTime: {
                  unit: 'days',
                  value: leadTime || random_number(1, 7)
               },
               startTime: {
                  unit: 'days',
                  value: startTime || random_number(14, 28)
               },
               rrule:
                  rrule ||
                  `RRULE:FREQ=WEEKLY;INTERVAL=1;WKST=MO;BYDAY=${
                     RRULE_DAYS[Math.floor(Math.random() * RRULE_DAYS.length)]
                  }`,
               reminderSettings: reminderSettings || {
                  template: 'Subscription Reminder Email',
                  hoursBefore: Array.from({ length: random_number(1, 3) }, () =>
                     random_number(6, 48)
                  ).sort((a, b) => b - a)
               }
            }
         }
      )

      if (createSubscription.id) {
         return createSubscription
      }
      return null
   } catch (error) {
      throw error
   }
}

export const create_zipcode = async args => {
   try {
      const {
         zipcode = null,
         subscription = {},
         deliveryTime = null,
         deliveryPrice = null,
         isPickupActive = null,
         isDeliveryActive = null
      } = args
      if (!Boolean('id' in subscription && subscription.id)) return null

      const { createZipcode = {} } = await client.request(INSERT_ZIPCODE, {
         object: {
            isDemo: true,
            isActive: true,
            subscriptionId: subscription.id,
            deliveryPrice: deliveryPrice || random_number(1, 15),
            zipcode:
               zipcode || ZIPCODES[Math.floor(Math.random() * ZIPCODES.length)],
            deliveryTime: deliveryTime || {
               to: `${random_number(16, 21)}:00`,
               from: `${random_number(8, 15)}:00`
            },
            isDeliveryActive:
               isDeliveryActive !== null ? isDeliveryActive : true,
            isPickupActive: isPickupActive !== null ? isPickupActive : false
         }
      })

      if (createZipcode.id) {
         return createZipcode
      }
      return null
   } catch (error) {
      throw error
   }
}

const INSERT_SUBSCRIPTION_TITLES = `
   mutation createSubsriptionTitles(
      $objects: [subscription_subscriptionTitle_insert_input!]!
   ) {
      createSubsriptionTitles: insert_subscription_subscriptionTitle(
         objects: $objects
      ) {
         affected_rows
         returning {
            id
            title
         }
      }
   }
`

const INSERT_SUBSCRIPTION_SERVINGS = `
   mutation createSubsriptionServings(
      $objects: [subscription_subscriptionServing_insert_input!]!
   ) {
      createSubsriptionServings: insert_subscription_subscriptionServing(
         objects: $objects
      ) {
         affected_rows
         returning {
            id
            size: servingSize
         }
      }
   }
`

const INSERT_SUBSCRIPTION_ITEM_COUNT = `
   mutation createSubsriptionItemCount(
      $object: subscription_subscriptionItemCount_insert_input!
   ) {
      createSubsriptionItemCount: insert_subscription_subscriptionItemCount_one(
         object: $object
      ) {
         id
         count
         price
         isTaxIncluded
         subscriptionServingId
      }
   }
`

const INSERT_SUBSCRIPTION = `
   mutation createSubscription(
      $object: subscription_subscription_insert_input!
   ) {
      createSubscription: insert_subscription_subscription_one(object: $object) {
         id
         subscriptionItemCountId
      }
   }
`

const INSERT_ZIPCODE = `
   mutation createZipcode(
      $object: subscription_subscription_zipcode_insert_input!
   ) {
      createZipcode: insert_subscription_subscription_zipcode_one(
         object: $object
      ) {
         zipcode
         subscriptionId
      }
   }
`

/*
{
  "object": {
    "title": "",
    "subscriptionServings": {
      "data": [
        {
          "servingSize": 2,
          "subscriptionItemCounts": {
            "data": [
              {
                "count": 1,
                "price": 20,
                "isTaxIncluded": true,
                "subscriptions": {
                  "data": [
                    {
                      "cutOffTime": "17:00:00",
                      "startDate": "2021-05-12",
                      "endDate": "2021-06-12",
                      "startTime": { "unit": "days", "value": 28 },
                      "leadTime": { "unit": "days", "value": 3 },
                      "rrule": "RRULE:FREQ=WEEKLY;INTERVAL=1;WKST=MO;BYDAY=SU",
                      "reminderSettings": { "template": "Subscription Reminder Email", "hoursBefore": [ 24 ] },
                      "availableZipcodes": {
                        "data": [
                          {
                            "deliveryPrice": 1,
                            "deliveryTime": { "to": "20:00", "from": "08:00" },
                            "isActive": true,
                            "isDeliveryActive": true,
                            "isPickupActive": true,
                            "subscriptionPickupOptionId": 1000,
                            "zipcode": "10788"
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
}
*/
