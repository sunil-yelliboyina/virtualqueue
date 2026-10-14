"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  UserX,
  XCircle,
  Clock,
  User,
  Users,
  Play,
} from "lucide-react"
import { completeTicket, skipTicket, cancelTicket } from "@/actions/ticket.actions"
import type { TicketInfo } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface TicketCardProps {
  ticket: TicketInfo
  onActionComplete?: () => void
}

export function TicketCard({ ticket, onActionComplete }: TicketCardProps) {
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    await completeTicket(ticket.id)
    setLoading(false)
    onActionComplete?.()
  }

  const handleSkip = async () => {
    if (!confirm(`Mark ticket ${ticket.displayNumber} as No-Show?`)) return
    setLoading(true)
    await skipTicket(ticket.id)
    setLoading(false)
    onActionComplete?.()
  }

  const handleCancel = async () => {
    if (!confirm(`Cancel ticket ${ticket.displayNumber}?`)) return
    setLoading(true)
    await cancelTicket(ticket.id)
    setLoading(false)
    onActionComplete?.()
  }

  const isServing = ticket.status === "SERVING"

  return (
    <Card
      className={`p-4 transition-all shadow-sm ${
        isServing
          ? "border-2 border-violet-500/50 bg-violet-500/5 shadow-md"
          : "border-border/80 hover:border-border"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Number, Name, Time */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-foreground">
              {ticket.displayNumber}
            </span>
            <Badge
              variant={isServing ? "default" : "secondary"}
              className={isServing ? "bg-violet-600 font-bold" : "font-medium text-xs"}
            >
              {isServing
                ? ticket.counterNumber
                  ? `Serving @ Desk #${ticket.counterNumber}`
                  : "Now Serving"
                : "Waiting"}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {ticket.customerName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Party of {ticket.partySize}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(ticket.joinedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isServing ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleComplete}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9 rounded-xl shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
                disabled={loading}
                className="text-amber-600 hover:text-amber-700 border-amber-200 dark:border-amber-900 gap-1.5 h-9 rounded-xl"
              >
                <UserX className="h-4 w-4" />
                <span className="hidden sm:inline">No-Show</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={loading}
                className="text-rose-600 hover:text-rose-700 h-9 px-2"
                title="Cancel ticket"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
              className="text-muted-foreground hover:text-destructive h-9 px-2.5 text-xs gap-1"
            >
              <XCircle className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
