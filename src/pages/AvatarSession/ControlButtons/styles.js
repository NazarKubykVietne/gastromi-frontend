import styled, { css } from 'styled-components'

export const Block = styled.div`
  display: flex;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 4px;

  & > div {
    display: inline-block;
  }
  & > div:first-child {
    margin-right: 4px;
  }
`
