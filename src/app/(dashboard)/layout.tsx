import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { prisma } from "@/lib/prisma"
import { Users, Store } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's primary business
  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar businessSlug={business?.slug} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-card/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {business?.name || "My Business"}
              </h2>
              <span className="text-[11px] text-muted-foreground block -mt-0.5">
                {business?.category || "Queue Management"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground">
                {session.user.name || session.user.email}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                {session.user.role}
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
