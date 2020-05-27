export const ORGANIZATION = `query organizations($organizationUrl: String_comparison_exp!) {
    organizations(where: {organizationUrl: $organizationUrl}) {
      id
    }
}`
