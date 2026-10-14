"use client"

import { useState } from "react"
import { TicketCard } from "@/components/dashboard/TicketCard"
import { StaffAssignment } from "@/components/dashboard/StaffAssignment"
import { QRCodeDisplay } from "@/components/shared/QRCodeDisplay"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Bell,
  Play,
  Users,
  CheckCircle,
  QrCode,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react"
import { callNextTicket } from "@/actions/ticket.actions"
import { useRealtimeTickets } from "@/hooks/useRealtimeTickets"
import { useRealtimeQueue } from "@/hooks/useRealtimeQueue"
import { useSocket } from "@/hooks/useSocket"
import type { QueueWithTickets } from "@/types"

export function QueueControlPanel({
  initialQueue,
}: {
  initialQueue: QueueWithTickets
}) {
  const socket = useSocket()
  const [stationNumber, setStationNumber] = useState(1)
  const [callingNext, setCallingNext] = useState(false)
  const [activeTab, setActiveTab] = useState("line")

  // Real-time hooks
  const { tickets, isConnected } = useRealtimeTickets(
    initialQueue.id,
    initialQueue.tickets
  )
  const { queue } = useRealtimeQueue(initialQueue.id, initialQueue)

  const servingTickets = tickets.filter((t) => t.status === "SERVING")
  const waitingTickets = tickets.filter((t) => t.status === "WAITING")

  const currentQueue = queue || initialQueue

  const handleCallNext = async () => {
    setCallingNext(true)
    const res = await callNextTicket(currentQueue.id, stationNumber)
    if (!res.success) {
      alert(res.error || "Failed to call next ticket")
    }
    setCallingNext(false)
  }

  // Construct QR join URL
  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${currentQueue.id}`
      : `/join/${currentQueue.id}`

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {currentQueue.name}
            </h1>
            <Badge variant="outline" className="font-mono font-bold text-sm">
              Prefix: {currentQueue.prefix}
            </Badge>
            {isConnected ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <Wifi className="h-3 w-3" /> Live Sync
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                <WifiOff className="h-3 w-3" /> Connecting...
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {initialQueue.business.name} • Now Serving:{" "}
            <span className="font-bold text-primary">
              {currentQueue.currentNumber > 0
                ? `${currentQueue.prefix}-${String(currentQueue.currentNumber).padStart(3, "0")}`
                : "None"}
            </span>
          </p>
        </div>

        {/* Big "Call Next" Button + Station Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <StaffAssignment
            currentCounter={stationNumber}
            onCounterChange={setStationNumber}
          />

          <Button
            size="lg"
            variant="gradient"
            onClick={handleCallNext}
            disabled={callingNext || waitingTickets.length === 0}
            className="h-12 px-6 rounded-2xl font-bold shadow-lg shadow-violet-500/20 text-sm gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>
              {callingNext
                ? "Calling..."
                : waitingTickets.length === 0
                ? "No One Waiting"
                : `Call Next (${waitingTickets[0]?.displayNumber})`}
            </span>
          </Button>
        </div>
      </div>

      {/* Tabs: Live Queue vs QR Scanner View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-2xl">
          <TabsTrigger value="line" className="rounded-xl px-5 gap-2">
            <Users className="h-4 w-4" />
            <span>Live Queue ({waitingTickets.length + servingTickets.length})</span>
          </TabsTrigger>
          <TabsTrigger value="qr" className="rounded-xl px-5 gap-2">
            <QrCode className="h-4 w-4" />
            <span>Join QR Code & Link</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Live Queue Operations */}
        <TabsContent value="line" className="space-y-6">
          {/* Section A: Currently Serving */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Play className="h-4 w-4 text-violet-600 fill-violet-600" />
                <span>Currently Serving ({servingTickets.length})</span>
              </h3>
            </div>

            {servingTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servingTickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-muted/20 border border-dashed rounded-2xl">
                <p className="text-sm font-medium text-muted-foreground">
                  No ticket currently active at desks.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click &ldquo;Call Next&rdquo; above to summon the next customer in line.
                </p>
              </div>
            )}
          </div>

          {/* Section B: Waiting in Line */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span>Waiting in Line ({waitingTickets.length})</span>
              </h3>
            </div>

            {waitingTickets.length > 0 ? (
              <div className="space-y-2.5">
                {waitingTickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-card rounded-2xl border">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-bold text-base">The Queue is Empty</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  All waiting customers have been serviced. New guests will appear here as soon as they scan your QR code.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: QR Code and Public Link */}
        <TabsContent value="qr">
          <div className="max-w-md mx-auto">
            <QRCodeDisplay
              url={joinUrl}
              title={`Join ${currentQueue.name}`}
              subtitle="Display this on a screen or print it for your front entrance"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
