import React, { useMemo } from 'react'
import { Wrapper, Line } from './styles'

const splitByMaxLength = (text, maxLen) => {
  const t = String(text ?? '').trim()
  if (!t) return ['']
  if (!maxLen || t.length <= maxLen) return [t]

  const lines = []
  let remaining = t

  while (remaining.length > maxLen) {
    const chunk = remaining.slice(0, maxLen)

    // 1) Последняя точка/запятая в пределах chunk
    let cut = Math.max(chunk.lastIndexOf('.'), chunk.lastIndexOf(','))

    // 2) Иначе по последнему пробелу
    if (cut === -1) cut = chunk.lastIndexOf(' ')

    // 3) Иначе жёстко по maxLen
    if (cut === -1) cut = maxLen - 1

    // Если попали на '.' или ',', оставляем знак в первой строке
    const keepPunct = remaining[cut] === '.' || remaining[cut] === ','
    const leftEnd = keepPunct ? cut + 1 : cut + 1

    const left = remaining.slice(0, leftEnd).trim()
    const right = remaining.slice(leftEnd).trim()

    if (!left) {
      lines.push(remaining.slice(0, maxLen).trim())
      remaining = remaining.slice(maxLen).trim()
      continue
    }

    lines.push(left)
    remaining = right
  }

  if (remaining) lines.push(remaining)
  return lines
}

const OverlayText = ({ text, maxLineLength = 60 }) => {
  const lines = useMemo(
    () => splitByMaxLength(text, maxLineLength),
    [text, maxLineLength]
  )

  return (
    <Wrapper>
      {lines.map((line, i) => {
        const prev = i > 0 ? lines[i - 1] : null
        const next = i < lines.length - 1 ? lines[i + 1] : null

        const noTopRadius = prev != null && prev.length > line.length
        const noBottomRadius = next != null && next.length > line.length

        return (
          <Line
            key={i}
            $noTopRadius={noTopRadius}
            $noBottomRadius={noBottomRadius}
          >
            {line}
          </Line>
        )
      })}
    </Wrapper>
  )
}

export default OverlayText
