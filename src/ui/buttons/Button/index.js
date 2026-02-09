import React from 'react'
import Loader from 'ui/Loader'

import { ButtonBlock, InlineBlock, Content } from './styles'

const Button = ({ value, loader, isSubmit, disabled, onClick }) => {
  return (
    <ButtonBlock
      type={isSubmit ? 'submit' : 'button'}
      disabled={disabled}
      onClick={onClick}
    >
      <Content>
        {loader ? (
          <InlineBlock>
            <Loader type={1} />
          </InlineBlock>
        ) : null}
        <InlineBlock>{value}</InlineBlock>
      </Content>
    </ButtonBlock>
  )
}

export default Button
