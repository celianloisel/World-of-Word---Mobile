import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type UseSocketIOOptions = Parameters<typeof io>[1] & {
  onDisconnectWhileInLobby?: (reason?: Socket.DisconnectReason | Error) => void;
};

export function useSocketIO(url: string, opts?: UseSocketIOOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const lobbyIdRef = useRef<string | null>(null);
  const [isInLobby, setIsInLobby] = useState(false);

  const setLobbyId = useCallback((lobbyId: string | null) => {
    lobbyIdRef.current = lobbyId;
    setIsInLobby(Boolean(lobbyId));
  }, []);

  useEffect(() => {
    const socket = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      ...opts,
    });

    socketRef.current = socket;

    const onConnect = () => setConnected(true);

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      setConnected(false);
      if (lobbyIdRef.current && opts?.onDisconnectWhileInLobby) {
        opts.onDisconnectWhileInLobby(reason);
      }
    };

    const onConnectError = (err: Error) => {
      setConnected(false);
      if (lobbyIdRef.current && opts?.onDisconnectWhileInLobby) {
        opts.onDisconnectWhileInLobby(err);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.offAny();
      socket.close();
    };
  }, [url, opts]);

  const emit = useCallback((event: string, payload?: any) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const on = useCallback(
    <T = any>(event: string, handler: (data: T) => void) => {
      socketRef.current?.on(event, handler);
    },
    [],
  );

  const off = useCallback(
    <T = any>(event: string, handler: (data: T) => void) => {
      socketRef.current?.off(event, handler as (...args: any[]) => void);
    },
    [],
  );

  return {
    connected,
    emit,
    on,
    off,
    setLobbyId,
    isInLobby,
    socket: socketRef.current,
  };
}
