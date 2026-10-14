import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { JoinQueueForm } from "@/components/customer/JoinQueueForm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight, Store } from "lucide-react"
import { prisma } from "@/lib/prisma"

interface JoinPageProps {
  params: {
    queueId: string
  }
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { queueId } = params

  // 1. Try finding by Queue ID
  let queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { business: true },
  })

  // 2. If not found by queue ID, try finding business by slug
  if (!queue) {
    const business = await prisma.business.findUnique({
      where: { slug: queueId },
      include: {
        queues: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!business) {
      notFound()
    }

    // If business has exactly 1 queue, use that queue
    if (business.queues.length === 1) {
      queue = {
        ...business.queues[0],
        business,
      }
    } else if (business.queues.length > 1) {
      // Show queue selection screen
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-12 max-w-lg">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center mb-2">
                  <Store className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">{business.name}</CardTitle>
                <CardDescription>Select which queue you would like to join</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.queues.map((q) => (
                  <Button
                    key={q.id}
                    variant="outline"
                    className="w-full justify-between h-14 rounded-xl px-4 text-left border-border/80 hover:border-primary"
                    asChild
                  >
                    <Link href={`/join/${q.id}`}>
                      <div>
                        <p className="font-semibold text-foreground">{q.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Prefix: {q.prefix} • Now Serving: #{q.currentNumber}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      )
    } else {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-16 max-w-md text-center">
            <Card className="p-8">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-xl font-bold">No Active Lines</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {business.name} does not have any open queues right now. Please check back later.
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </Card>
          </main>
          <Footer />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 flex items-center justify-center">
        <JoinQueueForm
          queueId={queue.id}
          queueName={queue.name}
          prefix={queue.prefix}
          businessName={queue.business.name}
        />
      </main>
      <Footer />
    </div>
  )
}
