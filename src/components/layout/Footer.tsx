import Link from "next/link"
import { Users, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-8 md:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white">
            <Users className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">FlowQ Queue Systems</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Designed for seamless customer experiences and fast operations.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">Business Portal</Link>
          <Link href="/register" className="hover:underline">Register Business</Link>
        </div>
      </div>
    </footer>
  )
}
