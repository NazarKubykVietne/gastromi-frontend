import styled, { css } from 'styled-components'

export const ButtonBlock = styled.button`
  margin: 0;
  height: 32px;
  border-radius: 6px;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1);
  word-break: keep-all;

  transition: background-color 0.15s ease;

  color: white;
  outline: none;

  overflow: hidden;
  position: relative;
  text-align: center;
  font-weight: normal;

  font-size: 14px;
  box-sizing: border-box;

  cursor: ${(props) => (props.disabled ? 'arrow' : 'pointer')};
  padding: 0 10px;

  background-color: ${(props) => (props.disabled ? '#4f99d7' : '#2084d8')};

  border: none;

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        background-color: #2c8edf;
      }
    `}
`

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 20px;
  position: relative;
  width: 100%;
  height: 100%;
  word-break: keep-all;
  white-space: nowrap;

  & > *:nth-child(2) {
    margin-left: 10px;
  }
`

export const InlineBlock = styled.div`
  display: inline-block;
  line-height: 20px;
  word-break: keep-all;
  white-space: nowrap;
  svg {
    display: block;
  }
`
