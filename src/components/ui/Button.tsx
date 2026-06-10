import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary:
    'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/60 hover:bg-neon-cyan/25 shadow-[0_0_18px_rgba(34,211,238,0.25)]',
  ghost: 'bg-white/5 text-slate-200 border border-white/15 hover:bg-white/10',
  danger: 'bg-rose-500/15 text-rose-300 border border-rose-400/50 hover:bg-rose-500/25',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-lg px-4 py-2 font-display font-semibold text-sm tracking-wide transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
