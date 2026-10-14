import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { TicketTracker } from "@/components/customer/TicketTracker"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTicketStatus } from "@/actions/ticket.actions"
import { AlertCircle, ArrowLeft } from "lucide-react"

interface TrackPageProps {
  params: {
    ticketId: string
  }
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { ticketId } = params

  const res = await getTicketStatus(ticketId)

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-md flex items-center justify-center">
          <Card className="p-8 text-center border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Ticket Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">
              This ticket code could not be located or may have expired.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Find Another Line
              </Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
        <TicketTracker initialData={res.data} />
      </main>
      <Footer />
    </div>
  )
}
