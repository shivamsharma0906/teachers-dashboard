"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, CheckCircle, X, Camera } from "lucide-react"

export default function StudentScanPage() {
  const [qrCode, setQrCode] = useState("")
  const [rollNo, setRollNo] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [error, setError] = useState("")

  const handleScan = () => {
    setError("")

    if (!qrCode.trim() || !rollNo.trim()) {
      setError("Please enter both QR code and roll number")
      return
    }

    // Simulate QR validation
    if (!qrCode.startsWith("उpasthiti_")) {
      setError("Invalid QR code format")
      return
    }

    // Simulate attendance marking
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setAttendanceMarked(true)

      // In real app, this would save to the teacher's attendance list
      console.log("Attendance marked for:", rollNo, "with QR:", qrCode)
    }, 2000)
  }

  const reset = () => {
    setQrCode("")
    setRollNo("")
    setAttendanceMarked(false)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Student Attendance
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!attendanceMarked ? (
            <>
              {/* QR Scanner Simulation */}
              <div className="space-y-4">
                <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">QR Scanner</p>
                    <p className="text-xs text-gray-400 mt-1">Point camera at QR code</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Or enter QR code manually:</p>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qrCode">QR Code</Label>
                  <Input
                    id="qrCode"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="उpasthiti_..."
                  />
                </div>

                <div>
                  <Label htmlFor="rollNo">Your Roll Number</Label>
                  <Input
                    id="rollNo"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="CSE-2023-021"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}

                <Button onClick={handleScan} className="w-full" disabled={isScanning}>
                  {isScanning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Marking Attendance...
                    </>
                  ) : (
                    "Mark Attendance"
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">Attendance Marked!</h3>
                <p className="text-sm text-muted-foreground">
                  Your attendance has been successfully recorded for roll number: {rollNo}
                </p>
              </div>

              <Button onClick={reset} variant="outline" className="w-full bg-transparent">
                Mark Another Attendance
              </Button>
            </div>
          )}

          {/* Demo Instructions */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> Use any QR code starting with "उpasthiti_" and your roll number to test attendance
              marking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
