"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, User, Mail, Phone, ChevronDown, ChevronRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  name: string
  rollNo: string
  email: string
  phone?: string
  department: string
  year: string
  status: "Active" | "Inactive" | "Graduated"
  attendancePercentage: number
  totalClasses: number
  attendedClasses: number
  joinDate: string
}

interface StudentGroup {
  key: string
  department: string
  year: string
  section: string
  students: Student[]
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"

    const savedStudents = localStorage.getItem(`उpasthiti_students_${teacherId}`)
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents))
    } else {
      // Initialize with some demo data if no students exist
      const demoStudents: Student[] = [
        {
          id: "1",
          name: "Arjun Sharma",
          rollNo: "CSE-2023-021",
          email: "arjun.sharma@student.edu",
          phone: "+91 98765 43210",
          department: "CSE",
          year: "2nd Year",
          status: "Active",
          attendancePercentage: 92,
          totalClasses: 50,
          attendedClasses: 46,
          joinDate: "2024-01-15",
        },
        {
          id: "2",
          name: "Priya Patel",
          rollNo: "ECE-2024-014",
          email: "priya.patel@student.edu",
          phone: "+91 87654 32109",
          department: "ECE",
          year: "1st Year",
          status: "Active",
          attendancePercentage: 88,
          totalClasses: 45,
          attendedClasses: 40,
          joinDate: "2024-01-14",
        },
        {
          id: "3",
          name: "Rahul Kumar",
          rollNo: "ME-2022-007",
          email: "rahul.kumar@student.edu",
          phone: "+91 76543 21098",
          department: "ME",
          year: "3rd Year",
          status: "Active",
          attendancePercentage: 76,
          totalClasses: 60,
          attendedClasses: 46,
          joinDate: "2024-01-13",
        },
        {
          id: "4",
          name: "Sneha Gupta",
          rollNo: "CSE-2023-045",
          email: "sneha.gupta@student.edu",
          department: "CSE",
          year: "2nd Year",
          status: "Active",
          attendancePercentage: 95,
          totalClasses: 50,
          attendedClasses: 48,
          joinDate: "2024-01-12",
        },
        {
          id: "5",
          name: "Vikram Singh",
          rollNo: "EE-2023-033",
          email: "vikram.singh@student.edu",
          department: "EE",
          year: "2nd Year",
          status: "Active",
          attendancePercentage: 82,
          totalClasses: 48,
          attendedClasses: 39,
          joinDate: "2024-01-11",
        },
      ]
      setStudents(demoStudents)
      localStorage.setItem(`उpasthiti_students_${teacherId}`, JSON.stringify(demoStudents))
    }
  }, [])

  const groupedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = selectedDepartment === "All Departments" || student.department === selectedDepartment
      const matchesYear = selectedYear === "All Years" || student.year === selectedYear
      const matchesStatus = selectedStatus === "All Status" || student.status === selectedStatus

      return matchesSearch && matchesDepartment && matchesYear && matchesStatus
    })

    const groups: { [key: string]: StudentGroup } = {}

    filtered.forEach((student) => {
      // Extract section from roll number (e.g., CSE-2023-021 -> A based on last digit)
      const section = "A" // Simplified - in real app, this would be extracted from roll number or stored separately
      const key = `${student.department} • ${student.year} • Section ${section}`

      if (!groups[key]) {
        groups[key] = {
          key,
          department: student.department,
          year: student.year,
          section,
          students: [],
        }
      }

      groups[key].students.push(student)
    })

    return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key))
  }, [students, searchTerm, selectedDepartment, selectedYear, selectedStatus])

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "Active":
        return "bg-primary text-primary-foreground"
      case "Inactive":
        return "bg-destructive text-destructive-foreground"
      case "Graduated":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600"
    if (attendance >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const departments = ["All Departments", ...new Set(students.map((s) => s.department))]
  const years = ["All Years", ...new Set(students.map((s) => s.year))]
  const statuses = ["All Status", "Active", "Inactive", "Graduated"]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Student List</h2>
        <p className="text-muted-foreground">Manage approved students grouped by department, year, and section.</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Filters</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

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

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {groupedStudents.reduce((total, group) => total + group.students.length, 0)} students in{" "}
          {groupedStudents.length} groups
        </p>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="space-y-4">
        {groupedStudents.length > 0 ? (
          groupedStudents.map((group) => (
            <Card key={group.key}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleGroup(group.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.key) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{group.key}</h3>
                      <p className="text-sm text-muted-foreground">{group.students.length} students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{group.students.length}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Avg:{" "}
                      {Math.round(
                        group.students.reduce((sum, s) => sum + s.attendancePercentage, 0) / group.students.length,
                      )}
                      %
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedGroups.has(group.key) && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {group.students.map((student) => (
                      <Card key={student.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-background rounded-full">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{student.name}</h4>
                                <p className="text-sm text-muted-foreground font-mono">{student.rollNo}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Attendance</p>
                                <p className={cn("font-bold", getAttendanceColor(student.attendancePercentage))}>
                                  {student.attendancePercentage}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {student.attendedClasses}/{student.totalClasses} classes
                                </p>
                              </div>

                              <Badge className={cn("text-xs", getStatusColor(student.status))}>{student.status}</Badge>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </div>
                              {student.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {student.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
                <p className="text-muted-foreground">
                  {students.length === 0
                    ? "No students have been approved yet. Check the Approvals section."
                    : "Try adjusting your search criteria or filters."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
