"use client"

import { Users, Clock, AlertCircle } from "lucide-react"

interface PositionIndicatorProps {
  position: number
  totalWaiting: number
  status: string
  currentServing: string | null
  displayNumber: string
}

export function PositionIndicator({
  position,
  totalWaiting,
  status,
  currentServing,
  displayNumber,
}: PositionIndicatorProps) {
  if (status === "SERVING") {
    return (
      <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border-2 border-emerald-500/40 rounded-3xl overflow-hidden shadow-lg shadow-emerald-500/10">
        <span className="absolute -top-1 px-4 py-1 rounded-b-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
          Active Now
        </span>
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            You Are Being Served
          </p>
          <p className="text-5xl font-black tracking-tight text-emerald-700 dark:text-emerald-300 my-2">
            {displayNumber}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Please proceed to the counter or desk to receive your service.
          </p>
        </div>
      </div>
    )
  }

  if (status === "COMPLETED") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted/40 rounded-2xl border text-center">
        <p className="text-sm font-semibold text-muted-foreground">Service Finished</p>
        <p className="text-2xl font-bold my-1">{displayNumber}</p>
        <p className="text-xs text-muted-foreground">Thank you for visiting!</p>
      </div>
    )
  }

  if (status === "CANCELLED" || status === "NO_SHOW") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <p className="text-sm font-semibold text-rose-600">
          {status === "NO_SHOW" ? "Marked as No-Show" : "Ticket Cancelled"}
        </p>
        <p className="text-2xl font-bold my-1">{displayNumber}</p>
        <p className="text-xs text-muted-foreground">This ticket is no longer active in the line.</p>
      </div>
    )
  }

  const isNext = position === 1

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-3xl shadow-sm">
      <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-tr from-violet-600/10 via-indigo-600/10 to-transparent border-4 border-violet-500/30">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Position
          </span>
          <span className="text-5xl font-black tracking-tight text-foreground">
            #{position}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            in line
          </span>
        </div>
      </div>

      {isNext && (
        <span className="mt-4 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800 animate-pulse">
          ⚡ You&apos;re Next in Line!
        </span>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center divide-x border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Users className="h-3.5 w-3.5" /> Ahead of you
          </p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {Math.max(0, position - 1)} {position - 1 === 1 ? "person" : "people"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Currently Serving
          </p>
          <p className="text-lg font-bold text-primary mt-0.5">
            {currentServing || "None yet"}
          </p>
        </div>
      </div>
    </div>
  )
}
