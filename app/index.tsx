import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { useSocketIO } from "@/script/sockets/useSocketIO";
import Toast from "react-native-toast-message";
import { NotifApproved } from "./components/notif-approved";
import { NotifDeclined } from "./components/notif-declined";
import { toastConfig } from "./toastLayouts";

export default function Index(props: any) {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const { connected, emit, on, off } = useSocketIO(
    process.env.EXPO_PUBLIC_SERVER_URL,
  );
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (connected) {
      emit("join", { username: "esteban", role: "mobile" });
    } else {
      setJoined(false);
    }
  }, [connected, emit]);

  useEffect(() => {
    const handleJoinSucces = () => setJoined(true);

    on("join-success", handleJoinSucces);
    return () => {
      off("join-succes", handleJoinSucces);
    };
  }, [on, off]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>
        {joined ? "✅ Connecté (join-succes)" : "❌ Pas encore rejoint"}
      </Text>
      <NotifApproved />
      <NotifDeclined />
      <Toast config={toastConfig} />
    </View>
  );
}
