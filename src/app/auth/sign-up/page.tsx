"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, User, ArrowRight, Waves } from "lucide-react"

export default function SignUpPage() {
  const { signUp, loading } = useAuth()
  const { toast, ToastContainer } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string>("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const result = await signUp(email.trim(), password, fullName.trim() || undefined)
    
    if (result.error) {
      setError(result.error)
      toast(result.error, "destructive")
      return
    }
    
    if (result.success) {
      toast(result.message || "Account created successfully!", "success")
      // Wait a moment for the toast to show, then redirect
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand panel */}
        <Card className="hidden lg:flex flex-col justify-between bg-gradient-to-b from-[#141822] to-[#0f1115] border-[#1f2230] p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-semibold">OceoChat</div>
              <div className="text-xs text-gray-400">Join the research platform</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} OceoChat Inc.</div>
        </Card>

        {/* Form */}
        <Card className="bg-[#141822] border-[#1f2230] p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-gray-400">Get started with secure access</p>
          </div>
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name (optional)</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="pl-9 bg-[#0f1115] border-[#222636] text-gray-100 placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 bg-[#0f1115] border-[#222636] text-gray-100 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-[#0f1115] border-[#222636] text-gray-100 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90">
              {loading ? "Creating account..." : (
                <span className="inline-flex items-center gap-2">Sign up <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>
          <Separator className="my-6 bg-[#1f2230]" />
          <div className="text-sm text-gray-400">
            Already have an account?
            <Link href="/auth/sign-in" className="ml-2 text-blue-400 hover:underline">Sign in</Link>
          </div>
        </Card>
      </div>
      <ToastContainer />
    </div>
  )
}
