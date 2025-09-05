"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QrCode, Clock, Users, UserCheck, Camera, RefreshCw, X, CheckCircle, Scan, MapPin } from "lucide-react"

interface AttendanceSession {
  id: string
  subject: string
  department: string
  semester: string
  section: string
  date: string
  startTime: string
  endTime: string
  qrCode?: string
  qrExpiry?: string
  isActive: boolean
  attendanceList: AttendanceRecord[]
}

interface AttendanceRecord {
  rollNo: string
  studentName: string
  timestamp: string
  method: "qr" | "manual" | "face"
}

export function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [showFaceModal, setShowFaceModal] = useState(false)
  const [manualRollNo, setManualRollNo] = useState("")
  const [qrTimer, setQrTimer] = useState(0)
  const [showQRScannerModal, setShowQRScannerModal] = useState(false)
  const [scannedData, setScannedData] = useState("")
  const [scannerActive, setScannerActive] = useState(false)
  const [sessionForm, setSessionForm] = useState({ subject: "", department: "", semester: "", section: "" })
  const [teacherLocation, setTeacherLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"

    const savedSessions = localStorage.getItem(`उpasthiti_attendance_${teacherId}`)
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
  }, [])

  useEffect(() => {
    if (sessions.length >= 0) {
      const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
      const teacherId = currentTeacher.email || "default"
      localStorage.setItem(`उpasthiti_attendance_${teacherId}`, JSON.stringify(sessions))
    }
  }, [sessions])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => {
          if (prev <= 1) {
            // QR expired
            if (activeSession) {
              setSessions((prevSessions) =>
                prevSessions.map((session) =>
                  session.id === activeSession.id ? { ...session, qrCode: undefined, qrExpiry: undefined } : session,
                ),
              )
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [qrTimer, activeSession])

  const startSession = () => {
    if (!sessionForm.subject || !sessionForm.department || !sessionForm.semester || !sessionForm.section) {
      return
    }

    const now = new Date()
    const newSession: AttendanceSession = {
      id: Date.now().toString(),
      subject: sessionForm.subject,
      department: sessionForm.department,
      semester: sessionForm.semester,
      section: sessionForm.section,
      date: now.toISOString().split("T")[0],
      startTime: now.toTimeString().slice(0, 5),
      endTime: "",
      isActive: true,
      attendanceList: [],
    }

    setSessions((prev) => [...prev, newSession])
    setActiveSession(newSession)
    setShowAttendanceModal(true)
    setSessionForm({ subject: "", department: "", semester: "", section: "" })
  }

  const getTeacherLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setTeacherLocation(location)
          resolve(location)
        },
        (error) => {
          console.error("Location error:", error)
          // Use default location if permission denied
          const defaultLocation = { lat: 28.6139, lng: 77.209 } // Delhi coordinates as fallback
          setTeacherLocation(defaultLocation)
          resolve(defaultLocation)
        },
        { timeout: 10000, enableHighAccuracy: true },
      )
    })
  }

  const generateQR = async () => {
    if (!activeSession) return

    try {
      const location = await getTeacherLocation()

      const sessionId = `उpasthiti_${activeSession.id}_${Date.now()}`
      const qrExpiry = new Date(Date.now() + 2 * 60 * 1000).toISOString() // 2 minutes

      const qrData = JSON.stringify({
        sessionId,
        teacherLat: location.lat,
        teacherLng: location.lng,
        subject: activeSession.subject,
        department: activeSession.department,
        semester: activeSession.semester,
        section: activeSession.section,
        expiry: qrExpiry,
        timestamp: Date.now(),
      })

      setSessions((prev) =>
        prev.map((session) => (session.id === activeSession.id ? { ...session, qrCode: qrData, qrExpiry } : session)),
      )

      setActiveSession((prev) => (prev ? { ...prev, qrCode: qrData, qrExpiry } : null))
      setQrTimer(120) // 2 minutes in seconds
      setShowQRModal(true)
    } catch (error) {
      console.error("Error generating QR:", error)
      alert("Could not get location. QR generated without location data.")

      // Fallback QR generation without location
      const sessionId = `उpasthiti_${activeSession.id}_${Date.now()}`
      const qrExpiry = new Date(Date.now() + 2 * 60 * 1000).toISOString()

      const qrData = JSON.stringify({
        sessionId,
        subject: activeSession.subject,
        department: activeSession.department,
        semester: activeSession.semester,
        section: activeSession.section,
        expiry: qrExpiry,
        timestamp: Date.now(),
      })

      setSessions((prev) =>
        prev.map((session) => (session.id === activeSession.id ? { ...session, qrCode: qrData, qrExpiry } : session)),
      )

      setActiveSession((prev) => (prev ? { ...prev, qrCode: qrData, qrExpiry } : null))
      setQrTimer(120)
      setShowQRModal(true)
    }
  }

  const regenerateQR = () => {
    generateQR()
  }

  const addManualAttendance = () => {
    if (!activeSession || !manualRollNo.trim()) return

    const newRecord: AttendanceRecord = {
      rollNo: manualRollNo.trim(),
      studentName: `Student ${manualRollNo.trim()}`, // In real app, fetch from student database
      timestamp: new Date().toISOString(),
      method: "manual",
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? { ...session, attendanceList: [...session.attendanceList, newRecord] }
          : session,
      ),
    )

    setActiveSession((prev) => (prev ? { ...prev, attendanceList: [...prev.attendanceList, newRecord] } : null))

    setManualRollNo("")
  }

  const endSession = () => {
    if (!activeSession) return

    const endTime = new Date().toTimeString().slice(0, 5)
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? { ...session, isActive: false, endTime, qrCode: undefined, qrExpiry: undefined }
          : session,
      ),
    )

    setActiveSession(null)
    setShowAttendanceModal(false)
    setShowQRModal(false)
    setShowManualModal(false)
    setShowFaceModal(false)
    setQrTimer(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startQRScanner = () => {
    setShowQRScannerModal(true)
    setScannerActive(true)
  }

  const processScannedQR = (qrData: string) => {
    if (!activeSession || !qrData.trim()) return

    // Extract roll number from QR data (assuming format: STUDENT_ROLLNO_TIMESTAMP)
    const rollNoMatch = qrData.match(/STUDENT_(.+?)_\d+/) || qrData.match(/^([A-Z]+-\d{4}-\d{3})/)
    const rollNo = rollNoMatch ? rollNoMatch[1] : qrData.trim()

    // Check if student already marked present
    const alreadyPresent = activeSession.attendanceList.some((record) => record.rollNo === rollNo)
    if (alreadyPresent) {
      alert(`Student ${rollNo} is already marked present!`)
      return
    }

    const newRecord: AttendanceRecord = {
      rollNo: rollNo,
      studentName: `Student ${rollNo}`,
      timestamp: new Date().toISOString(),
      method: "qr",
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? { ...session, attendanceList: [...session.attendanceList, newRecord] }
          : session,
      ),
    )

    setActiveSession((prev) => (prev ? { ...prev, attendanceList: [...prev.attendanceList, newRecord] } : null))

    // Clear scanned data and show success
    setScannedData("")
    alert(`✓ Attendance marked for ${rollNo}`)
  }

  const handleManualQRInput = () => {
    if (scannedData.trim()) {
      processScannedQR(scannedData)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Attendance Management</h2>
        <p className="text-muted-foreground">Start sessions and track student attendance.</p>
      </div>

      {/* Start Session Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Start New Attendance Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={sessionForm.subject}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={sessionForm.department}
                onValueChange={(value) => setSessionForm((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dept" />
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
                value={sessionForm.semester}
                onValueChange={(value) => setSessionForm((prev) => ({ ...prev, semester: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sem" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="section">Section</Label>
              <Select
                value={sessionForm.section}
                onValueChange={(value) => setSessionForm((prev) => ({ ...prev, section: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={startSession} className="w-full">
            Start Attendance Session
          </Button>
        </CardContent>
      </Card>

      {/* Active Session */}
      {activeSession && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary">Active Session</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activeSession.subject} - {activeSession.department} {activeSession.semester}
                  {activeSession.section}
                </p>
              </div>
              <Badge variant="default" className="bg-green-500">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Started: {activeSession.startTime} | Attendance: {activeSession.attendanceList.length} students
              </div>
              <Button variant="destructive" onClick={endSession}>
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Sessions</h3>
        {sessions.length > 0 ? (
          <div className="grid gap-4">
            {sessions
              .slice()
              .reverse()
              .slice(0, 10)
              .map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.department} {session.semester}
                          {session.section} • {session.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.startTime} - {session.endTime || "Ongoing"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.isActive ? "default" : "secondary"}>
                          {session.isActive ? "Active" : "Completed"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{session.attendanceList.length} students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance sessions yet</p>
          </div>
        )}
      </div>

      {/* Attendance Options Modal */}
      <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendance Options</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <Button onClick={generateQR} className="flex items-center gap-2 h-12">
              <QrCode className="h-5 w-5" />
              Generate QR Code (Students Scan)
            </Button>

            <Button onClick={startQRScanner} variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
              <Scan className="h-5 w-5" />
              QR Scanner (Scan Student QR)
            </Button>

            <Button variant="outline" onClick={() => setShowManualModal(true)} className="flex items-center gap-2 h-12">
              <UserCheck className="h-5 w-5" />
              Manual Entry
            </Button>

            <Button variant="outline" onClick={() => setShowFaceModal(true)} className="flex items-center gap-2 h-12">
              <Camera className="h-5 w-5" />
              Face Recognition
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Attendance QR</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block border">
              <div className="w-48 h-48 bg-white flex items-center justify-center">
                {activeSession?.qrCode ? (
                  <div className="text-center">
                    <div className="w-40 h-40 bg-gray-900 mx-auto mb-2 flex items-center justify-center text-white text-xs p-2 rounded">
                      <div className="grid grid-cols-8 gap-px">
                        {/* Simple QR-like pattern */}
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? "bg-white" : "bg-black"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">Session QR Code</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Generating QR Code...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {teacherLocation && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Location: {teacherLocation.lat.toFixed(4)}, {teacherLocation.lng.toFixed(4)}
                  </span>
                </div>
              )}

              <div className="bg-muted p-2 rounded text-left">
                <p>
                  <strong>Subject:</strong> {activeSession?.subject}
                </p>
                <p>
                  <strong>Class:</strong> {activeSession?.department} {activeSession?.semester}
                  {activeSession?.section}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Expires in: <span className="font-mono font-bold text-red-500">{formatTime(qrTimer)}</span>
                </span>
              </div>

              <div className="flex gap-2">
                <Button onClick={regenerateQR} variant="outline" className="flex-1 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate QR
                </Button>
                <Button onClick={() => setShowQRModal(false)} variant="outline" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>

            {activeSession && activeSession.attendanceList.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium mb-2">Recent Attendance:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activeSession.attendanceList.slice(-5).map((record, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{record.rollNo}</span>
                      <span className="text-muted-foreground">{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Modal */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Attendance Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rollNo">Student Roll Number</Label>
              <Input
                id="rollNo"
                value={manualRollNo}
                onChange={(e) => setManualRollNo(e.target.value)}
                placeholder="Enter roll number (e.g., CSE-2023-021)"
                onKeyPress={(e) => e.key === "Enter" && addManualAttendance()}
              />
            </div>

            <Button onClick={addManualAttendance} className="w-full">
              Mark Present
            </Button>

            {activeSession && activeSession.attendanceList.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Attendance List:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {activeSession.attendanceList.map((record, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span>{record.rollNo}</span>
                      <Badge variant="outline" className="text-xs">
                        {record.method}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Face Recognition Modal */}
      <Dialog open={showFaceModal} onOpenChange={setShowFaceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Face Recognition Attendance</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4">
            <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Camera Access Required</p>
                <p className="text-xs text-gray-400 mt-1">Feature coming soon...</p>
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowFaceModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <Dialog open={showQRScannerModal} onOpenChange={setShowQRScannerModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Scanner - Student Attendance</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg mb-4">
                <div className="text-center">
                  <Scan className="h-12 w-12 mx-auto mb-2 text-primary animate-pulse" />
                  <p className="text-sm text-gray-600">Ready to scan student QR codes</p>
                  <p className="text-xs text-gray-400 mt-1">Point camera at student's QR code</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="qrInput">Or enter QR data manually:</Label>
                  <Input
                    id="qrInput"
                    value={scannedData}
                    onChange={(e) => setScannedData(e.target.value)}
                    placeholder="Scan or paste QR code data"
                    onKeyPress={(e) => e.key === "Enter" && handleManualQRInput()}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleManualQRInput} className="flex-1" disabled={!scannedData.trim()}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Present
                  </Button>
                  <Button
                    onClick={() => {
                      setShowQRScannerModal(false)
                      setScannerActive(false)
                      setScannedData("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>

            {/* Live attendance count */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Students Present:</span>
                <Badge variant="default">{activeSession?.attendanceList.length || 0}</Badge>
              </div>
            </div>

            {/* Recent scanned students */}
            {activeSession && activeSession.attendanceList.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Recently Scanned:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activeSession.attendanceList
                    .filter((record) => record.method === "qr")
                    .slice(-3)
                    .map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm p-2 bg-green-50 border border-green-200 rounded"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="font-medium">{record.rollNo}</span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
