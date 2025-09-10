"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RefreshCw, CheckCircle, MapPin, X } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { QRCodeCanvas } from "qrcode.react"

interface AttendanceRecord {
  rollNo: string
  studentName: string
  timestamp: string
  method: "qr" | "manual" | "face"
}

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

// ✅ Student QR component
function StudentQR({ rollNo, name }: { rollNo: string; name: string }) {
  const qrValue = JSON.stringify({ studentId: rollNo, name })
  return (
    <div className="flex flex-col items-center space-y-2 p-2 border rounded-lg">
      <QRCodeCanvas value={qrValue} size={150} level="M" />
      <p className="text-sm font-medium">{name} ({rollNo})</p>
    </div>
  )
}

export default function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrTimer, setQrTimer] = useState(0)
  const [showQRScannerModal, setShowQRScannerModal] = useState(false)
  const [scannedData, setScannedData] = useState("")
  const [sessionForm, setSessionForm] = useState({ subject: "", department: "", semester: "", section: "" })
  const [teacherLocation, setTeacherLocation] = useState<{ lat: number; lng: number } | null>(null)

  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null)
  const qrScannerContainerId = "html5qr-scanner"

  /** Load sessions from localStorage */
  useEffect(() => {
    const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
    const teacherId = currentTeacher.email || "default"
    const savedSessions = localStorage.getItem(`उpasthiti_attendance_${teacherId}`)
    if (savedSessions) {
      const parsed: AttendanceSession[] = JSON.parse(savedSessions)
      setSessions(parsed)
      const active = parsed.find(s => s.isActive)
      if (active) {
        setActiveSession(active)
        if (active.qrExpiry) {
          const remaining = Math.floor((new Date(active.qrExpiry).getTime() - Date.now()) / 1000)
          if (remaining > 0) setQrTimer(remaining)
        }
      }
    }
  }, [])

  /** Save sessions to localStorage */
  useEffect(() => {
    if (sessions.length > 0) {
      const currentTeacher = JSON.parse(localStorage.getItem("उpasthiti_current_teacher") || "{}")
      const teacherId = currentTeacher.email || "default"
      localStorage.setItem(`उpasthiti_attendance_${teacherId}`, JSON.stringify(sessions))
    }
  }, [sessions])

  /** QR countdown timer */
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer(prev => {
          if (prev <= 1) {
            if (activeSession) {
              const updated = { ...activeSession, qrCode: undefined, qrExpiry: undefined }
              setActiveSession(updated)
              setSessions(prevSessions => prevSessions.map(s => s.id === activeSession.id ? updated : s))
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [qrTimer, activeSession])

  /** Start a new session */
  const startSession = () => {
    if (!sessionForm.subject || !sessionForm.department || !sessionForm.semester || !sessionForm.section) {
      alert("Please fill all fields")
      return
    }
    setSessions(prev => prev.map(s => ({ ...s, isActive: false })))
    const now = new Date()
    const newSession: AttendanceSession = {
      id: Date.now().toString(),
      subject: sessionForm.subject,
      department: sessionForm.department,
      semester: sessionForm.semester,
      section: sessionForm.section,
      date: now.toISOString().split("T")[0],
      startTime: now.toTimeString().slice(0,5),
      endTime: "",
      isActive: true,
      attendanceList: []
    }
    setSessions(prev => [...prev, newSession])
    setActiveSession(newSession)
    setSessionForm({ subject: "", department: "", semester: "", section: "" })
  }

  /** End the active session */
  const endSession = () => {
    if (!activeSession) return
    const now = new Date()
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, isActive: false, endTime: now.toTimeString().slice(0,5) } : s))
    setActiveSession(null)
    setQrTimer(0)
    setShowQRModal(false)
    stopQRScanner()
  }

  /** Get teacher's current location */
  const getTeacherLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        const defaultLoc = { lat: 22.5903, lng: 88.4244 }
        setTeacherLocation(defaultLoc)
        resolve(defaultLoc)
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: parseFloat(pos.coords.latitude.toFixed(4)), lng: parseFloat(pos.coords.longitude.toFixed(4)) }
          setTeacherLocation(loc)
          resolve(loc)
        },
        () => {
          const fallback = { lat: 22.5903, lng: 88.4244 }
          setTeacherLocation(fallback)
          resolve(fallback)
        },
        { timeout: 10000, enableHighAccuracy: true }
      )
    })
  }

  /** Generate QR code for active session (teacher QR) */
  const generateQR = async () => {
    if (!activeSession) return
    try {
      const location = await getTeacherLocation()
      const sessionId = `उpasthiti_${activeSession.id}_${Date.now()}`
      const qrExpiry = new Date(Date.now() + 5 * 60 * 1000)
      const qrData = JSON.stringify({
        type: "session",  // 👈 Added type to distinguish
        sessionId,
        teacherLat: location.lat,
        teacherLng: location.lng,
        subject: activeSession.subject,
        class: `${activeSession.department} ${activeSession.semester}${activeSession.section}`,
        expiry: qrExpiry.toISOString(),
        timestamp: Date.now()
      })
      const updated = { ...activeSession, qrCode: qrData, qrExpiry: qrExpiry.toISOString() }
      setActiveSession(updated)
      setSessions(prev => prev.map(s => s.id === activeSession.id ? updated : s))
      setQrTimer(300)
      setShowQRModal(true)
    } catch (err) {
      console.error(err)
      alert("Failed to generate QR code")
    }
  }

  const regenerateQR = () => {
    setQrTimer(0)
    generateQR()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2,"0")}`
  }

  /** Process Scanned QR */
  const processScannedQR = (qrData: string) => {
    if (!activeSession || !qrData.trim()) return
    try {
      const data = JSON.parse(qrData)

      if (data.studentId) {
        // ✅ Student QR → mark attendance
        markAttendance(data.studentId, data.name || `Student ${data.studentId}`)
        return
      }

      if (data.type === "session") {
        // 👀 Future use if students scan teacher QR
        alert("This is a teacher session QR, please scan a student QR.")
        return
      }

    } catch {
      // fallback plain text
      const rollNoMatch = qrData.match(/STUDENT_(.+?)_\d+/) || qrData.match(/^([A-Z]+-\d{4}-\d{3})/)
      const rollNo = rollNoMatch ? rollNoMatch[1] : qrData.trim()
      markAttendance(rollNo, `Student ${rollNo}`)
    }
  }

  const markAttendance = (rollNo: string, studentName: string) => {
    if (!activeSession) return
    const already = activeSession.attendanceList.some(r => r.rollNo === rollNo)
    if (already) { alert(`${rollNo} already marked`); return }
    const newRecord: AttendanceRecord = { rollNo, studentName, timestamp: new Date().toISOString(), method: "qr" }
    const updated = { ...activeSession, attendanceList: [...activeSession.attendanceList, newRecord] }
    setActiveSession(updated)
    setSessions(prev => prev.map(s => s.id === activeSession.id ? updated : s))
    setScannedData("")
    alert(`✓ Attendance marked for ${studentName} (${rollNo})`)
  }

  const handleManualQRInput = () => {
    if (scannedData.trim()) processScannedQR(scannedData.trim())
  }

  /** Initialize Html5QrcodeScanner */
  const startQRScanner = () => {
    if (!activeSession) return
    if (qrScannerRef.current) return // already running

    qrScannerRef.current = new Html5QrcodeScanner(
      qrScannerContainerId,
      { fps: 10, qrbox: 250 },
      false
    )

    qrScannerRef.current.render(
      (decodedText) => {
        processScannedQR(decodedText)
        setShowQRScannerModal(false)
      },
      (err) => {
        console.error("QR scan error:", err)
      }
    )
  }

  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(err => console.error("Failed to clear QR scanner", err))
      qrScannerRef.current = null
    }
  }

  return (
    <div className="p-6">
      {/* Start Session Form */}
      {!activeSession && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Start New Session</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["subject","department","semester","section"].map((field) => (
              <Input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(sessionForm as any)[field]}
                onChange={e => setSessionForm({...sessionForm, [field]: e.target.value})}
              />
            ))}
            <Button onClick={startSession} className="w-full">Start Session</Button>
          </CardContent>
        </Card>
      )}

      {/* Active Session */}
      {activeSession && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Active Session</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Subject:</span><p className="font-medium">{activeSession.subject}</p></div>
              <div><span className="text-muted-foreground">Class:</span><p className="font-medium">{activeSession.department} {activeSession.semester}{activeSession.section}</p></div>
              <div><span className="text-muted-foreground">Start Time:</span><p className="font-medium">{activeSession.startTime}</p></div>
              <div><span className="text-muted-foreground">Students Present:</span><p className="font-medium">{activeSession.attendanceList.length}</p></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateQR} className="flex-1">Generate Session QR</Button>
              <Button onClick={() => { setShowQRScannerModal(true); startQRScanner() }} variant="outline" className="flex-1">Scan Student QR</Button>
            </div>
            <Button onClick={endSession} variant="destructive" className="w-full">End Session</Button>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      <Dialog open={showQRScannerModal} onOpenChange={open => { setShowQRScannerModal(open); if(!open) stopQRScanner() }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Scan Student QR</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div id={qrScannerContainerId} className="w-full h-72 rounded-lg overflow-hidden border bg-black"></div>
            <Input
              value={scannedData}
              onChange={e => setScannedData(e.target.value)}
              placeholder="Or enter student ID manually"
              onKeyDown={e => e.key === "Enter" && handleManualQRInput()}
            />
            <Button onClick={handleManualQRInput} disabled={!scannedData.trim()} className="w-full flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4"/>Mark Present
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal (Teacher QR) */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Session QR Code</DialogTitle></DialogHeader>
          <div className="text-center space-y-4">
            {activeSession?.qrCode && (
              <QRCodeCanvas
                value={activeSession.qrCode}
                size={256}
                bgColor="#1e293b"
                fgColor="#ffffff"
                level="M"
                includeMargin
              />
            )}
            <p className="text-sm text-muted-foreground">Session QR Code (for demo)</p>
            <p><MapPin className="inline h-4 w-4 mr-1"/> Location: {teacherLocation?.lat.toFixed(4)}, {teacherLocation?.lng.toFixed(4)}</p>
            <p><span className="text-muted-foreground">Subject:</span> {activeSession?.subject}</p>
            <p><span className="text-muted-foreground">Class:</span> {activeSession?.department} {activeSession?.semester}{activeSession?.section}</p>
            <p className="text-sm text-red-600">Expires in: {formatTime(qrTimer)}</p>
            <Button onClick={regenerateQR} variant="outline" className="w-full flex items-center justify-center gap-2"><RefreshCw className="h-4 w-4"/>Regenerate QR</Button>
            <Button onClick={() => setShowQRModal(false)} variant="outline" className="w-full flex items-center justify-center gap-2"><X className="h-4 w-4"/>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Example Student QR Section (demo) */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Sample Student QRs</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
        <StudentQR rollNo="AIML-2025-0" name="Shivam Sharma" />
          <StudentQR rollNo="CSE-2025-002" name="Rahul Kumar" />
        </CardContent>
      </Card>
    </div>
  )
}
