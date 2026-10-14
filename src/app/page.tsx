import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { QueueSearch } from "@/components/customer/QueueSearch"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  QrCode,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-violet-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.15),rgba(255,255,255,0))]" />
          
          <div className="container mx-auto px-4 sm:px-6 relative max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Real-Time Virtual Queuing</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              Skip the wait. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Join the line from anywhere.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              FlowQ lets customers hold their spot virtually and monitor live progress in real-time, while businesses manage lines with effortless speed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button size="lg" variant="gradient" asChild className="h-13 px-8 text-base shadow-lg shadow-violet-500/25 rounded-2xl w-full sm:w-auto">
                <Link href="/register">
                  Start a Free Virtual Queue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-13 px-8 text-base rounded-2xl w-full sm:w-auto">
                <Link href="/login">
                  Business Owner Login
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Live Search Section */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Find an Active Line</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Search for local restaurants, clinics, banks, and service centers using FlowQ.
              </p>
            </div>

            <QueueSearch />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Designed for Customers & Businesses
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Everything you need to eliminate crowding, reduce wait anxiety, and streamline walk-in service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl border bg-card/60 hover:bg-card shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Zero App Download</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Customers simply scan a QR code or tap a link. No registration needed—join in 3 seconds as a guest.
                </p>
              </div>

              <div className="p-8 rounded-3xl border bg-card/60 hover:bg-card shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Live Real-Time Tracker</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Postgres + Socket.io delivers live position countdowns and estimated wait times right to their smartphone.
                </p>
              </div>

              <div className="p-8 rounded-3xl border bg-card/60 hover:bg-card shadow-sm hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">High-Velocity Operations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Call next, complete, skip no-shows with single-click shortcuts. Multiple counters and desk routing supported.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
