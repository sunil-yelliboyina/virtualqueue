"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, QrCode } from "lucide-react"
import { useState } from "react"

interface QRCodeDisplayProps {
  url: string
  title?: string
  subtitle?: string
}

export function QRCodeDisplay({
  url,
  title = "Scan to Join Queue",
  subtitle = "Point your smartphone camera to join line remotely",
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border shadow-sm text-center">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{subtitle}</p>

      <div className="p-4 bg-white rounded-2xl shadow-inner border border-zinc-200 inline-block mb-6">
        <QRCodeSVG
          value={url}
          size={200}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-1.5 flex-1"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Copied Link!" : "Copy Link"}</span>
        </Button>
        <Button variant="secondary" size="sm" asChild className="gap-1.5 flex-1">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span>Open Link</span>
          </a>
        </Button>
      </div>
    </div>
  )
}
