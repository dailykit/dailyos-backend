import React from 'react'
import RichTextEditor from 'react-rte'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { Spacer, TunnelHeader, Form } from '@dailykit/ui'

import { Flex, Tooltip } from '../../../../../../shared/components'

export const RichTextEditorTunnel = ({
   title,
   text,
   update,
   settingId,
   closeTunnel,
}) => {
   const [value, setValue] = React.useState(
      text
         ? RichTextEditor.createValueFromString(text, 'html')
         : RichTextEditor.createEmptyValue()
   )

   const updateSetting = () => {
      update({ id: settingId, value: { value: value.toString('html') } })
      closeTunnel(1)
   }

   return (
      <>
         <TunnelHeader
            title={title}
            right={{ action: updateSetting, title: 'Save' }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="brand_rich_text_editor" />}
         />
         <Flex padding="16px">
            <RichTextEditor value={value} onChange={value => setValue(value)} />
         </Flex>
      </>
   )
}
