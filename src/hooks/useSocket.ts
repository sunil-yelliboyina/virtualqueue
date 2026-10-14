"use client";

import { useSocketContext } from "@/components/providers/SocketProvider";

/**
 * Hook to access the Socket.io client instance from any component.
 */
export function useSocket() {
  return useSocketContext();
}
