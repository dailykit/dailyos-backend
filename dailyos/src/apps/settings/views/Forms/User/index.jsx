import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, HelperText, Form, Flex } from '@dailykit/ui'

import validate from './validator'
import { USERS } from '../../../graphql'
import { Section, StyledTemp } from './styled'
import { initialState, reducers } from './store'
import { logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import {
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../shared/components'

const UserForm = () => {
   const params = useParams()
   const { tab, addTab } = useTabs()
   const [isValid, setIsValid] = React.useState(false)
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const [updateUser, { loading: updatingUser }] = useMutation(USERS.UPDATE, {
      onCompleted: () => {
         toast.success('Updated user successfully!')
      },
      onError: error => {
         logger(error)
         toast.error('Could not delete user, please try again!')
      },
   })
   const {
      error,
      loading,
      data: { settings_user_by_pk: user = {} } = {},
   } = useSubscription(USERS.USER, {
      variables: { id: params.id },
   })

   React.useEffect(() => {
      if (!tab && !loading && user?.id) {
         addTab(
            `${user.firstName} ${user.lastName || ''}`,
            `/settings/users/${user.id}`
         )
      }
   }, [tab, loading, addTab, user])

   React.useEffect(() => {
      if (!loading && !isEmpty(user)) {
         const { email, phoneNo, lastName, firstName } = user

         dispatch({
            type: 'SET_FIELD',
            payload: { field: 'firstName', value: firstName || '' },
         })
         dispatch({
            type: 'SET_FIELD',
            payload: { field: 'lastName', value: lastName || '' },
         })
         dispatch({
            type: 'SET_FIELD',
            payload: { field: 'phoneNo', value: phoneNo || '' },
         })
         dispatch({
            type: 'SET_FIELD',
            payload: { field: 'email', value: email || '' },
         })
      }
   }, [loading, user])

   React.useEffect(() => {
      if (
         validate.firstName(state.firstName.value).isValid &&
         validate.lastName(state.lastName.value).isValid &&
         validate.email(state.email.value).isValid &&
         validate.phoneNo(state.phoneNo.value).isValid
      ) {
         setIsValid(true)
      } else {
         setIsValid(false)
      }
   }, [state])

   const createUser = () => {
      updateUser({
         variables: {
            id: user.id,
            _set: {
               firstName: state.firstName.value,
               lastName: state.lastName.value,
               phoneNo: state.phoneNo.value,
               ...(!user?.email && { email: state.email.value }),
            },
         },
      })
   }

   const onChange = e => {
      const { name, value } = e.target
      dispatch({
         type: 'SET_FIELD',
         payload: { field: name, value },
      })
   }

   const onBlur = e => {
      const { name, value } = e.target
      if (!(name in validate)) return
      dispatch({
         type: 'SET_ERRORS',
         payload: {
            field: name,
            value: {
               isTouched: true,
               errors: validate[name](value).errors,
               isValid: validate[name](value).isValid,
            },
         },
      })
   }

   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      toast.error('Failed to fetch user details!')
      return <ErrorState message="Failed to fetch user details!" />
   }
   return (
      <Flex padding="0 32px">
         <Flex
            container
            as="header"
            height="80px"
            margin="0 auto"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">User Details</Text>
               <Tooltip identifier="form_user_heading" />
            </Flex>
            <TextButton
               type="solid"
               disabled={!isValid}
               isLoading={updatingUser}
               onClick={() => createUser()}
            >
               Save
            </TextButton>
         </Flex>
         <div>
            <Section>
               <Form.Group>
                  <Flex container alignItems="center">
                     <Form.Label htmlFor="firstName" title="firstName">
                        First Name*
                     </Form.Label>
                     <Tooltip identifier="form_user_field_firstname" />
                  </Flex>
                  <Form.Text
                     id="firstName"
                     name="firstName"
                     onBlur={onBlur}
                     onChange={onChange}
                     value={state.firstName.value}
                     placeholder="Enter the first name"
                     hasError={
                        state.firstName.meta.isTouched &&
                        !state.firstName.meta.isValid
                     }
                  />
                  {state.firstName.meta.isTouched &&
                     !state.firstName.meta.isValid &&
                     state.firstName.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
               <Form.Group>
                  <Flex container alignItems="center">
                     <Form.Label htmlFor="lastName" title="lastName">
                        Last Name*
                     </Form.Label>
                     <Tooltip identifier="form_user_field_lastname" />
                  </Flex>
                  <Form.Text
                     id="lastName"
                     name="lastName"
                     onBlur={onBlur}
                     onChange={onChange}
                     value={state.lastName.value}
                     placeholder="Enter the last name"
                     hasError={
                        state.lastName.meta.isTouched &&
                        !state.lastName.meta.isValid
                     }
                  />
                  {state.lastName.meta.isTouched &&
                     !state.lastName.meta.isValid &&
                     state.lastName.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Section>
            <Section>
               <Form.Group>
                  <Flex container alignItems="center">
                     <Form.Label htmlFor="email" title="email">
                        Email*
                     </Form.Label>
                     <Tooltip identifier="form_user_field_email" />
                  </Flex>
                  <Form.Text
                     id="email"
                     name="email"
                     onBlur={onBlur}
                     onChange={onChange}
                     disabled={user?.email}
                     value={state.email.value}
                     placeholder="Enter the email"
                     hasError={
                        state.email.meta.isTouched && !state.email.meta.isValid
                     }
                  />
                  {state.email.meta.isTouched &&
                     !state.email.meta.isValid &&
                     state.email.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Form.Group>
                  <Flex container alignItems="center">
                     <Form.Label htmlFor="phoneNo" title="phoneNo">
                        Phone Number*
                     </Form.Label>
                     <Tooltip identifier="form_user_field_phoneNo" />
                  </Flex>
                  <Form.Text
                     id="phoneNo"
                     name="phoneNo"
                     onBlur={onBlur}
                     onChange={onChange}
                     value={state.phoneNo.value}
                     placeholder="Enter the phone number"
                     hasError={
                        state.phoneNo.meta.isTouched &&
                        !state.phoneNo.meta.isValid
                     }
                  />
                  <Form.Hint>Eg. 123 456 7890</Form.Hint>
                  {state.phoneNo.meta.isTouched &&
                     !state.phoneNo.meta.isValid &&
                     state.phoneNo.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Section>
            <StyledTemp>
               <span>Temporary Password</span>
               <span>{user?.tempPassword}</span>
               <HelperText
                  type="hint"
                  message="This is a first time login password, then the user will be asked to set new password."
               />
            </StyledTemp>
         </div>
      </Flex>
   )
}

export default UserForm
