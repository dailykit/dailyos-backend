import NextAuth from 'next-auth'
import { GraphQLClient } from 'graphql-request'
import Providers from 'next-auth/providers'
import bcrypt from 'bcrypt'
import { getRoute } from '../../../utils'

const client = new GraphQLClient(process.env.DATA_HUB_HTTPS, {
   headers: {
      'x-hasura-admin-secret': process.env.ADMIN_SECRET,
   },
})

const PROVIDERS = `
   query providers {
      providers: settings_authProvider {
         title
         value
      }
   }
`

const CUSTOMERS = `
   query customers($where: platform_customer__bool_exp = {}) {
      customers: platform_customer_(where: $where) {
         email
         password
         id: keycloakId
      }
   }
`

const INSERT_CUSTOMER = `
   mutation insertCustomer($object: platform_customer__insert_input!) {
      insertCustomer: insert_platform_customer__one(object: $object) {
         id: keycloakId
      }
   }
`

const auth = {
   credentials: {
      id: 'email_password',
      name: 'Credentials',
      credentials: {
         email: { label: 'Email', type: 'text' },
         password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
         try {
            const { customers = [] } = await client.request(CUSTOMERS, {
               where: { email: { _eq: credentials.email } },
            })

            if (customers.length > 0) {
               const [customer] = customers
               const matches = await bcrypt.compare(
                  credentials.password,
                  customer.password
               )
               if (matches) {
                  return customer
               }
               return null
            }

            return null
         } catch (error) {
            console.error(error)
            return null
         }
      },
   },
   otp: {
      id: 'otp',
      name: 'OTP',
      credentials: {
         phone: { label: 'Phone Number', type: 'text' },
         otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
         try {
            const { otps = [] } = await client.request(OTPS, {
               where: { phoneNumber: { _eq: credentials.phone } },
            })

            if (otps.length > 0) {
               const [otp] = otps
               if (Number(credentials.otp) === otp.code) {
                  const { insertCustomer = {} } = await client.request(
                     INSERT_CUSTOMER,
                     { object: { phoneNumber: credentials.phone } }
                  )
                  return insertCustomer
               }
               return null
            }

            return null
         } catch (error) {
            console.error(error)
            return null
         }
      },
   },
}

let providers = []

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
   if (providers.length === 0) {
      providers.push(Providers.Credentials(auth.credentials))
      providers.push(Providers.Credentials(auth.otp))

      const data = await client.request(PROVIDERS)

      if (data.providers.length > 0) {
         data.providers.forEach(provider => {
            if (provider.title === 'google') {
               providers.push(Providers.Google(provider.value))
            }
         })
      }
   }

   return NextAuth(req, res, {
      providers,
      pages: { signIn: getRoute('/login') },
      callbacks: {
         async signIn(user, account, profile) {
            let customer = {}
            if (account.type === 'oauth') {
               const name = user.name.split(' ')
               const { 0: firstName = '', [name.length - 1]: lastName = '' } =
                  name
               customer.firstName = firstName
               customer.lastName = lastName
               customer.email = user.email
               customer.image = user.image
            }

            console.log(account.type, { customer })

            await client.request(INSERT_PROVIDER_CUSTOMER, {
               object: {
                  providerType: account.type,
                  providerAccountId: user.id || null,
                  provider: account.provider || 'credentials',
                  ...(account.type === 'credentials' && {
                     customerId: user.id,
                  }),
                  ...(Object.keys(customer).length > 0 && {
                     customer: { data: customer },
                  }),
               },
            })
            return true
         },
         async session(session, token) {
            session.user.id = token.sub
            return session
         },
      },
   })
}

const OTPS = `
   query otps($where: platform_otp_transaction_bool_exp = {}) {
      otps: platform_otp_transaction(where: $where, order_by: {created_at: desc}) {
         id
         code
      }
   }
`

const INSERT_PROVIDER_CUSTOMER = `
   mutation insertProviderCustomer(
      $object: platform_provider_customer_insert_input!
   ) {
      insertProviderCustomer: insert_platform_provider_customer_one(
         on_conflict: { constraint: provider_customer_pkey, update_columns: [] }
         object: $object
      ) {
         id
      }
   }
`
