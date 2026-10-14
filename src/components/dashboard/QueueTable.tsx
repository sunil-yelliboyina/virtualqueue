"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, ExternalLink, ArrowRight, Layers } from "lucide-react"
import { toggleQueueActive } from "@/actions/queue.actions"
import type { QueueInfo } from "@/types"

export function QueueTable({ queues: initialQueues }: { queues: QueueInfo[] }) {
  const [queues, setQueues] = useState<QueueInfo[]>(initialQueues)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    setLoadingId(id)
    const res = await toggleQueueActive(id)
    if (res.success && res.data) {
      setQueues((prev) =>
        prev.map((q) => (q.id === id ? { ...q, isActive: res.data!.isActive } : q))
      )
    }
    setLoadingId(null)
  }

  if (queues.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border">
        <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-bold text-lg">No Queues Created Yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Create your first queue to start generating ticket numbers and taking customers.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Queue Name</TableHead>
            <TableHead>Prefix</TableHead>
            <TableHead>Current Serving</TableHead>
            <TableHead>Next In Line</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queues.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-semibold text-foreground">
                {q.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono font-bold">
                  {q.prefix}
                </Badge>
              </TableCell>
              <TableCell className="font-bold text-primary">
                {q.currentNumber > 0 ? `${q.prefix}-${String(q.currentNumber).padStart(3, "0")}` : "None"}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {q.prefix}-{String(q.nextNumber).padStart(3, "0")}
              </TableCell>
              <TableCell>
                <Badge variant={q.isActive ? "success" : "secondary"}>
                  {q.isActive ? "Active" : "Paused"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(q.id)}
                  disabled={loadingId === q.id}
                  className="h-8 rounded-lg text-xs"
                >
                  {q.isActive ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
                <Button variant="default" size="sm" asChild className="h-8 rounded-lg text-xs">
                  <Link href={`/queues/${q.id}`}>
                    Control Panel
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
