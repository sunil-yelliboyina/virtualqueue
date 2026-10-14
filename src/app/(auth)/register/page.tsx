"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, AlertCircle, ArrowRight, Lock, Mail, Building, User } from "lucide-react"
import { register, login } from "@/actions/auth.actions"
import { createBusiness } from "@/actions/business.actions"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Register user as BUSINESS_OWNER
      const res = await register(name, email, password, "BUSINESS_OWNER")
      if (!res.success) {
        setError(res.error || "Failed to create account")
        setLoading(false)
        return
      }

      // 2. Sign in with newly created credentials
      const loginRes = await login(email, password)
      if (!loginRes.success) {
        setError("Account created, please sign in manually.")
        router.push("/login")
        return
      }

      // 3. Create initial business if business name was supplied
      if (businessName.trim()) {
        await createBusiness({
          name: businessName.trim(),
        })
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              FlowQ
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create Business Account</h1>
          <p className="text-xs text-muted-foreground">
            Get your physical or digital line setup in less than 2 minutes.
          </p>
        </div>

        <Card className="shadow-xl border-border/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Register your business</CardTitle>
            <CardDescription className="text-xs">
              Fill in your organization details to start creating virtual lines
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bizName">Business / Organization Name</Label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bizName"
                    placeholder="Downtown Medical Clinic"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password (min. 6 characters)</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 font-semibold mt-2 shadow-md shadow-violet-500/20"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account & Dashboard"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t pt-4 text-center justify-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
