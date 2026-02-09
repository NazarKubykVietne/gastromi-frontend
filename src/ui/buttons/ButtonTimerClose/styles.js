import styled from 'styled-components'

export const Block = styled.div`
  margin: 0;
  padding: 2px 12px 2px 14px;
  height: 32px;
  border-radius: 20rem;
  background: #fff;

  display: flex;
  width: fit-content;
  align-items: center;
  & > div {
    display: inline-block;
  }
  & > *:first-child {
    margin-right: 8px;
    margin-bottom: 2px;
  }
`

export const Title = styled.div`
  font-size: 15px;
  color: black;
`

export const TimerBlock = styled.div`
  display: ${(props) => props.hidden ? 'none' : 'auto'};
`

export const ButtonClose = styled.button`
  outline: none;
  border: none;
  background: #fff;
  cursor: pointer;
  padding: 4px;
  background: transparent;
  svg {
    display: block;
  }
  .fillArea {
    fill: #28201b;
  }
  :hover {
    .fillArea {
      fill: #000;
    }
  }
  :active {
    .fillArea {
      fill: #444;
    }
  }
`
