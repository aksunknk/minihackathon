import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Cpu,
  Loader2,
  Radio,
  ShieldAlert,
  Terminal,
  Zap,
} from 'lucide-react'

type LogLevel = 'INFO' | 'WARN' | 'CRITICAL'

interface DumpResponse {
  level: LogLevel
  message: string
  timestamp: string
}

const API_URL = 'http://127.0.0.1:8000/api/logs/dump'

const LEVEL_THEME: Record<
  LogLevel,
  {
    border: string
    text: string
    glow: string
    badge: string
    icon: typeof Activity
    label: string
  }
> = {
  INFO: {
    border: 'border-cyan-400/40',
    text: 'text-cyan-300',
    glow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]',
    badge: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
    icon: Activity,
    label: 'NOMINAL',
  },
  WARN: {
    border: 'border-amber-400/40',
    text: 'text-amber-300',
    glow: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]',
    badge: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    icon: AlertTriangle,
    label: 'ELEVATED',
  },
  CRITICAL: {
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'drop-shadow-[0_0_14px_rgba(239,68,68,0.55)]',
    badge: 'bg-red-500/10 text-red-400 border-red-500/40',
    icon: ShieldAlert,
    label: 'CRITICAL',
  },
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

export default function App() {
  const [userNote, setUserNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DumpResponse | null>(null)

  const theme = useMemo(
    () => (result ? LEVEL_THEME[result.level] : LEVEL_THEME.INFO),
    [result],
  )

  const handleDump = async () => {
    const trimmed = userNote.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_note: trimmed }),
      })

      if (!res.ok) {
        throw new Error(`SYNC FAILED // HTTP ${res.status}`)
      }

      const data: DumpResponse = await res.json()
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'UNKNOWN SYNC ERROR')
    } finally {
      setLoading(false)
    }
  }

  const ResultIcon = theme.icon

  return (
    <div className="relative min-h-svh overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.08)_0%,_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-size-[48px_48px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-400/30 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-cyan-500/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-sm border border-cyan-500/20 bg-slate-900/40 backdrop-blur-md">
              <Cpu className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>
            <div className="text-left">
              <p className="font-mono text-[10px] tracking-[0.35em] text-cyan-500/70 uppercase">
                Biometric Telemetry Interface
              </p>
              <h1 className="font-sans text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
                NEURO-SYNC{' '}
                <span className="font-normal text-cyan-400/80">//</span>{' '}
                <span className="font-mono text-cyan-300">/var/log/myself</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start rounded-sm border border-cyan-500/20 bg-slate-900/40 px-4 py-2 backdrop-blur-md sm:self-auto">
            <span className="status-pulse inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <Radio className="h-4 w-4 text-cyan-400/80" />
            <span className="font-mono text-xs tracking-widest text-cyan-300 uppercase">
              Online
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          <section className="rounded-sm border border-cyan-500/20 bg-slate-900/40 p-5 backdrop-blur-md sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h2 className="font-sans text-sm font-medium tracking-wide text-slate-200 uppercase">
                Neural Input Buffer
              </h2>
            </div>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="今日の思考、出来事、身体感覚をここにダンプ..."
              rows={8}
              className="w-full resize-y rounded-sm border border-cyan-500/20 bg-slate-950/60 px-4 py-4 font-mono text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 outline-none transition-[box-shadow,border-color] focus:border-cyan-400/40 focus:drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]"
            />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] text-slate-500">
                payload: {'{ user_note: string }'} → POST /api/logs/dump
              </p>
              <button
                type="button"
                onClick={handleDump}
                disabled={loading || !userNote.trim()}
                className="group inline-flex items-center justify-center gap-2 rounded-sm border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 font-mono text-xs tracking-widest text-cyan-300 uppercase transition-all hover:border-cyan-400/60 hover:bg-cyan-400/20 hover:text-cyan-200 hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                Execute Dump (同期実行)
              </button>
            </div>
          </section>

          <section
            className={`min-h-[220px] rounded-sm border bg-slate-900/40 p-5 backdrop-blur-md transition-colors sm:p-6 ${
              result ? theme.border : 'border-cyan-500/20'
            } ${result ? theme.glow : ''}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ResultIcon
                  className={`h-4 w-4 ${result ? theme.text : 'text-cyan-400/60'}`}
                />
                <h2 className="font-sans text-sm font-medium tracking-wide text-slate-200 uppercase">
                  Biometric Scan Output
                </h2>
              </div>
              {result && (
                <span
                  className={`rounded-sm border px-2 py-1 font-mono text-[10px] tracking-widest uppercase ${theme.badge}`}
                >
                  {theme.label}
                </span>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-cyan-400/80">
                <Loader2 className="h-8 w-8 animate-spin drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <p className="font-mono text-xs tracking-widest uppercase">
                  Synchronizing neural telemetry...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4">
                <p className="font-mono text-sm text-red-400">{error}</p>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-600">
                <Activity className="h-6 w-6 opacity-40" />
                <p className="font-mono text-xs tracking-widest uppercase">
                  Awaiting dump execution
                </p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                  <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                    Level
                  </span>
                  <span className={`font-mono text-lg font-medium ${theme.text}`}>
                    [{result.level}]
                  </span>

                  <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                    Timestamp
                  </span>
                  <span className="font-mono text-sm text-slate-400">
                    {formatTimestamp(result.timestamp)}
                  </span>
                </div>

                <div
                  className={`rounded-sm border bg-slate-950/50 p-4 ${theme.border}`}
                >
                  <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                    <span className={theme.text}>&gt; </span>
                    {result.message}
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-8 border-t border-cyan-500/10 pt-4 text-center">
          <p className="font-mono text-[10px] tracking-[0.25em] text-slate-600 uppercase">
            Neuro-Sync v1.0 // Subject telemetry channel active
          </p>
        </footer>
      </div>
    </div>
  )
}
