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

export const BRAND_SETTINGS = `
   query storeSettings($brandId: Int!) {
      storeSettings: brands_brand_storeSetting(
         where: {
            brandId: { _eq: $brandId }
            onDemandSetting: {
               type: { _eq: "availability" }
               identifier: { _eq: "Store Live" }
            }
         }
      ) {
         isStoreLive: value(path: "isStoreLive")
         isStripeConfigured: value(path: "isStripeConfigured")
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
