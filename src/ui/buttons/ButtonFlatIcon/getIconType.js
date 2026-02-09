import React from 'react'

import IconMicrofoneOn from 'ui/icons/IconMicrofoneOn'
import IconMicrofoneOff from 'ui/icons/IconMicrofoneOff'
import IconExit from 'ui/icons/IconExit'

function getIconElem(props) {
  if (props.iconMicOff) {
    return <IconMicrofoneOff />
  }
  if (props.iconMicOn) {
    return <IconMicrofoneOn />
  }
  if (props.iconExit) {
    return <IconExit />
  }
  return null
}

export default function getIconType(props) {
  return getIconElem(props)
}
