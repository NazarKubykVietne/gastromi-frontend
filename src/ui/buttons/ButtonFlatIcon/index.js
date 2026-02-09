import React from 'react'

import getIconType from './getIconType'
import { ButtonBlock, Icon, Text } from './styles'

const ButtonFlatIcon = (props) => {
  const { value, isIconRed, isGrey, disabled, onClick } = props
  const iconElem = getIconType(props, isIconRed)

  return (
    <ButtonBlock $isGrey={isGrey} disabled={disabled} onClick={onClick}>
      <Icon $isRed={isIconRed}>{iconElem}</Icon>
      <Text>{value}</Text>
    </ButtonBlock>
  )
}

export default ButtonFlatIcon
