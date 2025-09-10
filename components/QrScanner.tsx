// components/QrScanner.tsx
"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

const qrcodeRegionId = "html5qr-code-full-region";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const QrScanner = ({ onScanSuccess, onScanFailure }: QrScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false // verbose
    );

    const handleSuccess = (decodedText: string) => {
      onScanSuccess(decodedText);
    };

    const handleError = (errorMessage: string) => {
      if (onScanFailure) {
        onScanFailure(errorMessage);
      }
    };

    scanner.render(handleSuccess, handleError);

    return () => {
      // Only clear if the element still exists
      if (document.getElementById(qrcodeRegionId)) {
        scanner.clear().catch((error: unknown) => {
          console.error("Failed to clear html5QrcodeScanner:", error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]); // added dependencies

  return <div id={qrcodeRegionId} style={{ border: "none" }} />;
};

export default QrScanner;
