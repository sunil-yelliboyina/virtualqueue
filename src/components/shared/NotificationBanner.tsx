"use client"

import { Bell, CheckCircle2, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationBannerProps {
  type: "approaching" | "next" | "serving" | null
  onDismiss: () => void
  counterNumber?: number | null
}

export function NotificationBanner({
  type,
  onDismiss,
  counterNumber,
}: NotificationBannerProps) {
  if (!type) return null

  if (type === "serving") {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce">
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center justify-between border-2 border-emerald-400">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-8 w-8 text-white shrink-0 animate-pulse" />
            <div>
              <p className="font-extrabold text-base">It&apos;s Your Turn Now!</p>
              <p className="text-xs text-emerald-100">
                {counterNumber
                  ? `Please proceed to Counter #${counterNumber}`
                  : "Please proceed to the service counter immediately."}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-white hover:bg-emerald-700/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  if (type === "next") {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-pulse">
        <div className="p-4 rounded-2xl bg-violet-600 text-white shadow-2xl flex items-center justify-between border-2 border-violet-400">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-white shrink-0" />
            <div>
              <p className="font-extrabold text-base">You are next in line!</p>
              <p className="text-xs text-violet-100">
                Get ready! You will be called in a moment.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-white hover:bg-violet-700/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md">
      <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-2xl flex items-center justify-between border-2 border-amber-300">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-7 w-7 text-white shrink-0" />
          <div>
            <p className="font-bold text-sm">Your turn is approaching</p>
            <p className="text-xs text-amber-100">
              Only a few people ahead of you in line.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="text-white hover:bg-amber-600/50 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
