const { gql } = require('apollo-server-express')
const typeDefs = gql`
   type Query {
      workspaces(userId: String!): [Workspace]!
      workspaceInfo(userId: String!, wsid: String!): WorkspaceInfo!
      workspaceUsers(userId: String!, wsid: String!): [User]!
      workspaceActiveUsers(userId: String!, wsid: String!): [ActiveUser]!
      workspaceRecordings(userId: String!, wsid: String!): [Recording]!
      workspaceRecordingMetaData(
         userId: String!
         wsid: String!
         recordingId: String!
      ): RecordingMetaData!
      workspaceChats(userId: String!, wsid: String!): WorkspaceChat!
      getWorkspaceMovement(
         userId: String!
         wsid: String!
         startTime: Float!
         endTime: Float!
      ): [WorkspaceMovement]!
   }
`

module.exports = typeDefs
