"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Users, AlertTriangle, X, QrCode } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    id: "approvals",
    label: "Approvals",
    icon: CheckCircle,
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: Calendar,
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: QrCode,
  },
  {
    id: "students",
    label: "Student List",
    icon: Users,
  },
  {
    id: "alerts",
    label: "Attendance Alerts",
    icon: AlertTriangle,
  },
]

export function Sidebar({ activeSection, onSectionChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-semibold text-sidebar-foreground">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={() => {
                  onSectionChange(item.id)
                  onClose()
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
