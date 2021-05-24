import axios from 'axios'
import { stayInClient } from '../../lib/graphql'
import {
   EXPERIENCE_INFO,
   CLONE_WORKSPACE,
   UPDATE_EXPERIENCE_CLASS
} from './graphql'

export const cloneWorkspace = async (req, res) => {
   try {
      const { id, experienceId } = req.body.event.data.new
      const ohyay_userId = req.header('ohyay_userId')
      const { experiences_experience_by_pk: experience } =
         await stayInClient.request(EXPERIENCE_INFO, {
            id: experienceId
         })

      if (experience && experience.ohyay_wsid) {
         const { ohyay_cloneWorkspace: cloneWorkspace } =
            await stayInClient.request(CLONE_WORKSPACE, {
               cloneWorkspaceInp: {
                  userId: ohyay_userId,
                  wsid: experience.ohyay_wsid,
                  title: `experienceClass-${id}`,
                  region: 'us-east'
               }
            })
         if (cloneWorkspace && cloneWorkspace.wsid) {
            const {
               update_experiences_experienceClass_by_pk: updatedExperience
            } = await stayInClient.request(UPDATE_EXPERIENCE_CLASS, {
               id,
               ohyay_wsid: cloneWorkspace.wsid
            })
            if (updatedExperience) {
               return res.status(200).json({
                  success: true,
                  message: `Successfully cloned workspace:${experience.ohyay_wsid}`
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
