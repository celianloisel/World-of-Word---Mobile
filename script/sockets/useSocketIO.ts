import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocketIO(url: string, opts?: Parameters<typeof io>[1]) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const socket = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      ...opts,
    });
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("message", (payload) => setLastEvent(payload));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message");
      socket.close();
    };
  }, [opts, url]);

  const emit = (event: string, payload?: any) => {
    socketRef.current?.emit(event, payload);
  };

  return { connected, lastEvent, emit };
}
