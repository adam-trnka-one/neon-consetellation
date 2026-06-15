import type { useStudio } from '../../recorder/useStudio'
import { Select, Toggle } from './controls'

type Studio = ReturnType<typeof useStudio>

export function SourcePanel({ studio }: { studio: Studio }) {
  const { sources, cameras, mics, selectedCameraId, selectedMicId } = studio
  return (
    <section className="space-y-4">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
        Sources
      </h2>

      <div className="space-y-2">
        <Toggle label="Screen / window" checked={sources.screen} onChange={studio.toggleScreen} />
        <Toggle
          label="System audio"
          checked={sources.systemAudio}
          onChange={studio.toggleSystemAudio}
        />
        <p className="px-1 text-xs text-slate-500">
          Choose a screen, window or tab when prompted. System audio capture depends on the browser
          and what you share.
        </p>
      </div>

      <div className="space-y-2">
        <Toggle label="Camera" checked={sources.camera} onChange={studio.toggleCamera} />
        <Select
          label="Camera device"
          value={selectedCameraId}
          disabled={cameras.length === 0}
          options={cameras.map((c) => ({ value: c.deviceId, label: c.label }))}
          onChange={studio.selectCamera}
        />
      </div>

      <div className="space-y-2">
        <Toggle label="Microphone" checked={sources.mic} onChange={studio.toggleMic} />
        <Select
          label="Microphone device"
          value={selectedMicId}
          disabled={mics.length === 0}
          options={mics.map((m) => ({ value: m.deviceId, label: m.label }))}
          onChange={studio.selectMic}
        />
      </div>
    </section>
  )
}
