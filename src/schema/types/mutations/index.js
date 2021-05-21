const { gql } = require('apollo-server-express')

const mutations = gql`
   type Mutation {
      createInvites(userId: String!, wsid: String!, invites: [Invite]): [String]
      cloneWorkspace(cloneWorkspace: CloneWorkspaceInput): CloneWorkspace
      deleteWorkspace(userId: String!, wsid: String!): Result
      createPrettyUrl(
         userId: String!
         wsid: String!
         urlPath: String!
      ): PrettyUrl
      ClearPrettyUrl(userId: String!, wsid: String!): ClearPrettyUrl
      updateUsers(updateUserInput: UpdateUserInput): UpdateUser
      updateWorkspaceInfo(
         userId: String!
         wsid: String!
         tagsToAdd: [String]!
         tagsToRemove: [String]!
      ): UpdateWorkspaceInfo
   }
`

module.exports = mutations
