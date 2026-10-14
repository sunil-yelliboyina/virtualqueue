"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Users, LayoutDashboard, LogIn, LogOut, PlusCircle } from "lucide-react"
import { logout } from "@/actions/auth.actions"

export function Navbar() {
  const { data: session } = useSession()
  const isBusinessOrStaff =
    session?.user?.role === "BUSINESS_OWNER" || session?.user?.role === "STAFF"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              FlowQ
            </span>
            <span className="text-[10px] -mt-1 font-medium text-muted-foreground tracking-wider uppercase">
              Virtual Queue
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {session ? (
            <>
              {isBusinessOrStaff && (
                <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden md:inline-block">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Business Login</span>
                </Link>
              </Button>
              <Button variant="gradient" size="sm" asChild>
                <Link href="/register" className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  <span>Start a Queue</span>
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
