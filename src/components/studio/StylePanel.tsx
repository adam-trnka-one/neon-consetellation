import { RESOLUTIONS } from '../../recorder/defaults'
import type { CameraPosition, CameraShape, StageBackground } from '../../recorder/types'
import type { useStudio } from '../../recorder/useStudio'
import { ColorField, Field, Segmented, Slider } from './controls'

type Studio = ReturnType<typeof useStudio>

const BG_PRESETS: { label: string; value: StageBackground }[] = [
  { label: 'Indigo', value: { type: 'gradient', from: '#0b0b26', to: '#1e1e4f', angle: 135 } },
  { label: 'Aurora', value: { type: 'gradient', from: '#0f172a', to: '#155e75', angle: 135 } },
  { label: 'Sunset', value: { type: 'gradient', from: '#831843', to: '#7c2d12', angle: 135 } },
  { label: 'Slate', value: { type: 'solid', color: '#0f172a' } },
  { label: 'Black', value: { type: 'solid', color: '#000000' } },
]

export function StylePanel({ studio }: { studio: Studio }) {
  const { style } = studio
  const screen = style.screen
  const camera = style.camera
  const bg = style.background

  return (
    <section className="space-y-6">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
        Styling
      </h2>

      {/* Output */}
      <div className="space-y-3">
        <Field label="Resolution">
          <div className="flex flex-wrap gap-1.5">
            {RESOLUTIONS.map((r) => {
              const active = r.width === style.width && r.height === style.height
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => studio.updateStyle({ width: r.width, height: r.height })}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan'
                      : 'border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </Field>
        <Slider
          label="Frame rate"
          value={style.fps}
          min={15}
          max={60}
          step={5}
          unit=" fps"
          onChange={(fps) => studio.updateStyle({ fps })}
        />
      </div>

      {/* Background */}
      <div className="space-y-3">
        <Field label="Background">
          <div className="flex flex-wrap gap-1.5">
            {BG_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => studio.updateStyle({ background: p.value })}
                className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-slate-100"
                style={swatchStyle(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
        {bg.type === 'solid' ? (
          <ColorField
            label="Background colour"
            value={bg.color}
            onChange={(color) => studio.updateStyle({ background: { type: 'solid', color } })}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="From"
              value={bg.from}
              onChange={(from) => studio.updateStyle({ background: { ...bg, from } })}
            />
            <ColorField
              label="To"
              value={bg.to}
              onChange={(to) => studio.updateStyle({ background: { ...bg, to } })}
            />
          </div>
        )}
      </div>

      {/* Screen frame */}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Screen frame</h3>
        <Slider
          label="Corner rounding"
          value={screen.radius}
          min={0}
          max={80}
          unit="px"
          onChange={(radius) => studio.updateStyle({ screen: { ...screen, radius } })}
        />
        <Slider
          label="Padding"
          value={screen.padding}
          min={0}
          max={200}
          unit="px"
          onChange={(padding) => studio.updateStyle({ screen: { ...screen, padding } })}
        />
        <Slider
          label="Border width"
          value={screen.borderWidth}
          min={0}
          max={20}
          unit="px"
          onChange={(borderWidth) => studio.updateStyle({ screen: { ...screen, borderWidth } })}
        />
        <ColorField
          label="Border colour"
          value={screen.borderColor}
          onChange={(borderColor) => studio.updateStyle({ screen: { ...screen, borderColor } })}
        />
        <Slider
          label="Shadow"
          value={screen.shadow}
          min={0}
          max={80}
          unit="px"
          onChange={(shadow) => studio.updateStyle({ screen: { ...screen, shadow } })}
        />
      </div>

      {/* Camera bubble */}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Camera bubble</h3>
        <Segmented<CameraShape>
          label="Shape"
          value={camera.shape}
          options={[
            { value: 'circle', label: 'Circle' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' },
          ]}
          onChange={(shape) => studio.updateStyle({ camera: { ...camera, shape } })}
        />
        <Segmented<CameraPosition>
          label="Position"
          value={camera.position}
          options={[
            { value: 'bottom-left', label: '◣' },
            { value: 'bottom-right', label: '◢' },
            { value: 'top-left', label: '◤' },
            { value: 'top-right', label: '◥' },
          ]}
          onChange={(position) => studio.updateStyle({ camera: { ...camera, position } })}
        />
        <Slider
          label="Size"
          value={camera.size}
          min={12}
          max={50}
          unit="%"
          onChange={(size) => studio.updateStyle({ camera: { ...camera, size } })}
        />
        <Slider
          label="Margin"
          value={camera.margin}
          min={0}
          max={160}
          unit="px"
          onChange={(margin) => studio.updateStyle({ camera: { ...camera, margin } })}
        />
        {camera.shape === 'rounded' && (
          <Slider
            label="Corner rounding"
            value={camera.radius}
            min={0}
            max={80}
            unit="px"
            onChange={(radius) => studio.updateStyle({ camera: { ...camera, radius } })}
          />
        )}
        <Slider
          label="Border width"
          value={camera.borderWidth}
          min={0}
          max={20}
          unit="px"
          onChange={(borderWidth) => studio.updateStyle({ camera: { ...camera, borderWidth } })}
        />
        <ColorField
          label="Border colour"
          value={camera.borderColor}
          onChange={(borderColor) => studio.updateStyle({ camera: { ...camera, borderColor } })}
        />
        <Slider
          label="Shadow"
          value={camera.shadow}
          min={0}
          max={80}
          unit="px"
          onChange={(shadow) => studio.updateStyle({ camera: { ...camera, shadow } })}
        />
        <Segmented<'on' | 'off'>
          label="Mirror"
          value={camera.mirror ? 'on' : 'off'}
          options={[
            { value: 'on', label: 'Mirrored' },
            { value: 'off', label: 'Normal' },
          ]}
          onChange={(v) => studio.updateStyle({ camera: { ...camera, mirror: v === 'on' } })}
        />
      </div>
    </section>
  )
}

function swatchStyle(bg: StageBackground): React.CSSProperties {
  if (bg.type === 'gradient') {
    return { background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }
  }
  return { background: bg.color }
}
