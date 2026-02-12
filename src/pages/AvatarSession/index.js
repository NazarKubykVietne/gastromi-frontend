/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Room, RoomEvent } from "livekit-client";
import { useScribe } from "@elevenlabs/react";

import getDeviceType from "utils/window/getDeviceType";
import enterFullscreen from "utils/window/enterFullscreen";
import MainLogo from "components/MainLogo";
import Button from "ui/buttons/Button";
import SecondsTimer from "ui/timer/SecondsTimer";
import OverlayText from "./OverlayText";
import ControlButtons from "./ControlButtons";
import {
  VideoBlock,
  VideoContent,
  VideoEl,
  LogoBlock,
  VideoTimer,
  MicButton,
  ButtonsContent,
  ControlsContainer,
} from "./styles";

export default function AvatarSession() {
  const _ = React;
  const navigate = useNavigate();
  const onClose = () => navigate("/");

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const roomRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const liveSessionIdRef = useRef("");
  const startingRef = useRef(false);

  const avatarTalking = useRef(null);
  const currentQuestionIdRef = useRef(null);

  const overTextTimeoutRef = useRef(null);

  // Realtime STT refs
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const sttStreamRef = useRef(null);
  const partialRef = useRef("");

  // Scribe refs
  const scribeActiveRef = useRef(false);
  const lastCommittedRef = useRef("");
  const pendingUtteranceRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [inProgress, setProgress] = useState(false);

  const [voiceMode, setVoiceMode] = useState(false);

  // Avatar overlay text (AI)
  const [overText, setOverText] = useState(null);

  // User STT text (shown on screen)
  const [userPartialText, setUserPartialText] = useState("");
  const [userFinalText, setUserFinalText] = useState("");

  function showOverText(text) {
    setOverText(text);
  }

  const unlockAudio = async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      if (ctx.state === "suspended") await ctx.resume();
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

  const sendUserTextToBackend = async (text) => {
    const sessionId = liveSessionIdRef.current;

    if (!sessionId) {
      console.warn("[STT] no sessionId yet -> queue send", text);
      pendingUtteranceRef.current = text;
      return;
    }

    if (!text) return;

    if (avatarTalking.current) {
      console.log("[STT] avatarTalking=true -> skip send", text);
      return;
    }

    const payload = {
      sessionId,
      text,
      ...(currentQuestionIdRef.current != null
        ? { currentQuestionId: currentQuestionIdRef.current }
        : {}),
    };

    console.log("[STT] POST /api/live/speak", payload);

    const resp = await fetch("/api/live/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    const data = await resp?.json().catch(() => ({}));
    console.log("[STT] /api/live/speak response:", resp?.status, data);

    if (data?.currentQuestionId === null) {
      currentQuestionIdRef.current = null;
    } else if (data?.currentQuestionId != null) {
      currentQuestionIdRef.current = data.currentQuestionId;
    }

    if (data?.avatar_text) showOverText(data.avatar_text);

    if (overTextTimeoutRef.current) {
      clearTimeout(overTextTimeoutRef.current);
      overTextTimeoutRef.current = null;
    }
  };

  const flushPendingIfAny = async () => {
    const pending = pendingUtteranceRef.current;
    if (!pending) return;
    pendingUtteranceRef.current = null;
    console.log("[STT] flushing pending utterance:", pending);
    await sendUserTextToBackend(pending);
  };

  // === token for Scribe (ElevenLabs STT) ===
  async function fetchScribeToken() {
    console.log("[STT] fetchScribeToken -> GET /api/scribe-token");
    const r = await fetch("/api/scribe-token", { method: "GET" });

    const raw = await r.text().catch(() => "");
    let j = {};
    try {
      j = JSON.parse(raw);
    } catch {}

    if (!r.ok) {
      console.error("[STT] scribe-token failed:", r.status, raw);
      throw new Error(j?.error || raw || `Scribe token failed (${r.status})`);
    }

    if (!j?.token) {
      console.error("[STT] scribe-token missing token. raw:", raw);
      throw new Error("Scribe token missing { token }");
    }

    console.log("[STT] scribe-token ok");
    return j.token;
  }

  // Keep this function for parity (was used only for OpenAI STT earlier)
  // async function fetchEphemeralToken() {
  //   const r = await fetch("/api/live/realtime-token", { method: "POST" });
  //   const j = await r.json().catch(() => ({}));
  //   if (!r.ok)
  //     throw new Error(j?.error || `Token endpoint failed (${r.status})`);
  //   if (!j.token) throw new Error("Token response missing { token }");
  //   return j.token;
  // }

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",

    onPartialTranscript: (data) => {
      if (!scribeActiveRef.current) return;

      const text = (data?.text || "").trim();
      if (!text) return;

      setUserPartialText(text);
      console.log("[STT][partial]", text);
    },

    onCommittedTranscript: async (data) => {
      if (!scribeActiveRef.current) return;

      const text = (data?.text || "").trim();
      if (!text) return;

      if (lastCommittedRef.current === text) return;
      lastCommittedRef.current = text;

      setUserFinalText(text);
      setUserPartialText("");
      console.log("[STT][committed]", text);

      await sendUserTextToBackend(text);
    },

    onError: (e) => {
      console.error("[STT][scribe error]", e);
    },
  });

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

      liveSessionIdRef.current = "";
      pendingUtteranceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return () => {};

    const onData = (payload) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "avatar_start_talking") avatarTalking.current = true;
        if (msg.type === "avatar_stop_talking") avatarTalking.current = false;
      } catch {}
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [running]);

  const startVoiceChat = async () => {
    if (voiceMode) {
      console.log("[STT] startVoiceChat: already enabled -> skip");
      return;
    }

    console.log("[STT] startVoiceChat: init");

    try {
      console.log("[STT] requesting microphone permission (preflight)...");
      await navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then((ms) => {
          console.log(
            "[STT] mic permission granted (preflight). stopping tracks..."
          );
          ms.getTracks().forEach((t) => t.stop());
        })
        .catch((e) => {
          console.warn(
            "[STT] mic preflight failed/denied (continuing anyway):",
            e
          );
        });

      const token = await fetchScribeToken();
      console.log(
        "[STT] got Scribe token:",
        token ? `${String(token).slice(0, 6)}...` : token
      );

      scribeActiveRef.current = true;
      lastCommittedRef.current = "";
      setUserPartialText("");
      setUserFinalText("");
      partialRef.current = "";
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

      console.log("[STT] connecting Scribe (VAD commit) ...");

      await scribe.connect({
        token,
        languageCode: "lav",
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },

        commitStrategy: "vad",
        vadSilenceThresholdSecs: 1.2,
        vadThreshold: 0.4,

        minSpeechDurationMs: 120,
        minSilenceDurationMs: 200,
      });

      console.log("[STT] Scribe connected  speak now");
      setVoiceMode(true);

      if (getDeviceType() === "android") {
        console.log("[STT] android detected -> entering fullscreen");
        const vRef = videoRef.current || null;
        enterFullscreen(containerRef.current, vRef);
      }
    } catch (e) {
      console.error("[STT] startVoiceChat failed:", e);
      await stopVoiceChat().catch(() => {});
    }
  };

  const stopVoiceChat = async () => {
    console.log("[STT] stopVoiceChat");

    setVoiceMode(false);
    scribeActiveRef.current = false;
    lastCommittedRef.current = "";
    pendingUtteranceRef.current = null;

    setUserPartialText("");
    setUserFinalText("");

    try {
      await scribe.disconnect?.();
      console.log("[STT] scribe disconnected");
    } catch (e) {
      console.warn("[STT] scribe disconnect failed:", e);
    }

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

    partialRef.current = "";
    currentQuestionIdRef.current = null;
  };

  const startSession = async () => {
    if (startingRef.current) return;
    startingRef.current = true;

    try {
      setProgress(true);
      await unlockAudio();

      await startVoiceChat();

      if (getDeviceType() === "android") {
        const vRef = videoRef.current || null;
        enterFullscreen(containerRef.current, vRef);
      }

      if (videoRef.current) videoRef.current.muted = false;

      const resp = await fetch("/api/live/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(data?.error || `Start failed (${resp.status})`);

      liveSessionIdRef.current = data.sessionId;

      const room = new Room();
      roomRef.current = room;
      attachLiveKitVideo(room);

      await room.connect(data.livekitUrl, data.livekitToken);

      setRunning(true);
      setProgress(false);

      await flushPendingIfAny();

      const respAction = await fetch("/api/live/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "started",
          sessionId: data.sessionId,
        }),
      }).catch(() => {});

      const dataAction = await respAction?.json().catch(() => ({}));
      if (dataAction?.avatar_text) showOverText(dataAction.avatar_text);
    } catch (e) {
      console.error(e);
      setProgress(false);
    } finally {
      startingRef.current = false;
    }
  };

  const handleClose = () => onClose();

  const btnTitle = !ready ? "Gandrīz gatavs" : "Sākt sesiju";

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
                {overText ? (
                  <OverlayText text={overText} maxLineLength={100} />
                ) : null}

                {/* USER STT text */}
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#fff",
                    borderRadius: 12,
                    color: "#111",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    maxWidth: 720,
                    width: "min(720px, calc(100vw - 24px))",
                    zIndex: 9999,
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>
                    tu teici:
                  </div>

                  {userPartialText ? (
                    <div
                      style={{
                        fontSize: 16,
                        opacity: 0.8,
                        wordBreak: "break-word",
                      }}
                    >
                      {userPartialText}
                    </div>
                  ) : null}

                  {userFinalText ? (
                    <div
                      style={{
                        marginTop: userPartialText ? 6 : 0,
                        fontSize: 16,
                        fontWeight: 700,
                        wordBreak: "break-word",
                      }}
                    >
                      {userFinalText}
                    </div>
                  ) : null}

                  {!userPartialText && !userFinalText ? (
                    <div style={{ fontSize: 14, opacity: 0.6 }}>
                      (nekas vēl nav teikts)
                    </div>
                  ) : null}
                </div>

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
