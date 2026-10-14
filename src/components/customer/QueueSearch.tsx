"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Store, ArrowRight, Clock, Users } from "lucide-react"
import { searchBusinesses } from "@/actions/business.actions"
import type { BusinessProfile } from "@/types"

export function QueueSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      const res = await searchBusinesses(query)
      if (res.success && res.data) {
        setResults(res.data)
      } else {
        setResults([])
      }
      setLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search restaurants, clinics, banks, salons..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-14 rounded-2xl text-base shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-sm text-muted-foreground animate-pulse">
            Searching businesses...
          </div>
        ) : results.length > 0 ? (
          results.map((biz) => (
            <Card
              key={biz.id}
              className="hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {biz.name}
                      </h4>
                      {biz.category && (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {biz.category}
                        </Badge>
                      )}
                    </div>
                    {biz.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {biz.description}
                      </p>
                    )}
                  </div>
                </div>

                <Button variant="ghost" size="sm" asChild className="gap-1 shrink-0">
                  <Link href={`/join/${biz.slug}`}>
                    <span>Join Line</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))
        ) : query.length > 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border text-sm text-muted-foreground">
            No active businesses matching &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Type a business name or category to find active queues near you.
          </div>
        )}
      </div>
    </div>
  )
}
