import axios from 'axios'
import {
   EXPERIENCE_CLASS_INFO,
   SEND_EMAIL,
   CREATE_INVITE,
   WORKSPACE_RECORDINGS,
   WORKSPACE_RECORDING_METADATA
} from './graphql'
import { stayInClient } from '../../lib/graphql'
import { getDuration, getDateIntArray } from '../../utils'

export const experienceBookingEmail = async (req, res) => {
   try {
      const { id, experienceBookingId, email, rsvp } = req.body.event.data.new
      console.log('body', req.body.event.data.new)
      const ohyay_userId = req.header('ohyay_userId')
      if (email && rsvp) {
         const { experiences_experienceClass: experienceClass = [] } =
            await stayInClient.request(EXPERIENCE_CLASS_INFO, {
               where: {
                  experienceBookings: {
                     id: {
                        _eq: experienceBookingId
                     }
                  }
               }
            })
         console.log('experience:', experienceClass)
         const { ohyay_createInvites } = await stayInClient.request(
            CREATE_INVITE,
            {
               userId: ohyay_userId,
               wsid: experienceClass[0].ohyay_wsid,
               invites: [{}]
            }
         )
         console.log('invites:', ohyay_createInvites)
         if (ohyay_createInvites.inviteUrl.length > 0) {
            const { sendEmail } = await stayInClient.request(SEND_EMAIL, {
               emailInput: {
                  subject: `${experienceClass[0].experience.title} Booking URL`,
                  to: email,
                  from: 'test@dailykit.org',
                  html: `<h2>Hey Your Booking URL for the ${experienceClass[0].experience.title} experience is given below </h2><br><p>Experince Class joining url:${ohyay_createInvites.inviteUrl[0]}</p>`,
                  attachments: []
               },
               inviteInput: {
                  start: getDateIntArray(experienceClass[0].startTimeStamp),
                  duration: getDuration(experienceClass[0].duration),
                  title: experienceClass[0].experience.title,
                  description: experienceClass[0].experience.description,
                  url: ohyay_createInvites.inviteUrl[0],
                  status: 'CONFIRMED',
                  busyStatus: 'BUSY',
                  organizer: {
                     name: 'Admin',
                     email
                  }
               }
            })
            console.log('sendEmail:', sendEmail)
            if (sendEmail.success) {
               return res.status(200).json({
                  success: true,
                  message: `Successfully send the booking url`
               })
            }
         }
      }
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

export const storeWorkspaceMetaDetails = async (req, res) => {
   try {
      // const { id, experienceBookingId, email, rsvp } = req.body.event.data.new
      const { ohyay_workspaceRecordings: recordings = [] } =
         await stayInClient.request(WORKSPACE_RECORDINGS, {
            userId: 'u_AVUK0yYAfWbfd9dFtJhW7Aen2Fw2',
            wsid: 'ws_d0GxIO_M'
         })
      recordings.forEach(async recording => {
         const { ohyay_workspaceRecordingMetaData: metaData = {} } =
            await stayInClient.request(WORKSPACE_RECORDING_METADATA, {
               userId: 'u_AVUK0yYAfWbfd9dFtJhW7Aen2Fw2',
               wsid: 'ws_d0GxIO_M',
               recordingId: recording.recordingId
            })
         console.log(metaData)
      })
      console.log(recordings)
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}
