import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, payload?: any) => void;
  on: <T = any>(event: string, handler: (data: T) => void) => void;
  off: <T = any>(event: string, handler: (data: T) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  url: string;
}

export function SocketProvider({ children, url }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io(url, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
      });

      socketRef.current = socket;

      const onConnect = () => setConnected(true);
      const onDisconnect = () => setConnected(false);

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("connect_error", () => setConnected(false));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [url]);

  const emit = useCallback((event: string, payload?: any) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const on = useCallback(
    <T = any,>(event: string, handler: (data: T) => void) => {
      socketRef.current?.on(event, handler);
    },
    [],
  );

  const off = useCallback(
    <T = any,>(event: string, handler: (data: T) => void) => {
      socketRef.current?.off(event, handler as (...args: any[]) => void);
    },
    [],
  );

  const value: SocketContextType = {
    socket: socketRef.current,
    connected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
