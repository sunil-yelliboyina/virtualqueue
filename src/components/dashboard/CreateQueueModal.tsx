"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Layers, ArrowRight } from "lucide-react"
import { createQueue } from "@/actions/queue.actions"

export function CreateQueueModal({ businessId }: { businessId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [prefix, setPrefix] = useState("A")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    const res = await createQueue(businessId, {
      name: name.trim(),
      prefix: prefix.trim().toUpperCase() || "A",
    })

    if (res.success) {
      setOpen(false)
      setName("")
      setPrefix("A")
      router.refresh()
    } else {
      setError(res.error || "Failed to create queue")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2 rounded-xl shadow-sm">
          <PlusCircle className="h-4 w-4" />
          <span>New Queue</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Virtual Queue</DialogTitle>
          <DialogDescription className="text-xs">
            Add a new line for walk-ins, consultations, or order pickups.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="qname">Queue Name</Label>
            <Input
              id="qname"
              placeholder="e.g. General Consultations or Table Waitlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qprefix">Ticket Number Prefix (1-2 letters)</Label>
            <Input
              id="qprefix"
              placeholder="e.g. A, B, VIP"
              maxLength={3}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              required
              disabled={loading}
              className="h-11 font-mono uppercase"
            />
            <p className="text-[11px] text-muted-foreground">
              Tickets will be generated as {prefix || "A"}-001, {prefix || "A"}-002, etc.
            </p>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-11 font-semibold rounded-xl"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Queue"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
