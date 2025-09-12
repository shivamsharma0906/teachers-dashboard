"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Correctly import reusable components with their correct paths
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

// Import content components from app directory
import ApprovalsPageContent from "@/app/teacher-dashboard/approvals/page";
import SchedulePageContent from "@/app/teacher-dashboard/schedule/page";
import StudentsPageContent from "@/app/teacher-dashboard/students/page";
import AlertsPageContent from "@/app/teacher-dashboard/alerts/page";
import AttendancePageContent from "@/app/teacher-dashboard/attendance/page";



export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState("approvals")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("उpasthiti_teacher_logged_in")
    if (isLoggedIn !== "true") {
      router.push("/")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const renderPage = () => {
    switch (activeSection) {
      case "approvals":
        return <ApprovalsPageContent />
      case "schedule":
        return <SchedulePageContent />
      case "attendance":
        return <AttendancePageContent />
      case "students":
        return <StudentsPageContent />
      case "alerts":
        return <AlertsPageContent />
      default:
        return <ApprovalsPageContent />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 pt-16">
        <div className="p-6">{renderPage()}</div>
      </main>
    </div>
  )
}