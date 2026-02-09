import React from 'react'

import IconLogo from 'ui/icons/IconLogo'
import { Block } from './styles'

const Header = ({ black }) => (
  <Block black={black}>
    <IconLogo />
  </Block>
)

export default Header
