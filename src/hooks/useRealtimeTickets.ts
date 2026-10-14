"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_EVENTS } from "@/lib/constants";
import type { TicketInfo, TicketEventPayload } from "@/types";

/**
 * Hook that provides real-time ticket updates for a given queue.
 * Joins the queue's Socket.io room and listens for all ticket events.
 */
export function useRealtimeTickets(
  queueId: string,
  initialTickets: TicketInfo[] = []
) {
  const socket = useSocket();
  const [tickets, setTickets] = useState<TicketInfo[]>(initialTickets);
  const [isConnected, setIsConnected] = useState(false);

  const updateTicket = useCallback(
    (updatedTicket: TicketInfo) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
    },
    []
  );

  const removeTicket = useCallback((ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  }, []);

  useEffect(() => {
    if (!socket || !queueId) return;

    // Join the queue room
    socket.emit(SOCKET_EVENTS.JOIN_QUEUE_ROOM, queueId);
    setIsConnected(true);

    // Listen for new tickets
    const handleNewTicket = (payload: TicketEventPayload) => {
      if (payload.queueId === queueId) {
        setTickets((prev) => [...prev, payload.ticket]);
      }
    };

    // Listen for ticket status changes
    const handleTicketCalled = (payload: TicketEventPayload) => {
      if (payload.queueId === queueId) {
        updateTicket(payload.ticket);
      }
    };

    const handleTicketCompleted = (payload: TicketEventPayload) => {
      if (payload.queueId === queueId) {
        // Remove completed tickets from the active list
        removeTicket(payload.ticket.id);
      }
    };

    const handleTicketSkipped = (payload: TicketEventPayload) => {
      if (payload.queueId === queueId) {
        removeTicket(payload.ticket.id);
      }
    };

    const handleTicketCancelled = (payload: TicketEventPayload) => {
      if (payload.queueId === queueId) {
        removeTicket(payload.ticket.id);
      }
    };

    socket.on(SOCKET_EVENTS.TICKET_NEW, handleNewTicket);
    socket.on(SOCKET_EVENTS.TICKET_CALLED, handleTicketCalled);
    socket.on(SOCKET_EVENTS.TICKET_COMPLETED, handleTicketCompleted);
    socket.on(SOCKET_EVENTS.TICKET_SKIPPED, handleTicketSkipped);
    socket.on(SOCKET_EVENTS.TICKET_CANCELLED, handleTicketCancelled);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_QUEUE_ROOM, queueId);
      socket.off(SOCKET_EVENTS.TICKET_NEW, handleNewTicket);
      socket.off(SOCKET_EVENTS.TICKET_CALLED, handleTicketCalled);
      socket.off(SOCKET_EVENTS.TICKET_COMPLETED, handleTicketCompleted);
      socket.off(SOCKET_EVENTS.TICKET_SKIPPED, handleTicketSkipped);
      socket.off(SOCKET_EVENTS.TICKET_CANCELLED, handleTicketCancelled);
      setIsConnected(false);
    };
  }, [socket, queueId, updateTicket, removeTicket]);

  return { tickets, isConnected, setTickets };
}
