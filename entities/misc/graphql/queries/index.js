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

export const GET_PAYMENT_SETTINGS = `
query storeSettings($brandId: Int!) {
   paymentSettings: storeSettings(where: {type: {_eq: "availability"}, identifier: {_eq: "Store Live"}}) {
     value
     brandSettings(where: {brandId: {_eq: $brandId}}) {
       value
     }
   }
 }
`

export const GET_CUSTOMER = `
query Customer($keycloakId: String!) {
   customer(keycloakId: $keycloakId) {
     isTest
   }
 }
`
