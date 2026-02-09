import styled, { css } from 'styled-components'

export const ButtonBlock = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;

  margin: 0;
  height: 32px;
  border-radius: 6px;
  word-break: keep-all;

  transition: background-color 0.15s ease;

  color: ${(props) => props.textColor || 'white'};
  outline: none;
  border: none;

  overflow: hidden;
  position: relative;
  font-weight: normal;

  font-size: 16px;
  box-sizing: border-box;

  cursor: ${(props) => (props.disabled ? 'arrow' : 'pointer')};
  padding: 2px 12px;

  background-color: ${(props) => (props.isGrey ? '#ececec' : 'white')};

  &:hover {
    ${(props) =>
      !props.disabled &&
      props.$isGrey &&
      css`
        background-color: #e0e0e0;
      `};
    ${(props) =>
      !props.disabled &&
      !props.$isGrey &&
      css`
        background-color: #e5e5e5;
      `};
  }
  &:active {
    background-color: #d9d9d9;
  }

  ${(props) =>
    props.disabled
      ? css`
          opacity: 0.8;
        `
      : null}
`

export const Icon = styled.div`
  width: 20px;
  display: inline-flex;
  justify-content: center;
  svg {
    display: block;
  }
  .fillArea {
    fill: ${(props) => (props.$isRed ? '#FF0000' : '#444')};
  }
  .strokeArea {
    stroke: ${(props) => (props.$isRed ? '#FF0000' : '#444')};
  }
`

export const Text = styled.div`
  text-size: 16px;
  color: #444;
`
