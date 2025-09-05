"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Clock, Plus, Trash2, Calendar, Users, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassSession {
  id: string
  day: string
  startTime: string
  endTime: string
  department: string
  semester: string
  section: string
  subject: string
  duration: number // in months
  createdDate: string
  expiryDate: string
}

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function SchedulePage() {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
  const [currentWeek, setCurrentWeek] = useState(0)

  // Form state for creating new session
  const [formData, setFormData] = useState({
    day: "",
    startTime: "",
    endTime: "",
    department: "",
    semester: "",
    section: "",
    subject: "",
    duration: "1",
  })

  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"

    const savedSessions = localStorage.getItem(`उpasthiti_schedule_${teacherId}`)
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
  }, [])

  useEffect(() => {
    if (sessions.length >= 0) {
      const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
      const teacherId = currentTeacher.email || "default"
      localStorage.setItem(`उpasthiti_schedule_${teacherId}`, JSON.stringify(sessions))
    }
  }, [sessions])

  const handleCreateSession = () => {
    if (
      !formData.day ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.department ||
      !formData.semester ||
      !formData.section ||
      !formData.subject
    ) {
      return
    }

    const createdDate = new Date()
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + Number.parseInt(formData.duration))

    const newSession: ClassSession = {
      id: Date.now().toString(),
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      department: formData.department,
      semester: formData.semester,
      section: formData.section,
      subject: formData.subject,
      duration: Number.parseInt(formData.duration),
      createdDate: createdDate.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
    }

    setSessions((prev) => [...prev, newSession])
    setFormData({
      day: "",
      startTime: "",
      endTime: "",
      department: "",
      semester: "",
      section: "",
      subject: "",
      duration: "1",
    })
    setIsCreateModalOpen(false)
  }

  const handleClearRoutine = () => {
    if (confirm("Are you sure you want to clear all scheduled sessions? This action cannot be undone.")) {
      setSessions([])
    }
  }

  const getSessionsForDay = (day: string) => {
    return sessions.filter((session) => session.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const isSessionExpired = (session: ClassSession) => {
    return new Date(session.expiryDate) < new Date()
  }

  const getSessionColor = (session: ClassSession) => {
    if (isSessionExpired(session)) {
      return "bg-muted text-muted-foreground border-muted"
    }

    const colors = [
      "bg-primary/10 text-primary border-primary/20",
      "bg-accent/10 text-accent-foreground border-accent/20",
      "bg-secondary/10 text-secondary-foreground border-secondary/20",
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-green-50 text-green-700 border-green-200",
      "bg-purple-50 text-purple-700 border-purple-200",
    ]

    return colors[Number.parseInt(session.id) % colors.length]
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Class Schedule</h2>
            <p className="text-muted-foreground">Create and manage your weekly class timetable.</p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Class Session</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="day">Day</Label>
                      <Select
                        value={formData.day}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, day: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (Months)</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {month} Month{month > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Select
                        value={formData.startTime}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, startTime: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Select
                        value={formData.endTime}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, endTime: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dept" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="ECE">ECE</SelectItem>
                          <SelectItem value="ME">ME</SelectItem>
                          <SelectItem value="EE">EE</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={formData.semester}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sem" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Select
                        value={formData.section}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sec" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter subject name"
                    />
                  </div>

                  <Button onClick={handleCreateSession} className="w-full">
                    Create Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="destructive" onClick={handleClearRoutine} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Routine
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid gap-4 lg:grid-cols-6">
        {days.map((day) => (
          <Card key={day} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg">{day}</CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2 min-h-[200px]">
                {getSessionsForDay(day).length > 0 ? (
                  getSessionsForDay(day).map((session) => (
                    <Card
                      key={session.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
                        getSessionColor(session),
                      )}
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm leading-tight">{session.subject}</div>

                          <div className="text-xs opacity-80">
                            {session.startTime} - {session.endTime}
                          </div>

                          <div className="text-xs opacity-70">
                            {session.department}-{session.semester}
                            {session.section}
                          </div>

                          {isSessionExpired(session) && (
                            <Badge variant="secondary" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Class Session Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                  <p className="text-lg font-semibold">{selectedSession.subject}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                  <p className="text-lg">
                    {selectedSession.startTime} - {selectedSession.endTime}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p>{selectedSession.department}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Semester</Label>
                  <p>{selectedSession.semester}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Section</Label>
                  <p>{selectedSession.section}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p>
                    {selectedSession.duration} month{selectedSession.duration > 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expires On</Label>
                  <p className={cn(isSessionExpired(selectedSession) ? "text-destructive" : "text-foreground")}>
                    {new Date(selectedSession.expiryDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => {
                  setSessions((prev) => prev.filter((s) => s.id !== selectedSession.id))
                  setSelectedSession(null)
                }}
                className="w-full"
              >
                Delete Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-xl font-bold text-foreground">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-xl font-bold text-foreground">
                    {sessions.filter((s) => !isSessionExpired(s)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-xl font-bold text-foreground">{new Set(sessions.map((s) => s.department)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
