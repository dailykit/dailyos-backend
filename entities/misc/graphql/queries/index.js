export const ORGANIZATION = `query organizations($organizationUrl: String_comparison_exp!) {
    organizations(where: {organizationUrl: $organizationUrl}) {
      id
    }
}`

export const GET_SES_DOMAIN = `
query aws_ses($domain: String!) {
  aws_ses(where: {domain: {_eq: $domain}}) {
    domain
    keySelector
    privateKey
    isVerified
  }
}
`
