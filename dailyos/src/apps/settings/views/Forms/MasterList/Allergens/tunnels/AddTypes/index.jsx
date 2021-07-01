import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/react-hooks'
import { TunnelHeader, Form, ButtonTile, Flex, Spacer } from '@dailykit/ui'

import { MASTER } from '../../../../../../graphql'
import { logger } from '../../../../../../../../shared/utils'
import { Tooltip } from '../../../../../../../../shared/components'

const address = 'apps.settings.views.forms.allergens.tunnels.addnew.'

const AddTypesTunnel = ({ closeTunnel }) => {
   const { t } = useTranslation()

   const [types, setTypes] = React.useState([''])

   // Mutation
   const [addType, { loading: addingAllergen }] = useMutation(
      MASTER.ALLERGENS.CREATE,
      {
         onCompleted: () => {
            toast.success('Allergens added.')
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Failed to add allergen!')
            logger(error)
         },
      }
   )

   // Handlers
   const onChange = (e, i) => {
      const updatedTypes = types
      const value = e.target.value.trim()
      updatedTypes[i] = value
      setTypes([...updatedTypes])
   }
   const add = () => {
      try {
         const objects = types.filter(Boolean).map(type => ({
            name: type,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         addType({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('add new types'))}
            right={{
               action: add,
               title: 'Add',
               isLoading: addingAllergen,
               disabled: types.filter(Boolean).length === 0,
            }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="tunnel_allergen_heading" />}
         />
         <Flex padding="16px">
            {types.map((type, i) => (
               <>
                  <Form.Group>
                     <Form.Label htmlFor={`type-${i}`} title={`type-${i}`}>
                        Type Name*
                     </Form.Label>
                     <Form.Text
                        value={type}
                        id={`type-${i}`}
                        name={`type-${i}`}
                        onChange={e => onChange(e, i)}
                        placeholder="Enter the allergen name"
                     />
                  </Form.Group>
                  <Spacer size="16px" />
               </>
            ))}
            <ButtonTile
               type="secondary"
               text="Add New Type"
               onClick={() => setTypes([...types, ''])}
            />
         </Flex>
      </>
   )
}

export default AddTypesTunnel
