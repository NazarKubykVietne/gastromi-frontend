import React, { useEffect, useRef, useState } from 'react'
import { Room } from 'livekit-client'

export default function LiveAvatarFull() {
  const videoRef = useRef(null)
  const audioContainerRef = useRef(null)

  const [session, setSession] = useState(null)
  const [room, setRoom] = useState(null)
  const [text, setText] = useState('Hello! I am your avatar. How can I help you today?')
  const [error, setError] = useState('')

  const apiBase = ''

  async function start() {
    setError('')

    const r = await fetch(`${apiBase}/api/liveavatar/session/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ })
    })

    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Failed to start session')

    const lkRoom = new Room({ adaptiveStream: true, dynacast: true })

    // ВАЖНО: слушаем server events (agent-response)
    lkRoom.on('dataReceived', (payload, participant, kind, topic) => {
      if (topic !== 'agent-response') return
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload))
        console.log('[agent-response]', msg)
      } catch {}
    })

    lkRoom.on('participantConnected', (p) => {
      console.log('participantConnected', p.identity)
    })

    lkRoom.on('trackSubscribed', (track, pub, participant) => {
      console.log('trackSubscribed', track.kind, pub.trackSid, 'from', participant.identity)

      if (track.kind === 'video' && videoRef.current) {
        track.attach(videoRef.current)
      }

      if (track.kind === 'audio') {
        // САМЫЙ НАДЁЖНЫЙ СПОСОБ: пусть SDK создаст <audio> сам
        const el = track.attach()
        el.autoplay = true
        el.muted = false
        el.volume = 1

        // добавим в DOM
        if (audioContainerRef.current) {
          audioContainerRef.current.appendChild(el)
        }

        // попробуем принудительно play() (после user gesture это должно работать)
        el.play?.().catch((e) => console.warn('audio play blocked', e))
      }
    })

    lkRoom.on('trackUnsubscribed', (track) => {
      try { track.detach() } catch {}
    })

    await lkRoom.connect(data.livekitUrl, data.livekitToken)

    console.log('connected. remoteParticipants:', lkRoom.remoteParticipants.size)

    setSession(data)
    setRoom(lkRoom)
  }

  async function speak() {
    setError('')
    if (!room || !session?.sessionId) return

    const payload = {
      event_type: 'avatar.speak_text',
      text,
      voice: 'lv',
    }

    const bytes = new TextEncoder().encode(JSON.stringify(payload))
    await room.localParticipant.publishData(bytes, { topic: 'agent-control' })
  }

  async function stop() {
    try { await room?.disconnect() } catch {}
    setRoom(null)
    setSession(null)

    // почистим созданные <audio>
    if (audioContainerRef.current) audioContainerRef.current.innerHTML = ''
  }

  useEffect(() => {
    return () => {
      try { room?.disconnect() } catch {}
    }
  }, [room])

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {!session ? <button onClick={start}>Start</button> : <button onClick={stop}>Stop</button>}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: 520, maxWidth: '100%' }}
          disabled={!session}
        />
        <button onClick={speak} disabled={!session || !room}>Speak</button>
      </div>

      {error ? <div style={{ marginTop: 10, color: 'crimson' }}>{error}</div> : null}

      <div style={{ marginTop: 16 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: 640, height: 360, background: '#111', borderRadius: 12 }}
        />
        {/* сюда будем appendChild(<audio>) */}
        <div ref={audioContainerRef} />
      </div>
    </div>
  )
}
