import React, { useState } from 'react'

import SecondsTimer from 'ui/timer/SecondsTimer'
import IconX from 'ui/icons/IconX'
import { Block, Title, TimerBlock, ButtonClose } from './styles'

const ButtonTimerClose = ({ onClick }) => {
  const [isOver, setOver] = useState(false)
  const handleOver = () => {
    setOver(true)
  }
  const handleOut = () => {
    setOver(false)
  }

  return (
    <Block>
      <div>
        {isOver ? <Title>Beigt sesiju</Title> : null}
        <TimerBlock hidden={isOver}>
          <SecondsTimer />
        </TimerBlock>
      </div>
      <ButtonClose
        onClick={onClick}
        onMouseOver={handleOver}
        onMouseLeave={handleOut}
      >
        <IconX />
      </ButtonClose>
    </Block>
  )
}

export default ButtonTimerClose
