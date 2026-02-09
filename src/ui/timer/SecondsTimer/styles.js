import styled from 'styled-components'

export const TimerWrapper = styled.div`
  font-size: 16px;
  font-weight: normal;
  color: ${(props) => props.$isWhite  ? '#fff' : '#333' };
  line-height: 10px;
`