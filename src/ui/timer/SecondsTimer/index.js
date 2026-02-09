import React, { useState, useEffect } from 'react'

import { TimerWrapper } from './styles'

export default function SecondsTimer({ isWhite }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (totalSeconds) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
    const secs = String(totalSeconds % 60).padStart(2, '0')
    return `${mins}:${secs}`
  }

  return <TimerWrapper $isWhite={isWhite}>{formatTime(seconds)}</TimerWrapper>
}
