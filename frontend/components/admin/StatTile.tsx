import { LucideIcon } from 'lucide-react'

type Tone = 'default' | 'good' | 'warning' | 'critical'

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  default: { bg: 'bg-horta-medium/10', fg: 'text-horta-dark' },
  good: { bg: 'bg-success/10', fg: 'text-success' },
  warning: { bg: 'bg-warning/15', fg: 'text-warning-ink' },
  critical: { bg: 'bg-brand-red/10', fg: 'text-brand-red' },
}

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: Tone
}

export default function StatTile({ label, value, icon: Icon, tone = 'default' }: StatTileProps) {
  const { bg, fg } = TONE_STYLES[tone]

  return (
    <article className="flex min-h-36 flex-col justify-between gap-4 rounded-card border border-card-border bg-white p-5 shadow-card sm:p-6">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${bg}`}>
        <Icon className={`w-5 h-5 ${fg}`} />
      </div>
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-800">{value}</p>
      </div>
    </article>
  )
}
