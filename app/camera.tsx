import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import Toast from "react-native-toast-message";

export default function CameraPage() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Demander automatiquement la permission au chargement
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chargement de l'appareil photo...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Permission refusée. Veuillez autoriser l'accès à l'appareil photo dans
          les paramètres.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        });

        if (photo) {
          setCapturedImage(photo.uri);
          Toast.show({
            type: "success",
            text1: "Photo prise !",
            text2: "Votre photo a été capturée avec succès",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de prendre la photo");
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setQrData(data);

    // Afficher dans la console/terminal
    console.log("=== QR CODE SCANNÉ ===");
    console.log("Type:", type);
    console.log("Données:", data);
    console.log("Timestamp:", new Date().toISOString());
    console.log("======================");

    // Afficher un toast de confirmation
    Toast.show({
      type: "success",
      text1: "QR Code scanné !",
      text2: `Données: ${data}`,
      visibilityTime: 5000,
    });
  };

  // Afficher directement l'appareil photo
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "pdf417",
            "aztec",
            "ean13",
            "ean8",
            "upc_e",
            "code128",
            "code39",
            "codabar",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.flipButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>Pointez vers un QR Code</Text>
        </View>
      </CameraView>

      {capturedImage && (
        <View style={styles.imagePreview}>
          <Text style={styles.imageLabel}>Dernière photo :</Text>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        </View>
      )}

      {qrData && (
        <View style={styles.qrPreview}>
          <Text style={styles.qrLabel}>QR Code scanné :</Text>
          <Text style={styles.qrData}>{qrData}</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setScanned(false);
              setQrData(null);
            }}
          >
            <Text style={styles.resetButtonText}>Scanner à nouveau</Text>
          </TouchableOpacity>
        </View>
      )}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cameraButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 20,
    gap: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  flipButtonText: {
    fontSize: 24,
    color: "white",
  },
  imagePreview: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
    color: "white",
  },
  capturedImage: {
    width: 80,
    height: 60,
    borderRadius: 4,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  scannerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  qrPreview: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 8,
    maxWidth: 200,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "white",
  },
  qrData: {
    fontSize: 12,
    color: "#00FF00",
    fontFamily: "monospace",
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  resetButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
