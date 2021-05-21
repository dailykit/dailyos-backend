const jwt = require('jsonwebtoken')
const axios = require('axios')

const resolvers = {
   Query: {
      workspaces: async (_, args, { root }) => {
         try {
            const { userId = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/list-workspaces'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces.spaces
         } catch (error) {
            return error
         }
      },
      workspaceInfo: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/get-workspace-info'
            }
            const { data: workspace } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return {
               prettyUrl: workspace.vanityUrl,
               tags: workspace.tags
            }
         } catch (error) {
            return error
         }
      },
      workspaceChats: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/download-chats'
            }
            const { data: workspace } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspace
         } catch (error) {
            return error
         }
      },
      getWorkspaceMovement: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '', startTime = 0, endTime = 0 } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid, startTime, endTime }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/get-movement'
            }
            const { data: workspace } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspace.movement
         } catch (error) {
            return error
         }
      },
      workspaceUsers: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/list-users'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces.users
         } catch (error) {
            return error
         }
      },
      workspaceActiveUsers: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/get-active-users'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            return workspaces.users
         } catch (error) {
            return error
         }
      },
      workspaceRecordings: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/list-recordings'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            return workspaces.recordings
         } catch (error) {
            return error
         }
      },
      workspaceRecordingMetaData: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '', recordingId = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid, recordingId }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/recording-metadata'
            }
            const { data: recordingMetaData } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            return recordingMetaData
         } catch (error) {
            return error
         }
      }
   }
}

module.exports = resolvers
