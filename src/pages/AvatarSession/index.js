/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Room, RoomEvent } from 'livekit-client';

import getDeviceType from 'utils/window/getDeviceType';
import enterFullscreen from 'utils/window/enterFullscreen';
import MainLogo from 'components/MainLogo';
import Button from 'ui/buttons/Button';
import SecondsTimer from 'ui/timer/SecondsTimer';
import OverlayText from './OverlayText';
import ControlButtons from './ControlButtons';
import {
  VideoBlock,
  VideoContent,
  VideoEl,
  LogoBlock,
  VideoTimer,
  MicButton,
  ButtonsContent,
  ControlsContainer,
} from './styles';

export default function AvatarSession() {
  const _ = React;
  const navigate = useNavigate();
  const onClose = () => {
    navigate('/');
  };
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const roomRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const liveSessionIdRef = useRef('');
  const startingRef = useRef(false);
  const avatarTalking = useRef(null);
  const currentQuestionIdRef = useRef(null);

  const overTextTimeoutRef = useRef(null);

  // Realtime STT refs
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const sttStreamRef = useRef(null);
  const partialRef = useRef('');

  const [ready, setReady] = useState(false); // готовы стартовать (эндпоинты/клиент)
  const [running, setRunning] = useState(false); // livekit сессия подключена
  const [inProgress, setProgress] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [overText, setOverText] = useState(null);

  useEffect(() => {
    setReady(true);

    return () => {
      if (overTextTimeoutRef.current) {
        clearTimeout(overTextTimeoutRef.current);
        overTextTimeoutRef.current = null;
      }

      stopVoiceChat().catch(() => {});

      try {
        roomRef.current?.disconnect?.();
      } catch {}
      roomRef.current = null;

      const v = videoRef.current;
      const ms = mediaStreamRef.current;
      if (v && ms) {
        try {
          ms.getTracks().forEach((t) => t.stop?.());
        } catch {}
        try {
          v.srcObject = null;
        } catch {}
      }
      mediaStreamRef.current = null;
      liveSessionIdRef.current = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return () => {};

    const onData = (payload) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === 'avatar_start_talking') avatarTalking.current = true;
        if (msg.type === 'avatar_stop_talking') avatarTalking.current = false;
      } catch {}
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [running]);

  const unlockAudio = async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      if (ctx.state === 'suspended') await ctx.resume();
      ctx.close?.();
    } catch {}
  };

  const attachLiveKitVideo = (room) => {
    const mediaStream = new MediaStream();
    mediaStreamRef.current = mediaStream;

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (!track?.mediaStreamTrack) return;

      mediaStream.addTrack(track.mediaStreamTrack);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    });
  };

  function showOverText(text) {
    setOverText(text);

    // if (overTextTimeoutRef.current) clearTimeout(overTextTimeoutRef.current)
    // overTextTimeoutRef.current = setTimeout(() => setOverText(null), 8000)
  }

  const startVoiceChat = async () => {
    if (voiceMode) return;
    try {
      // попросим разрешение на микрофон
      await navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then((ms) => {
          ms.getTracks().forEach((t) => t.stop());
        })
        .catch(() => {});

      const token = await fetchEphemeralToken();

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      sttStreamRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      partialRef.current = '';

      dc.addEventListener('message', async (e) => {
        let evt;
        try {
          evt = JSON.parse(e.data);
        } catch {
          return;
        }

        const delta = evt?.delta || evt?.transcript_delta || evt?.transcription?.delta;

        const completed =
          evt?.type === 'conversation.item.input_audio_transcription.completed' ||
          evt?.type === 'input_audio_transcription.completed' ||
          evt?.type === 'transcription.completed';

        const isDelta =
          evt?.type === 'conversation.item.input_audio_transcription.delta' ||
          evt?.type === 'input_audio_transcription.delta' ||
          evt?.type === 'transcription.delta';

        if (isDelta && delta) {
          partialRef.current += delta;
          return;
        }

        if (completed) {
          const text = (evt?.transcript || partialRef.current).trim();

          partialRef.current = '';

          if (text && !avatarTalking.current) {
            const sessionId = liveSessionIdRef.current;
            if (!sessionId) return;

            const payload = {
              sessionId,
              text,
              ...(currentQuestionIdRef.current != null ? { currentQuestionId: currentQuestionIdRef.current } : {}),
            };

            const resp = await fetch('/api/live/speak', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }).catch(() => null);

            const data = await resp?.json().catch(() => ({}));

            if (data?.currentQuestionId === null) {
              currentQuestionIdRef.current = null;
            } else if (data?.currentQuestionId != null) {
              currentQuestionIdRef.current = data.currentQuestionId;
            }

            if (data?.avatar_text) {
              showOverText(data.avatar_text);
            }
          }

          if (overTextTimeoutRef.current) {
            clearTimeout(overTextTimeoutRef.current);
            overTextTimeoutRef.current = null;
          }
          return;
        }

        if (evt?.type === 'error') {
          console.error(evt?.error?.message || 'Realtime error');
          stopVoiceChat().catch(() => {});
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResp = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResp.ok) {
        const t = await sdpResp.text().catch(() => '');
        throw new Error(`SDP exchange failed (${sdpResp.status}): ${t}`);
      }

      const answer = { type: 'answer', sdp: await sdpResp.text() };
      await pc.setRemoteDescription(answer);

      if (getDeviceType() === 'android') {
        const vRef = videoRef.current || null;
        enterFullscreen(containerRef.current, vRef);
      }

      setVoiceMode(true);
    } catch (e) {
      console.error(e);
      await stopVoiceChat().catch(() => {});
    }
  };

  const startSession = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      setProgress(true);
      await unlockAudio();
      await startVoiceChat();

      if (getDeviceType() === 'android') {
        const vRef = videoRef.current || null;
        enterFullscreen(containerRef.current, vRef);
      }

      if (videoRef.current) videoRef.current.muted = false;

      const resp = await fetch('/api/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || `Start failed (${resp.status})`);

      liveSessionIdRef.current = data.sessionId;

      const room = new Room();
      roomRef.current = room;
      attachLiveKitVideo(room);

      await room.connect(data.livekitUrl, data.livekitToken);

      setRunning(true);
      setProgress(false);

      const respAction = await fetch('/api/live/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'started',
          sessionId: data.sessionId,
        }),
      }).catch(() => {});

      const dataAction = await respAction?.json().catch(() => ({}));

      if (dataAction?.avatar_text) {
        showOverText(dataAction.avatar_text);
      }
    } catch (e) {
      console.error(e);
      setProgress(false);
    } finally {
      startingRef.current = false;
    }
  };

  async function fetchEphemeralToken() {
    const r = await fetch('/api/live/realtime-token', { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || `Token endpoint failed (${r.status})`);
    if (!j.token) throw new Error('Token response missing { token }');
    return j.token;
  }

  const stopVoiceChat = async () => {
    setVoiceMode(false);

    try {
      dcRef.current?.close?.();
    } catch {}
    dcRef.current = null;

    try {
      pcRef.current?.close?.();
    } catch {}
    pcRef.current = null;

    if (sttStreamRef.current) {
      try {
        sttStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
    }
    sttStreamRef.current = null;

    partialRef.current = '';
    currentQuestionIdRef.current = null;
  };

  const handleClose = () => {
    onClose();
  };

  const btnTitle = !ready ? 'Gandrīz gatavs' : 'Sākt sesiju';

  return (
    <VideoBlock ref={containerRef}>
      <VideoContent>
        <VideoEl ref={videoRef} autoPlay playsInline muted />
        {running ? (
          <>
            <VideoTimer>
              <SecondsTimer isWhite />
            </VideoTimer>
            <MicButton>
              <div>
                {overText ? <OverlayText text={overText} maxLineLength={100} /> : null}
                <ControlsContainer>
                  <ControlButtons
                    onClose={handleClose}
                    micOn={voiceMode}
                    onMicOn={startVoiceChat}
                    onMicOff={stopVoiceChat}
                  />
                </ControlsContainer>
              </div>
            </MicButton>
            <LogoBlock>
              <MainLogo />
            </LogoBlock>
          </>
        ) : (
          <ButtonsContent>
            <Button
              disabled={!ready || inProgress}
              loader={!ready || inProgress}
              value={btnTitle}
              onClick={startSession}
              colorBlue
            />
          </ButtonsContent>
        )}
      </VideoContent>
    </VideoBlock>
  );
}
