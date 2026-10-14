"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Layers,
  Settings,
  Users,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  businessSlug?: string
}

export function Sidebar({ businessSlug }: SidebarProps) {
  const pathname = usePathname()

  const links = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "Queues",
      href: "/queues",
      icon: Layers,
      active: pathname.startsWith("/queues"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <aside className="w-64 border-r bg-card/60 backdrop-blur-md flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            FlowQ
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                link.active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.name}</span>
            </Link>
          )
        })}

        {businessSlug && (
          <div className="pt-4 mt-4 border-t">
            <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Customer Portal
            </p>
            <Link
              href={`/join/${businessSlug}`}
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span>Public Join Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="w-full justify-start text-muted-foreground hover:text-destructive gap-2 text-xs"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  )
}
