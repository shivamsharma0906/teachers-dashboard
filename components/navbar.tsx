"use client"

import { Bell, Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [currentTeacher, setCurrentTeacher] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const teacher = localStorage.getItem("उpasthiti_current_teacher")
    if (teacher) {
      setCurrentTeacher(JSON.parse(teacher))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("उpasthiti_teacher_logged_in")
    localStorage.removeItem("उpasthiti_current_teacher")
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">उpasthiti — Teacher Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {currentTeacher && <span className="hidden sm:inline text-sm">{currentTeacher.name}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {currentTeacher && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{currentTeacher.name}</p>
                    <p className="text-xs text-muted-foreground">{currentTeacher.email}</p>
                    <p className="text-xs text-muted-foreground">{currentTeacher.department} Department</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
