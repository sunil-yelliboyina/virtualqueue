import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MetricsCards } from "@/components/dashboard/MetricsCards"
import { QueueTable } from "@/components/dashboard/QueueTable"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusCircle, Layers, ArrowRight, ExternalLink, QrCode } from "lucide-react"
import { getMyBusiness } from "@/actions/business.actions"
import { getDashboardMetrics } from "@/actions/ticket.actions"

export default async function DashboardOverviewPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bizRes = await getMyBusiness()

  if (!bizRes.success || !bizRes.data) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-card rounded-3xl border text-center max-w-lg mx-auto mt-12">
          <h2 className="text-2xl font-bold">Welcome to FlowQ</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Let&apos;s set up your business profile to get your first queue running.
          </p>
          <Button asChild className="mt-6" variant="gradient">
            <Link href="/settings">Set Up Business Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  const business = bizRes.data
  const metricsRes = await getDashboardMetrics(business.id)

  const metrics = metricsRes.success && metricsRes.data
    ? metricsRes.data
    : {
        totalWaiting: 0,
        totalServing: 0,
        totalServedToday: 0,
        avgServiceTimeMinutes: 0,
        activeQueues: business.queues.filter((q) => q.isActive).length,
      }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Operational Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time activity and metrics for{" "}
            <span className="font-semibold text-foreground">{business.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5 h-10 rounded-xl">
            <Link href={`/join/${business.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              <span>Public Page</span>
            </Link>
          </Button>
          <Button variant="gradient" size="sm" asChild className="gap-1.5 h-10 rounded-xl">
            <Link href="/queues">
              <PlusCircle className="h-4 w-4" />
              <span>Manage Queues</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Active Queues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-600" />
            <h2 className="font-bold text-lg text-foreground">Active Lines</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/queues" className="gap-1">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <QueueTable queues={business.queues} />
      </div>
    </div>
  )
}
