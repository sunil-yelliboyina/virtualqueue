import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { QueueTable } from "@/components/dashboard/QueueTable"
import { CreateQueueModal } from "@/components/dashboard/CreateQueueModal"
import { getMyBusiness } from "@/actions/business.actions"

export default async function QueuesManagementPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bizRes = await getMyBusiness()
  if (!bizRes.success || !bizRes.data) {
    redirect("/dashboard")
  }

  const business = bizRes.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Queues & Lines
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your customer queues, prefixes, and active statuses.
          </p>
        </div>

        <CreateQueueModal businessId={business.id} />
      </div>

      <QueueTable queues={business.queues} />
    </div>
  )
}
