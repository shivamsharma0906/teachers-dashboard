"use client"

import { Bell, Menu, User, LogOut, ChevronDown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Teacher {
  name: string
  email: string
  department: string
}

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const teacherJson = localStorage.getItem("उpasthiti_current_teacher")
      if (teacherJson) {
        const parsed: Teacher = JSON.parse(teacherJson)
        setCurrentTeacher(parsed)
      }
    } catch (error) {
      console.error("Invalid teacher data in localStorage", error)
    }
  }, [])

  const handleLogout = (): void => {
    localStorage.removeItem("उpasthiti_teacher_logged_in")
    localStorage.removeItem("उpasthiti_current_teacher")
    router.push("/login")
  }

  const handleProfileClick = (): void => {
    router.push("/teacher/profile")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            उpasthiti — Teacher Dashboard
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open notifications"
                className="hover:bg-accent hover:text-accent-foreground relative"
              >
                <Bell className="h-5 w-5" />
                {/* Red dot */}
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 z-50">
              <div className="px-4 py-2 font-semibold">Notifications</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <p className="text-sm">New approval request from a student.</p>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <p className="text-sm">Your weekly attendance report is ready.</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-blue-500 hover:text-blue-600">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open profile menu"
                className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground"
              >
                <User className="h-5 w-5" />
                {currentTeacher && (
                  <span className="hidden sm:inline text-sm max-w-32 truncate">
                    {currentTeacher.name}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-0 z-50">
              {currentTeacher ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src="/placeholder-user.jpg"
                          alt={currentTeacher.name}
                        />
                        <AvatarFallback>
                          {currentTeacher.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {currentTeacher.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentTeacher.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentTeacher.department} Department
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={handleProfileClick}
                      className="px-4 py-2 cursor-pointer"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <div className="py-1">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="px-4 py-2 cursor-pointer text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </div>
                </>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Loading user...
                  </p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
