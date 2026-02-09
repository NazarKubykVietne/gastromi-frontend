import styled, { keyframes } from 'styled-components'

const spinAnim = keyframes`
  0% {
    transform: rotate(0deg); 
  }
  100% {
    transform: rotate(360deg); 
  }
`

export const Loader1 = styled.div`
  box-sizing: content-box;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: ${spinAnim} 0.8s linear infinite;
`
