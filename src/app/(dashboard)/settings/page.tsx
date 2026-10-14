import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BusinessSettingsForm } from "@/components/dashboard/BusinessSettingsForm"
import { getMyBusiness } from "@/actions/business.actions"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const res = await getMyBusiness()
  const business = res.success && res.data ? res.data : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Business Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Configure your business profile, category, and public landing info.
        </p>
      </div>

      <BusinessSettingsForm business={business} />
    </div>
  )
}
