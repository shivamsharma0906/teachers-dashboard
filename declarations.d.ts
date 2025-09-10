// react-qr-scanner.d.ts
declare module "react-qr-scanner" {
  import * as React from "react";

  export interface QrScannerProps {
    delay?: number;
    style?: React.CSSProperties;
    onError?: (error: any) => void;
    onScan?: (data: { text: string } | null) => void;
    constraints?: MediaStreamConstraints;
  }

  const QrScanner: React.ComponentType<QrScannerProps>;
  export default QrScanner;
}

// html5-qrcode.d.ts
declare module "html5-qrcode" {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(
      cameraIdOrConfig: string | { facingMode?: "user" | "environment" },
      config?: any,
      qrCodeSuccessCallback?: (decodedText: string, decodedResult?: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
  }

  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config?: { fps?: number; qrbox?: number | { width: number; height: number } },
      verbose?: boolean
    );
    render(
      qrCodeSuccessCallback: (decodedText: string, decodedResult?: any) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): void;
    clear(): Promise<void>;
  }
}
