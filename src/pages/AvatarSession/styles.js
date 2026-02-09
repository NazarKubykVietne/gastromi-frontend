import styled from 'styled-components'

export const VideoContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden; /* важно: чтобы обрезать выходящее видео */
`

export const VideoEl = styled.video`
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  object-fit: contain;
  object-position: center; /* центрирование */

  /* мобильная версия */
  @media (max-width: 768px) {
    object-fit: cover;      /* заполняем экран */
    object-position: calc(50% - 40px) center;
  }
`

export const ImageEl = styled.img`
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  object-fit: contain;
  object-position: center; /* центрирование */

  /* мобильная версия */
  @media (max-width: 768px) {
    object-fit: cover;      /* заполняем экран */
    object-position: calc(50% - 40px) center;
  }
`

export const VideoBlock = styled.div`
  position: absolute;
  z-index: 999;
  inset: 0;
  background: #1e1e1e;

  height: 100dvh; /* современная мобильная высота */
  /* fallback можно оставить если хочешь */
`

export const MicButton = styled.div`
  position: absolute;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  left: 0;
  right: 0;

  bottom: calc(15px + env(safe-area-inset-bottom));
  padding: 0 12px; /* чтобы текст/кнопки не упирались в края на мобиле */
`

export const ControlsContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
`

export const LogoBlock = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
`

export const VideoTimer = styled.div`
  position: absolute;
  z-index: 900;
  width: fit-content;
  top: 0;
  right: 0;
  padding: 15px;
`

export const ButtonsContent = styled.div`
  position: absolute;
  z-index: 900;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
`
