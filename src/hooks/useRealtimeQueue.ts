"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_EVENTS } from "@/lib/constants";
import type { QueueInfo, QueueUpdatePayload } from "@/types";

/**
 * Hook that provides real-time queue state updates.
 * Listens for queue-level changes (currentNumber, isActive, etc).
 */
export function useRealtimeQueue(
  queueId: string,
  initialQueue: QueueInfo | null = null
) {
  const socket = useSocket();
  const [queue, setQueue] = useState<QueueInfo | null>(initialQueue);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket || !queueId) return;

    // Join the queue room
    socket.emit(SOCKET_EVENTS.JOIN_QUEUE_ROOM, queueId);
    setIsConnected(true);

    const handleQueueUpdate = (payload: QueueUpdatePayload) => {
      setQueue(payload.queue);
    };

    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdate);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_QUEUE_ROOM, queueId);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdate);
      setIsConnected(false);
    };
  }, [socket, queueId]);

  return { queue, isConnected, setQueue };
}
