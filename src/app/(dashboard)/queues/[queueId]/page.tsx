import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { QueueControlPanel } from "@/components/dashboard/QueueControlPanel"
import { getQueueWithTickets } from "@/actions/queue.actions"

interface QueueControlPageProps {
  params: {
    queueId: string
  }
}

export default async function QueueControlPage({
  params,
}: QueueControlPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { queueId } = params
  const res = await getQueueWithTickets(queueId)

  if (!res.success || !res.data) {
    notFound()
  }

  return (
    <div>
      <QueueControlPanel initialQueue={res.data} />
    </div>
  )
}
