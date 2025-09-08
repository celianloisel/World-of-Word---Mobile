import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export function useSocketIO(url: string, opts?: Parameters<typeof io>[1]) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

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

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.close();
    };
  }, [opts, url]);

  const emit = useCallback((event: string, payload?: any) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const on = useCallback(
    <T = any>(event: string, handler: (data: T) => void) => {
      socketRef.current?.on(event, handler as (...args: any[]) => void);
    },
    [],
  );

  const off = useCallback(
    <T = any>(event: string, handler: (data: T) => void) => {
      socketRef.current?.off(event, handler as (...args: any[]) => void);
    },
    [],
  );

  return { connected, emit, on, off };
}
