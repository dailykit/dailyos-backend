const jwt = require('jsonwebtoken')
const axios = require('axios')

const resolvers = {
   Mutation: {
      ohyay_createInvites: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '', invites = [] } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid, invites }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/create-invites'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces.links
         } catch (error) {
            return error
         }
      },
      ohyay_cloneWorkspace: async (_, args, { root }) => {
         try {
            const { cloneWorkspace = {} } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign(
               {
                  userId: cloneWorkspace.userId,
                  wsid: cloneWorkspace.wsid,
                  title: cloneWorkspace.title,
                  region: cloneWorkspace.region,
                  editors: cloneWorkspace.editor,
                  tags: cloneWorkspace.tags,
                  tagsToRemove: cloneWorkspace.tagsToRemove
               },
               apiKey
            )
            let url
            if (Object.keys(cloneWorkspace).length) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/clone-workspace'
            }
            const { data: workspaces } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return workspaces
         } catch (error) {
            return error
         }
      },
      ohyay_deleteWorkspace: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/delete-workspace'
            }
            const { data } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return data
         } catch (error) {
            return error
         }
      },
      ohyay_createPrettyUrl: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '', urlPath = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid, urlPath }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/set-vanity-url'
            }
            const { data } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })

            return {
               prettyUrl: 'https://ohyay.co/s/' + urlPath
            }
         } catch (error) {
            return error
         }
      },
      ohyay_clearPrettyUrl: async (_, args, { root }) => {
         try {
            const { userId = '', wsid = '' } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign({ userId, wsid }, apiKey)
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/clear-vanity-url'
            }
            const { data, status } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            if (status === 200) {
               return {
                  success: true
               }
            } else {
               return {
                  success: false
               }
            }
         } catch (error) {
            return error
         }
      },
      ohyay_updateUsers: async (_, args, { root }) => {
         try {
            const { updateUsersInput = {} } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign(
               {
                  userId: updateUsersInput.userId,
                  wsid: updateUsersInput.wsid,
                  editorsToRemove: updateUsersInput.editorsToRemove,
                  editorsToAdd: updateUsersInput.editorsToAdd,
                  tagUpdates: updateUsersInput.tagUpdates
               },
               apiKey
            )
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/update-users'
            }
            const { data, status } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            if (status === 200) {
               return {
                  success: true
               }
            } else {
               return {
                  success: false
               }
            }
         } catch (error) {
            return error
         }
      },
      ohyay_updateWorkspaceInfo: async (_, args, { root }) => {
         try {
            const {
               userId = '',
               wsid = '',
               tagsToAdd = [],
               tagsToRemove = []
            } = args
            const apiKey = process.env.OHYAY_API_KEY
            const token = jwt.sign(
               {
                  userId,
                  wsid,
                  tagsToAdd,
                  tagsToRemove
               },
               apiKey
            )
            let url
            if (userId) {
               url =
                  'https://us-central1-ohyay-prod-d7acf.cloudfunctions.net/ohyayapi/update-workspace-info'
            }
            const { data, status } = await axios({
               url,
               method: 'POST',
               headers: {
                  'Content-Type': 'text/plain'
               },
               data: token
            })
            if (status === 200) {
               return {
                  success: true
               }
            } else {
               return {
                  success: false
               }
            }
         } catch (error) {
            return error
         }
      }
   }
}

module.exports = resolvers
