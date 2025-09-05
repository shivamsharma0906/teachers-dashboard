"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, GraduationCap } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">उpasthiti</h1>
          </div>
          <p className="text-muted-foreground">Teacher Dashboard Login</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to access your teacher dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Email: teacher@cse.edu</p>
                <p>Password: password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
