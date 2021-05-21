const { gql } = require('apollo-server-express')

// getFolderWithFiles(path: String): FolderWithFiles
// getNestedFolders(path: String): Folder
// getFiles(path: String!, offset: Int, limit: Int): [File]!
// getFile(path: String!): File
// getCommitLog(path: String!): [Commit]
// getCommits(path: String!, commits: [String]!): [Commit]
// getCommit(id: String!, path: String!): Commit
// getCommitContent(id: String!, path: String!): String
// openFile(path: String!): File
const typeDefs = gql`
   type Query {
      workspaces(userId: String!): [Workspace]!
      workspaceUsers(userId: String!, wsid: String!): [User]!
      workspaceActiveUsers(userId: String!, wsid: String!): [ActiveUser]!
   }
`

module.exports = typeDefs
