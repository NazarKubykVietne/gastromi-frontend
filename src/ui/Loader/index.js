import React, { useState, useEffect, useRef } from 'react'

import { Loader1 } from './styles'

const Loader = ({ delay }) => {
  const [show, setShow] = useState(!delay > 0)
  const timer = useRef(null)

  const handleShow = () => {
    setShow(true)
  }

  useEffect(() => {
    if (delay > 0) {
      timer.current = setTimeout(handleShow, delay)
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [delay])

  if (!show) return null

  return <Loader1 />
}

export default Loader
