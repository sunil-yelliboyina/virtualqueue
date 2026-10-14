"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, AlertCircle, ArrowRight } from "lucide-react"
import { joinQueue } from "@/actions/ticket.actions"
import { loginAsGuest } from "@/actions/auth.actions"
import { useSession } from "next-auth/react"

interface JoinQueueFormProps {
  queueId: string
  queueName: string
  prefix: string
  businessName: string
}

export function JoinQueueForm({
  queueId,
  queueName,
  prefix,
  businessName,
}: JoinQueueFormProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const [customerName, setCustomerName] = useState(session?.user?.name || "")
  const [partySize, setPartySize] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let userId = session?.user?.id

      // If user is not logged in, authenticate as anonymous guest
      if (!userId) {
        const guestRes = await loginAsGuest(customerName.trim())
        if (guestRes.success && guestRes.data?.userId) {
          userId = guestRes.data.userId
        }
      }

      // Join the queue
      const res = await joinQueue(queueId, customerName.trim(), partySize, userId)

      if (res.success && res.data) {
        router.push(`/track/${res.data.id}`)
      } else {
        setError(res.error || "Failed to join queue")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-border/60">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center mb-2">
          <Users className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Join the Line</CardTitle>
        <CardDescription className="text-sm">
          {businessName} • <span className="font-semibold text-foreground">{queueName}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Your Name</Label>
            <Input
              id="customerName"
              placeholder="e.g. Alex Smith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              disabled={loading}
              className="h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="partySize">Party Size</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setPartySize(num)}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all border ${
                    partySize === num
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-input hover:bg-accent"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select the number of people in your party.
            </p>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full mt-2 font-semibold shadow-md shadow-violet-500/20"
            disabled={loading}
          >
            {loading ? "Getting your ticket..." : "Get My Ticket"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground mt-3">
            By joining, you will receive real-time status updates on your device.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
