import { Card } from "@/components/ui/card"
import { Users, Clock, CheckCircle2, PlayCircle, Layers } from "lucide-react"
import type { DashboardMetrics } from "@/types"

export function MetricsCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      title: "Currently Waiting",
      value: metrics.totalWaiting,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Customers in line right now",
    },
    {
      title: "Being Served",
      value: metrics.totalServing,
      icon: PlayCircle,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      description: "Active at counters",
    },
    {
      title: "Served Today",
      value: metrics.totalServedToday,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Completed since midnight",
    },
    {
      title: "Average Service Time",
      value: `${metrics.avgServiceTimeMinutes} min`,
      icon: Clock,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      description: "Estimated per ticket",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="p-5 shadow-sm border-border/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-foreground tracking-tight">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
