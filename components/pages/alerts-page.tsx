"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, AlertCircle, Mail, Phone, Calendar, TrendingDown, Bell, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceAlert {
  id: string
  studentName: string
  rollNo: string
  department: string
  year: string
  section: string
  currentAttendance: number
  requiredAttendance: number
  classesAttended: number
  totalClasses: number
  lastAttended: string
  alertLevel: "critical" | "warning" | "moderate"
  email: string
  phone?: string
  parentContact?: string
}

interface AlertGroup {
  key: string
  department: string
  year: string
  section: string
  alerts: AttendanceAlert[]
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AttendanceAlert[]>([])
  const [selectedLevel, setSelectedLevel] = useState("All Levels")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"

    // Get students from localStorage and filter those with <75% attendance
    const savedStudents = localStorage.getItem(`उpasthiti_students_${teacherId}`)
    if (savedStudents) {
      const students = JSON.parse(savedStudents)
      const lowAttendanceStudents = students
        .filter((student: any) => student.attendancePercentage < 75)
        .map((student: any) => {
          const alertLevel =
            student.attendancePercentage < 50 ? "critical" : student.attendancePercentage < 65 ? "warning" : "moderate"

          return {
            id: student.id,
            studentName: student.name,
            rollNo: student.rollNo,
            department: student.department,
            year: student.year,
            section: "A", // Simplified - in real app, extract from roll number
            currentAttendance: student.attendancePercentage,
            requiredAttendance: 75,
            classesAttended: student.attendedClasses || 0,
            totalClasses: student.totalClasses || 0,
            lastAttended: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Random date within last week
            alertLevel,
            email: student.email,
            phone: student.phone,
            parentContact: student.phone ? `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
          }
        })

      setAlerts(lowAttendanceStudents)
    } else {
      // Demo data if no students exist
      const demoAlerts: AttendanceAlert[] = [
        {
          id: "1",
          studentName: "Ravi Mehta",
          rollNo: "ME-2022-056",
          department: "ME",
          year: "2nd Year",
          section: "A",
          currentAttendance: 45,
          requiredAttendance: 75,
          classesAttended: 18,
          totalClasses: 40,
          lastAttended: "2024-01-10",
          alertLevel: "critical",
          email: "ravi.mehta@student.edu",
          phone: "+91 32109 87654",
          parentContact: "+91 98765 43210",
        },
        {
          id: "2",
          studentName: "Amit Sharma",
          rollNo: "CSE-2021-089",
          department: "CSE",
          year: "3rd Year",
          section: "B",
          currentAttendance: 58,
          requiredAttendance: 75,
          classesAttended: 23,
          totalClasses: 40,
          lastAttended: "2024-01-12",
          alertLevel: "critical",
          email: "amit.sharma@student.edu",
          phone: "+91 87654 32109",
        },
        {
          id: "3",
          studentName: "Neha Patel",
          rollNo: "ECE-2022-034",
          department: "ECE",
          year: "2nd Year",
          section: "A",
          currentAttendance: 68,
          requiredAttendance: 75,
          classesAttended: 27,
          totalClasses: 40,
          lastAttended: "2024-01-13",
          alertLevel: "warning",
          email: "neha.patel@student.edu",
          phone: "+91 76543 21098",
        },
      ]
      setAlerts(demoAlerts)
    }
  }, [])

  const groupedAlerts = alerts
    .filter((alert) => {
      const matchesLevel = selectedLevel === "All Levels" || alert.alertLevel === selectedLevel
      const matchesDepartment = selectedDepartment === "All Departments" || alert.department === selectedDepartment
      return matchesLevel && matchesDepartment
    })
    .reduce((groups: { [key: string]: AlertGroup }, alert) => {
      const key = `${alert.department} • ${alert.year} • Section ${alert.section}`

      if (!groups[key]) {
        groups[key] = {
          key,
          department: alert.department,
          year: alert.year,
          section: alert.section,
          alerts: [],
        }
      }

      groups[key].alerts.push(alert)
      return groups
    }, {})

  const groupedAlertsArray = Object.values(groupedAlerts).sort((a, b) => a.key.localeCompare(b.key))

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const getAlertConfig = (level: AttendanceAlert["alertLevel"]) => {
    switch (level) {
      case "critical":
        return {
          color: "border-l-destructive bg-destructive/5",
          badgeColor: "bg-destructive text-destructive-foreground",
          icon: AlertTriangle,
          iconColor: "text-destructive",
          label: "Critical",
        }
      case "warning":
        return {
          color: "border-l-yellow-500 bg-yellow-50",
          badgeColor: "bg-yellow-500 text-white",
          icon: AlertCircle,
          iconColor: "text-yellow-600",
          label: "Warning",
        }
      case "moderate":
        return {
          color: "border-l-blue-500 bg-blue-50",
          badgeColor: "bg-blue-500 text-white",
          icon: Bell,
          iconColor: "text-blue-600",
          label: "Moderate",
        }
    }
  }

  const handleSendNotification = (attendanceAlert: AttendanceAlert, type: string) => {
  const message = `New ${type} alert: ${(attendanceAlert as any).message}`;
  alert(message);
};


  const criticalCount = alerts.filter((a) => a.alertLevel === "critical").length
  const warningCount = alerts.filter((a) => a.alertLevel === "warning").length
  const moderateCount = alerts.filter((a) => a.alertLevel === "moderate").length

  const departments = ["All Departments", ...new Set(alerts.map((a) => a.department))]
  const alertLevels = ["All Levels", "critical", "warning", "moderate"]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Attendance Alerts</h2>
        <p className="text-muted-foreground">Monitor students with attendance below 75% grouped by class sections.</p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">&lt;50% attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                <p className="text-xs text-muted-foreground">50-65% attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moderate Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{moderateCount}</p>
                <p className="text-xs text-muted-foreground">65-75% attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-medium text-foreground">Filter Alerts</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Alert Level" />
              </SelectTrigger>
              <SelectContent>
                {alertLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Alert Cards */}
      <div className="space-y-4">
        {groupedAlertsArray.length > 0 ? (
          groupedAlertsArray.map((group) => (
            <Card key={group.key}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleGroup(group.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-destructive" />
                    <div>
                      <h3 className="font-semibold text-foreground">{group.key}</h3>
                      <p className="text-sm text-muted-foreground">{group.alerts.length} students need attention</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{group.alerts.length}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Avg:{" "}
                      {Math.round(
                        group.alerts.reduce((sum, alert) => sum + alert.currentAttendance, 0) / group.alerts.length,
                      )}
                      %
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedGroups.has(group.key) && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {group.alerts.map((alert) => {
                      const config = getAlertConfig(alert.alertLevel)
                      const Icon = config.icon
                      const classesNeeded = Math.ceil(
                        (alert.requiredAttendance * alert.totalClasses) / 100 - alert.classesAttended,
                      )

                      return (
                        <Card key={alert.id} className={cn("border-l-4", config.color)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Icon className={cn("h-5 w-5", config.iconColor)} />
                                <div>
                                  <h4 className="font-medium text-foreground">{alert.studentName}</h4>
                                  <p className="text-sm text-muted-foreground">{alert.rollNo}</p>
                                </div>
                              </div>
                              <Badge className={cn("text-xs", config.badgeColor)}>{config.label}</Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                              {/* Attendance Stats */}
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-foreground">Attendance Details</h5>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current:</span>
                                    <span className={cn("font-medium", config.iconColor)}>
                                      {alert.currentAttendance}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Required:</span>
                                    <span className="font-medium text-foreground">{alert.requiredAttendance}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Classes:</span>
                                    <span className="font-medium text-foreground">
                                      {alert.classesAttended}/{alert.totalClasses}
                                    </span>
                                  </div>
                                  {classesNeeded > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Need:</span>
                                      <span className="font-medium text-primary">{classesNeeded} more classes</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Last Activity */}
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-foreground">Last Activity</h5>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(alert.lastAttended).toLocaleDateString("en-IN")}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <TrendingDown className="h-3 w-3" />
                                    <span>
                                      {Math.floor(
                                        (Date.now() - new Date(alert.lastAttended).getTime()) / (1000 * 60 * 60 * 24),
                                      )}{" "}
                                      days ago
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-foreground">Send Notification</h5>
                                <div className="space-y-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full justify-start bg-transparent"
                                    onClick={() => handleSendNotification(alert, "student")}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Notify Student
                                  </Button>

                                  {alert.parentContact && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full justify-start bg-transparent"
                                      onClick={() => handleSendNotification(alert, "parent")}
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      Notify Parent
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No attendance alerts</h3>
                <p className="text-muted-foreground">
                  {alerts.length === 0
                    ? "All students are meeting attendance requirements."
                    : "No alerts match your current filters."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
