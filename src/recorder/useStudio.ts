import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioMixer } from './audioMixer'
import { Compositor } from './compositor'
import { DEFAULT_STYLE } from './defaults'
import { pickMimeType } from './recorder'
import type { MediaDevice, RecordingResult, RecordingStatus, StageStyle } from './types'

export interface SourceState {
  camera: boolean
  mic: boolean
  screen: boolean
  systemAudio: boolean
}

function attachVideo(stream: MediaStream): HTMLVideoElement {
  const video = document.createElement('video')
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  void video.play().catch(() => {})
  return video
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop())
}

export function useStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const compositorRef = useRef<Compositor | null>(null)
  const mixerRef = useRef<AudioMixer | null>(null)

  const screenStreamRef = useRef<MediaStream | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [style, setStyleState] = useState<StageStyle>(DEFAULT_STYLE)
  const [sources, setSources] = useState<SourceState>({
    camera: false,
    mic: false,
    screen: false,
    systemAudio: true,
  })
  const [cameras, setCameras] = useState<MediaDevice[]>([])
  const [mics, setMics] = useState<MediaDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const [selectedMicId, setSelectedMicId] = useState<string>('')
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [result, setResult] = useState<RecordingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Keep the live compositor in sync with style edits.
  const styleRef = useRef(style)
  useEffect(() => {
    styleRef.current = style
    compositorRef.current?.setStyle(style)
  }, [style])

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const toDevice = (d: MediaDeviceInfo, fallback: string): MediaDevice => ({
        deviceId: d.deviceId,
        label: d.label || fallback,
      })
      const cams = all
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => toDevice(d, `Camera ${i + 1}`))
      const audioInputs = all
        .filter((d) => d.kind === 'audioinput')
        .map((d, i) => toDevice(d, `Microphone ${i + 1}`))
      setCameras(cams)
      setMics(audioInputs)
      setSelectedCameraId((prev) => prev || cams[0]?.deviceId || '')
      setSelectedMicId((prev) => prev || audioInputs[0]?.deviceId || '')
    } catch {
      /* enumeration can fail before any permission is granted; ignore */
    }
  }, [])

  // Boot the compositor + mixer once the canvas mounts.
  useEffect(() => {
    if (!canvasRef.current) return
    const compositor = new Compositor(canvasRef.current, styleRef.current)
    compositor.start()
    compositorRef.current = compositor
    mixerRef.current = new AudioMixer()

    void refreshDevices()
    navigator.mediaDevices.addEventListener?.('devicechange', refreshDevices)

    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', refreshDevices)
      compositor.stop()
      compositorRef.current = null
      stopStream(screenStreamRef.current)
      stopStream(cameraStreamRef.current)
      stopStream(micStreamRef.current)
      mixerRef.current?.close()
      mixerRef.current = null
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [refreshDevices])

  const startCameraStream = useCallback(
    async (deviceId: string) => {
      stopStream(cameraStreamRef.current)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      cameraStreamRef.current = stream
      cameraVideoRef.current = attachVideo(stream)
      compositorRef.current?.setCamera(cameraVideoRef.current)
      await refreshDevices()
    },
    [refreshDevices],
  )

  const toggleCamera = useCallback(async () => {
    setError(null)
    if (sources.camera) {
      stopStream(cameraStreamRef.current)
      cameraStreamRef.current = null
      cameraVideoRef.current = null
      compositorRef.current?.setCamera(null)
      setSources((s) => ({ ...s, camera: false }))
      return
    }
    try {
      await startCameraStream(selectedCameraId)
      setSources((s) => ({ ...s, camera: true }))
    } catch (e) {
      setError(describeError(e, 'camera'))
    }
  }, [sources.camera, selectedCameraId, startCameraStream])

  const startMicStream = useCallback(
    async (deviceId: string) => {
      stopStream(micStreamRef.current)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      micStreamRef.current = stream
      mixerRef.current?.setSource('mic', stream)
      await refreshDevices()
    },
    [refreshDevices],
  )

  const toggleMic = useCallback(async () => {
    setError(null)
    if (sources.mic) {
      stopStream(micStreamRef.current)
      micStreamRef.current = null
      mixerRef.current?.setSource('mic', null)
      setSources((s) => ({ ...s, mic: false }))
      return
    }
    try {
      await startMicStream(selectedMicId)
      setSources((s) => ({ ...s, mic: true }))
    } catch (e) {
      setError(describeError(e, 'microphone'))
    }
  }, [sources.mic, selectedMicId, startMicStream])

  const toggleScreen = useCallback(async () => {
    setError(null)
    if (sources.screen) {
      stopStream(screenStreamRef.current)
      screenStreamRef.current = null
      screenVideoRef.current = null
      compositorRef.current?.setScreen(null)
      mixerRef.current?.setSource('system', null)
      setSources((s) => ({ ...s, screen: false }))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: styleRef.current.fps },
        audio: sources.systemAudio,
      })
      screenStreamRef.current = stream
      screenVideoRef.current = attachVideo(stream)
      compositorRef.current?.setScreen(screenVideoRef.current)
      if (sources.systemAudio) mixerRef.current?.setSource('system', stream)
      // The browser's own "Stop sharing" control ends the track.
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        stopStream(screenStreamRef.current)
        screenStreamRef.current = null
        screenVideoRef.current = null
        compositorRef.current?.setScreen(null)
        mixerRef.current?.setSource('system', null)
        setSources((s) => ({ ...s, screen: false }))
      })
      setSources((s) => ({ ...s, screen: true }))
    } catch (e) {
      setError(describeError(e, 'screen'))
    }
  }, [sources.screen, sources.systemAudio])

  const toggleSystemAudio = useCallback(() => {
    setSources((s) => {
      const next = !s.systemAudio
      const stream = screenStreamRef.current
      if (stream) mixerRef.current?.setSource('system', next ? stream : null)
      return { ...s, systemAudio: next }
    })
  }, [])

  const selectCamera = useCallback(
    async (deviceId: string) => {
      setSelectedCameraId(deviceId)
      if (sources.camera) {
        try {
          await startCameraStream(deviceId)
        } catch (e) {
          setError(describeError(e, 'camera'))
        }
      }
    },
    [sources.camera, startCameraStream],
  )

  const selectMic = useCallback(
    async (deviceId: string) => {
      setSelectedMicId(deviceId)
      if (sources.mic) {
        try {
          await startMicStream(deviceId)
        } catch (e) {
          setError(describeError(e, 'microphone'))
        }
      }
    },
    [sources.mic, startMicStream],
  )

  const updateStyle = useCallback((patch: Partial<StageStyle>) => {
    setStyleState((prev) => ({ ...prev, ...patch }))
  }, [])

  const hasVideoSource = sources.screen || sources.camera

  const startRecording = useCallback(() => {
    setError(null)
    const compositor = compositorRef.current
    const mixer = mixerRef.current
    if (!compositor || !mixer || !hasVideoSource) return

    const mimeType = pickMimeType()
    const videoStream = compositor.captureStream(styleRef.current.fps)
    const tracks = [...videoStream.getVideoTracks()]
    if (mixer.hasAudio()) tracks.push(...mixer.stream.getAudioTracks())
    const combined = new MediaStream(tracks)

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(combined, mimeType ? { mimeType } : undefined)
    } catch (e) {
      setError(describeError(e, 'recorder'))
      return
    }

    chunksRef.current = []
    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data)
    }
    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || 'video/webm'
      const blob = new Blob(chunksRef.current, { type })
      setResult({
        url: URL.createObjectURL(blob),
        blob,
        mimeType: type,
        size: blob.size,
        durationMs: Date.now() - startedAtRef.current,
      })
    }

    void mixer.resume()
    recorder.start(1000)
    recorderRef.current = recorder
    startedAtRef.current = Date.now()
    setElapsedMs(0)
    setStatus('recording')
    timerRef.current = setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 250)
  }, [hasVideoSource])

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setStatus('idle')
  }, [])

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause()
      if (timerRef.current) clearInterval(timerRef.current)
      setStatus('paused')
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume()
      const offset = elapsedMs
      startedAtRef.current = Date.now() - offset
      timerRef.current = setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 250)
      setStatus('recording')
    }
  }, [elapsedMs])

  const clearResult = useCallback(() => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  return {
    canvasRef,
    style,
    sources,
    cameras,
    mics,
    selectedCameraId,
    selectedMicId,
    status,
    elapsedMs,
    result,
    error,
    hasVideoSource,
    toggleCamera,
    toggleMic,
    toggleScreen,
    toggleSystemAudio,
    selectCamera,
    selectMic,
    updateStyle,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearResult,
  }
}

function describeError(e: unknown, source: string): string {
  if (e instanceof DOMException) {
    if (e.name === 'NotAllowedError') return `Permission to use the ${source} was denied.`
    if (e.name === 'NotFoundError') return `No ${source} device was found.`
    if (e.name === 'NotReadableError') return `The ${source} is already in use by another app.`
  }
  return `Could not start the ${source}. ${e instanceof Error ? e.message : ''}`.trim()
}
