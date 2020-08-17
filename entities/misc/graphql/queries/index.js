export const ORGANIZATION = `query organizations($organizationUrl: String_comparison_exp!) {
    organizations(where: {organizationUrl: $organizationUrl}) {
      id
    }
}`

export const GET_SES_DOMAIN = `
query aws_ses {
  aws_ses {
    domain
    keySelector
    privateKey
    isVerified
  }
}
`
