import styled, { css } from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Line = styled.div`
  padding: 6px 10px;
  width: fit-content;

  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  text-align: center;

  border-radius: 8px;

  ${props =>
    props.$noTopRadius &&
    css`
      padding-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    `}

  ${props =>
    props.$noBottomRadius &&
    css`
      padding-bottom: 0;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}
`
