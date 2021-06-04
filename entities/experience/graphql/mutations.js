export const SEND_EMAIL = `
mutation SEND_EMAIL($emailInput: EmailInput!, $inviteInput: InviteInput!) {
   sendEmail(emailInput: $emailInput, inviteInput: $inviteInput) {
     message
     success
   }
 }

`
export const CREATE_INVITE = `
mutation CREATE_INVITE($userId: String!, $wsid: String!, $invites: [Invite]!) {
    ohyay_createInvites(userId: $userId, wsid: $wsid, invites: $invites){
      inviteUrl
    }
  }
`
