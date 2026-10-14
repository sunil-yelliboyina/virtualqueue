"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateBusiness, createBusiness } from "@/actions/business.actions"
import { BUSINESS_CATEGORIES } from "@/lib/constants"
import { Check, AlertCircle, Building } from "lucide-react"
import type { BusinessProfile } from "@/types"

export function BusinessSettingsForm({
  business,
}: {
  business: BusinessProfile | null
}) {
  const router = useRouter()
  const [name, setName] = useState(business?.name || "")
  const [category, setCategory] = useState(business?.category || "Retail")
  const [description, setDescription] = useState(business?.description || "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      if (business) {
        const res = await updateBusiness(business.id, {
          name,
          category,
          description,
        })
        if (res.success) {
          setSaved(true)
          router.refresh()
        } else {
          setError(res.error || "Failed to update profile")
        }
      } else {
        const res = await createBusiness({
          name,
          category,
          description,
        })
        if (res.success) {
          setSaved(true)
          router.refresh()
        } else {
          setError(res.error || "Failed to create profile")
        }
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl shadow-sm border-border/80">
      <CardHeader>
        <CardTitle className="text-xl">Business Profile</CardTitle>
        <CardDescription className="text-xs">
          This information is displayed publicly to customers joining your lines.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 border border-emerald-500/20">
            <Check className="h-4 w-4 shrink-0" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bname">Business / Store Name</Label>
            <Input
              id="bname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Short Description (optional)</Label>
            <Textarea
              id="desc"
              placeholder="e.g. Specialty coffee shop with table and takeout lines."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {business?.slug && (
            <div className="p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Your Public URL slug: </span>
              <code className="font-mono bg-background px-1.5 py-0.5 rounded border ml-1">
                /join/{business.slug}
              </code>
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            className="h-11 px-6 font-semibold rounded-xl"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
