"use client"

import { useState, useEffect } from "react"
import { PositionIndicator } from "@/components/customer/PositionIndicator"
import { NotificationBanner } from "@/components/shared/NotificationBanner"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Store,
  Users,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useSocket } from "@/hooks/useSocket"
import { useNotification } from "@/hooks/useNotification"
import { cancelTicket, getTicketStatus } from "@/actions/ticket.actions"
import { SOCKET_EVENTS, formatWaitTime } from "@/lib/constants"
import type { TicketStatusInfo } from "@/types"

interface TicketTrackerProps {
  initialData: TicketStatusInfo
}

export function TicketTracker({ initialData }: TicketTrackerProps) {
  const [data, setData] = useState<TicketStatusInfo>(initialData)
  const [cancelling, setCancelling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const socket = useSocket()

  const { ticket, position, estimatedWaitMinutes, totalWaiting, currentServing } =
    data

  // Sound and banner notification hook
  const { showNotification, notificationType, dismiss } = useNotification(
    position,
    ticket.status
  )

  // Socket.io real-time listener
  useEffect(() => {
    if (!socket || !ticket.queueId) return

    // Join room for this queue
    socket.emit(SOCKET_EVENTS.JOIN_QUEUE_ROOM, ticket.queueId)

    const handleUpdate = async () => {
      // Re-fetch current ticket status and position calculations
      const res = await getTicketStatus(ticket.id)
      if (res.success && res.data) {
        setData(res.data)
      }
    }

    socket.on(SOCKET_EVENTS.TICKET_CALLED, handleUpdate)
    socket.on(SOCKET_EVENTS.TICKET_COMPLETED, handleUpdate)
    socket.on(SOCKET_EVENTS.TICKET_SKIPPED, handleUpdate)
    socket.on(SOCKET_EVENTS.TICKET_CANCELLED, handleUpdate)
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleUpdate)

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_QUEUE_ROOM, ticket.queueId)
      socket.off(SOCKET_EVENTS.TICKET_CALLED, handleUpdate)
      socket.off(SOCKET_EVENTS.TICKET_COMPLETED, handleUpdate)
      socket.off(SOCKET_EVENTS.TICKET_SKIPPED, handleUpdate)
      socket.off(SOCKET_EVENTS.TICKET_CANCELLED, handleUpdate)
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleUpdate)
    }
  }, [socket, ticket.id, ticket.queueId])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    const res = await getTicketStatus(ticket.id)
    if (res.success && res.data) {
      setData(res.data)
    }
    setRefreshing(false)
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to leave the queue?")) return
    setCancelling(true)
    const res = await cancelTicket(ticket.id)
    if (res.success && res.data) {
      setData((prev) => ({
        ...prev,
        ticket: {
          ...prev.ticket,
          status: "CANCELLED",
        },
      }))
    }
    setCancelling(false)
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Alert banner when called or close */}
      {showNotification && (
        <NotificationBanner
          type={notificationType}
          onDismiss={dismiss}
          counterNumber={ticket.counterNumber}
        />
      )}

      {/* Main Ticket Display Card */}
      <Card className="overflow-hidden border-2 shadow-2xl relative">
        <div className="h-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600" />

        <CardHeader className="p-6 pb-2 text-center">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1 font-medium">
              <Store className="h-3.5 w-3.5" />
              {ticket.queue.business.name}
            </span>
            <div className="flex items-center gap-1">
              {socket?.connected ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Wifi className="h-3 w-3" /> Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <WifiOff className="h-3 w-3" /> Connecting...
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs">
              {ticket.queue.name}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground pt-1">
              {ticket.displayNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              Guest: <span className="font-semibold text-foreground">{ticket.customerName}</span> • Party of {ticket.partySize}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Position Indicator Component */}
          <PositionIndicator
            position={position}
            totalWaiting={totalWaiting}
            status={ticket.status}
            currentServing={currentServing}
            displayNumber={ticket.displayNumber}
          />

          {/* Wait Time & Live Stats */}
          {ticket.status === "WAITING" && (
            <div className="grid grid-cols-2 gap-3 bg-muted/30 p-4 rounded-2xl border">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Wait</p>
                  <p className="text-base font-bold text-foreground">
                    ~{estimatedWaitMinutes > 0 ? `${estimatedWaitMinutes} min` : "Under 1 min"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total In Queue</p>
                  <p className="text-base font-bold text-foreground">
                    {totalWaiting} {totalWaiting === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="gap-2 w-full h-11 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Updating..." : "Refresh Position"}</span>
            </Button>

            {ticket.status === "WAITING" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5 h-10"
              >
                <XCircle className="h-4 w-4" />
                <span>{cancelling ? "Leaving line..." : "Leave Queue"}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Keep this screen open to watch your number advance in real time.
      </div>
    </div>
  )
}
