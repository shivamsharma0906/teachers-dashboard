"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Users } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

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
  method: "qr" | "manual"
}

export default function AttendancePageContent() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualRollNo, setManualRollNo] = useState("")
  const [qrTimer, setQrTimer] = useState(0)
  const [sessionForm, setSessionForm] = useState({ subject: "", department: "", semester: "", section: "" })
  const [teacherLocation, setTeacherLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"
    const savedSessions = localStorage.getItem(`उpasthiti_attendance_${teacherId}`)
    if (savedSessions) setSessions(JSON.parse(savedSessions))
  }, [])

  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"
    localStorage.setItem(`उpasthiti_attendance_${teacherId}`, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => {
          if (prev <= 1) {
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
    if (!sessionForm.subject || !sessionForm.department || !sessionForm.semester || !sessionForm.section) return

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
    setSessionForm({ subject: "", department: "", semester: "", section: "" })
  }

  const getTeacherLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: 28.6139, lng: 77.209 }) // default Delhi
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude }
          setTeacherLocation(location)
          resolve(location)
        },
        () => resolve({ lat: 28.6139, lng: 77.209 }),
        { timeout: 10000, enableHighAccuracy: true },
      )
    })
  }

  const generateQR = async () => {
    if (!activeSession) return
    const location = await getTeacherLocation()
    const sessionId = `उpasthiti_${activeSession.id}_${Date.now()}`
    const qrExpiry = new Date(Date.now() + 2 * 60 * 1000).toISOString()
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
    setQrTimer(120)
    setShowQRModal(true)
  }

  const addManualAttendance = () => {
    if (!activeSession || !manualRollNo.trim()) return
    const newRecord: AttendanceRecord = {
      rollNo: manualRollNo.trim(),
      studentName: `Student ${manualRollNo.trim()}`,
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
    setActiveSession((prev) =>
      prev ? { ...prev, attendanceList: [...prev.attendanceList, newRecord] } : null,
    )
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
    setShowQRModal(false)
    setShowManualModal(false)
    setQrTimer(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-6">
      {/* Start New Session Form */}
      {!activeSession && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Start New Attendance Session</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={sessionForm.subject}
                onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={sessionForm.department}
                onChange={(e) => setSessionForm({ ...sessionForm, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div>
              <Label>Semester</Label>
              <Input
                value={sessionForm.semester}
                onChange={(e) => setSessionForm({ ...sessionForm, semester: e.target.value })}
                placeholder="Enter semester"
              />
            </div>
            <div>
              <Label>Section</Label>
              <Input
                value={sessionForm.section}
                onChange={(e) => setSessionForm({ ...sessionForm, section: e.target.value })}
                placeholder="Enter section"
              />
            </div>
            <div className="col-span-4 mt-4">
              <Button onClick={startSession}>Start Session</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Session */}
      {activeSession && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Session: {activeSession.subject}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Button onClick={generateQR}>Generate QR</Button>
              <Button onClick={() => setShowManualModal(true)}>Manual Entry</Button>
              <Button variant="destructive" onClick={endSession}>
                End Session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p>
              <Clock className="inline mr-1" /> Started at: {activeSession.startTime}
            </p>
            <p>
              <Users className="inline mr-1" /> Attendance Count: {activeSession.attendanceList.length}
            </p>
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal */}
      {showQRModal && activeSession?.qrCode && (
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader>
              <DialogTitle>Scan QR to mark attendance</DialogTitle>
            </DialogHeader>
            <QRCodeCanvas value={activeSession.qrCode} size={200} />
            <p className="mt-2 text-sm text-gray-500">Expires in: {formatTime(qrTimer)}</p>
          </DialogContent>
        </Dialog>
      )}

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Manual Attendance Entry</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Enter Roll No"
              value={manualRollNo}
              onChange={(e) => setManualRollNo(e.target.value)}
            />
            <Button className="mt-4" onClick={addManualAttendance}>
              Add Attendance
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Attendance List */}
      {activeSession && activeSession.attendanceList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance List</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Roll No</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Method</th>
                  <th className="border px-2 py-1">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activeSession.attendanceList.map((record, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="border px-2 py-1">{record.rollNo}</td>
                    <td className="border px-2 py-1">{record.studentName}</td>
                    <td className="border px-2 py-1">{record.method}</td>
                    <td className="border px-2 py-1">{new Date(record.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
