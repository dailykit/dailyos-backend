export const GET_REMINDER_SETTINGS = `
    query getReminderSettings($id: Int!){
        subscriptionOccurences(where: {id: {_eq: $id}}) {
            subscription {
                reminderSettings
            }
        }
    }
`
