import { Text, View } from "react-native";
import { useEffect } from "react";
import { useSocketIO } from "@/script/sockets/useSocketIO";

export default function Index() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const { connected, emit } = useSocketIO(process.env.EXPO_PUBLIC_SERVER_URL);

  useEffect(() => {
    if (connected) emit("join", { username: "test-mobile", role: "mobile" });
  }, [connected, emit]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
