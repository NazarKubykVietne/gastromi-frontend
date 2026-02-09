import React from 'react'

import ButtonFlatIcon from 'ui/buttons/ButtonFlatIcon'
import { Block } from './styles'

const ControlButtons = ({ micOn, onClose, onMicOn, onMicOff }) => {
  const micTitleOn = 'Ieslēgt'
  const micTitleOff = 'Izslēdziet'
  const closeText = 'Beigt'

  const handleMic = () => {
    const bool = !micOn
    if (bool) {
      onMicOn()
    } else {
      onMicOff()
    }
  }

  return (
    <Block>
      <div>
        <ButtonFlatIcon
          value={micOn ? micTitleOff : micTitleOn}
          iconMicOff={!micOn}
          iconMicOn={micOn}
          onClick={handleMic}
        />
      </div>
      <div>
        <ButtonFlatIcon
          value={closeText}
          isGrey
          isIconRed
          iconExit
          onClick={onClose}
        />
      </div>
    </Block>
  )
}

export default ControlButtons
