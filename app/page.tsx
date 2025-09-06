"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Zap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("उpasthiti_teacher_logged_in")
    if (isLoggedIn === "true") {
      router.push("/teacher-dashboard")
    }
  }, [router])

  // Initialize demo teachers in localStorage
  useEffect(() => {
    const teachers = localStorage.getItem("उpasthiti_teachers")
    if (!teachers) {
      const demoTeachers = [
        { email: "teacher@cse.edu", password: "password123", name: "Dr. Rajesh Kumar", department: "CSE" },
        { email: "prof@ece.edu", password: "password123", name: "Prof. Priya Sharma", department: "ECE" },
        { email: "admin@me.edu", password: "password123", name: "Dr. Amit Singh", department: "ME" },
      ]
      localStorage.setItem("उpasthiti_teachers", JSON.stringify(demoTeachers))
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      const teachers = JSON.parse(localStorage.getItem("उpasthiti_teachers") || "[]")
      const teacher = teachers.find((t: any) => t.email === email && t.password === password)

      if (teacher) {
        localStorage.setItem("उpasthiti_teacher_logged_in", "true")
        localStorage.setItem("उpasthiti_current_teacher", JSON.stringify(teacher))
        router.push("/teacher-dashboard")
      } else {
        setError("Invalid email or password. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-white rounded-lg p-3 shadow-2xl">
                <Image
                  src="/उpasthiti_SVG.svg"
                  alt="Upasthiti Logo"
                  width={64}
                  height={64}
                  className="h-16 w-auto"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-blue-200/80 text-lg font-medium">Secure Access Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <CardDescription className="text-center text-blue-200/70 text-base">
              Sign in to access your teacher dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-white/70 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-400/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent h-px"></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/60">Demo Access</span>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-white">Quick Demo Login</p>
              </div>
              <div className="space-y-2 text-sm text-blue-200/80">
                <div className="flex justify-between">
                  <span className="font-mono">Email:</span>
                  <span className="font-mono">teacher@cse.edu</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">Password:</span>
                  <span className="font-mono">password123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}