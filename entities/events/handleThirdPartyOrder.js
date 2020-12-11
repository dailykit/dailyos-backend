import { client } from '../../lib/graphql'

export const handleThirdPartyOrder = async (req, res) => {
   try {
      const { op, data = {} } = req.body.event
      let result = {}
      switch (op) {
         case 'MANUAL': {
            result = await createOrder(data)
            break
         }
         case 'INSERT': {
            result = await createOrder(data)
            break
         }
         default:
            throw Error('No such event type has been mapped yet!')
      }
      return res.status(200).json({ success: true, data: result })
   } catch (error) {
      return res.status(400).json({ success: false, error: error })
   }
}

const createOrder = async data => {
   try {
      const {
         tax = '',
         tax2 = '',
         discount = '',
         grandTotal = '',
         restData
      } = data.new.parsedData

      let info = deliveryInfo

      if ('dropoffCity' in restData && restData.dropoffCity) {
         info.dropoff.dropoffInfo.customerAddress.city = restData.dropoffCity
      }
      if ('dropoffCountry' in restData && restData.dropoffCountry) {
         info.dropoff.dropoffInfo.customerAddress.country =
            restData.dropoffCountry
      }
      if ('dropoffEmail' in restData && restData.dropoffEmail) {
         info.dropoff.dropoffInfo.customerEmail = restData.dropoffEmail
      }
      if ('dropoffName' in restData && restData.dropoffName) {
         info.dropoff.dropoffInfo.customerFirstName = restData.dropoffName
      }
      if ('dropoffPhone' in restData && restData.dropoffPhone) {
         info.dropoff.dropoffInfo.customerPhone = restData.dropoffPhone
      }
      if ('dropoffState' in restData && restData.dropoffState) {
         info.dropoff.dropoffInfo.customerAddress.state = restData.dropoffState
      }
      if ('dropoffZip' in restData && restData.dropoffZip) {
         info.dropoff.dropoffInfo.customerAddress.zipcode = restData.dropoffZip
      }

      if ('pickupCity' in restData && restData.pickupCity) {
         info.pickup.pickupInfo.OrganizationAddress.city = restData.pickupCity
      }
      if ('pickupCountry' in restData && restData.pickupCountry) {
         info.pickup.pickupInfo.OrganizationAddress.country =
            restData.pickupCountry
      }
      if ('pickupEmail' in restData && restData.pickupEmail) {
         info.pickup.pickupInfo.OrganizationEmail = restData.pickupEmail
      }
      if ('pickupName' in restData && restData.pickupName) {
         info.pickup.pickupInfo.OrganizationName = restData.pickupName
      }
      if ('pickupPhone' in restData && restData.pickupPhone) {
         info.pickup.pickupInfo.OrganizationPhone = restData.pickupPhone
      }
      if ('pickupState' in restData && restData.pickupState) {
         info.pickup.pickupInfo.OrganizationAddress.state = restData.pickupState
      }
      if ('pickupZip' in restData && restData.pickupZip) {
         info.pickup.pickupInfo.OrganizationAddress.zipcode = restData.pickupZip
      }

      const { createOrder } = await client.request(CREATE_ORDER, {
         object: {
            source: 'a-la-carte',
            orderStatus: 'PENDING',
            paymentStatus: 'SUCCEEDED',
            thirdPartyOrderId: data.new.id,
            ...(discount.trim() && { discount: Number(discount.trim()) }),
            ...(grandTotal.trim() && { amountPaid: Number(grandTotal.trim()) }),
            ...(tax.trim() && {
               tax: Number(tax.trim()) + (tax2.trim() ? Number(tax2.trim()) : 0)
            })
         }
      })
      return createOrder
   } catch (error) {
      throw error
   }
}

const CREATE_ORDER = `
   mutation createOrder($object: order_order_insert_input!) {
      createOrder(object: $object) {
         id
      }
   }
`

const deliveryInfo = {
   deliveryId: '',
   webhookUrl: '',
   deliveryFee: {
      value: '',
      unit: ''
   },
   tracking: {
      location: {
         isAvailable: false,
         longitude: '',
         latitude: ''
      },
      code: {
         isAvailable: false,
         value: '',
         url: ''
      },
      sms: {
         isAvailable: false
      },
      eta: ''
   },
   orderInfo: {
      products: []
   },
   deliveryRequest: {
      status: {
         value: 'WAITING',
         timeStamp: '',
         description: '',
         data: {}
      },
      distance: {
         value: 0,
         unit: 'mile'
      }
   },
   assigned: {
      status: {
         value: 'WAITING',
         timeStamp: '',
         description: '',
         data: {}
      },
      driverInfo: {
         driverFirstName: '',
         driverLastName: '',
         driverPhone: '',
         driverPicture: ''
      },
      vehicleInfo: {
         vehicleType: '',
         vehicleMake: '',
         vehicleModel: '',
         vehicleColor: '',
         vehicleLicensePlateNumber: '',
         vehicleLicensePlateState: ''
      }
   },
   pickup: {
      window: {
         approved: {}
      },
      status: {
         value: 'WAITING'
      },
      confirmation: {
         photo: {
            data: {},
            isRequired: false
         },
         idProof: {
            data: {},
            isRequired: false
         },
         signature: {
            data: {},
            isRequired: false
         }
      },
      pickupInfo: {
         organizationId: process.env.ORGANIZATION_ID,
         organizationName: '',
         organizationPhone: '',
         organizationEmail: '',
         organizationAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
            latitude: '',
            longitude: ''
         }
      }
   },
   dropoff: {
      status: {
         value: 'WAITING'
      },
      window: {
         approved: {},
         requested: {
            startsAt: '',
            endsAt: ''
         }
      },
      confirmation: {
         photo: {
            data: {},
            isRequired: false
         },
         idProof: {
            data: {},
            isRequired: false
         },
         signature: {
            data: {},
            isRequired: false
         }
      },
      dropoffInfo: {
         customerEmail: '',
         customerPhone: '',
         customerLastName: '',
         customerFirstName: '',
         customerAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipcode: '',
            country: '',
            notes: '',
            label: '',
            landmark: ''
         }
      }
   },
   return: {
      status: {
         value: 'WAITING',
         timeStamp: '',
         description: '',
         data: {}
      },
      window: {
         requested: {
            id: '',
            buffer: '',
            startsAt: '',
            endsAt: ''
         },
         approved: {
            id: '',
            startsAt: '',
            endsAt: ''
         }
      },
      confirmation: {
         photo: {
            isRequired: false,
            data: {}
         },
         signature: {
            isRequired: false,
            data: {}
         },
         idProof: {
            isRequired: false,
            data: {}
         }
      },
      returnInfo: {
         organizationId: process.env.ORGANIZATION_ID,
         organizationName: '',
         organizationPhone: '',
         organizationEmail: '',
         organizationAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            zipcode: '',
            latitude: '',
            longitude: ''
         }
      }
   }
}
