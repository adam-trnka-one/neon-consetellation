import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

export function NicknameSearch({
  value,
  onSearch,
}: {
  value: string
  onSearch: (q: string) => void
}) {
  const [text, setText] = useState(value)

  useEffect(() => setText(value), [value])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(text.trim())
      }}
      className="flex gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search nickname…"
        maxLength={24}
        className="w-full flex-1 rounded-xl border border-white/15 bg-space-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none sm:w-56"
      />
      <Button type="submit" variant="ghost">
        Search
      </Button>
      {value && (
        <Button type="button" variant="ghost" onClick={() => onSearch('')}>
          Clear
        </Button>
      )}
    </form>
  )
}
