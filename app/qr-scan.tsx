// app/qr-scan.tsx (ou app/(stack)/qr-scan.tsx selon ton arbo)
import React from "react";
import { QrScanner } from "@/components/QrScanner";
import { useRouter } from "expo-router";

export default function QrScanScreen() {
  const router = useRouter();

  return (
    <QrScanner
      title="Scanne le QR de la salle"
      onCode={(data) => {
        router.push("/username");
      }}
      onCancel={() => router.back()}
    />
  );
}
