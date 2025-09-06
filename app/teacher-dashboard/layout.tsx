"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    if (pathname) {
      const currentSection = pathname.split("/").pop() || "dashboard"
      setActiveSection(currentSection)
    } else {
      setActiveSection("dashboard")
    }
  }, [pathname])

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  )
}