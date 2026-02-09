import { createGlobalStyle } from 'styled-components'

// 'Roboto', sans-serif;
// eslint-disable-next-line import/prefer-default-export
export const GlobalStyle = createGlobalStyle`
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    text-rendering: optimizeLegibility;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue","Ubuntu";
  }

  html, body {
    background-color: white;
    font-size: 14px;
    line-height: normal;
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }
  b {
    font-weight: 600;
  }

`
