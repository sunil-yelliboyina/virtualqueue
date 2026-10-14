import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { SOCKET_EVENTS } from "@/lib/constants";

let io: SocketIOServer | null = null;

/**
 * Initialize the Socket.io server instance.
 * Called once from the custom server.ts during startup.
 */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          : true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Client joins a queue room to receive real-time updates for that queue
    socket.on(SOCKET_EVENTS.JOIN_QUEUE_ROOM, (queueId: string) => {
      socket.join(`queue:${queueId}`);
      console.log(`[Socket.io] ${socket.id} joined room queue:${queueId}`);
    });

    // Client leaves a queue room
    socket.on(SOCKET_EVENTS.LEAVE_QUEUE_ROOM, (queueId: string) => {
      socket.leave(`queue:${queueId}`);
      console.log(`[Socket.io] ${socket.id} left room queue:${queueId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("[Socket.io] Server initialized");
  return io;
}

/**
 * Get the Socket.io server instance.
 * Used by Server Actions to emit events after mutations.
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit a ticket event to all clients in a queue room.
 */
export function emitTicketEvent(
  eventName: string,
  queueId: string,
  payload: Record<string, unknown>
) {
  const server = getIO();
  if (server) {
    server.to(`queue:${queueId}`).emit(eventName, payload);
  }
}

/**
 * Emit a queue update event to all clients in a queue room.
 */
export function emitQueueUpdate(
  queueId: string,
  payload: Record<string, unknown>
) {
  const server = getIO();
  if (server) {
    server.to(`queue:${queueId}`).emit(SOCKET_EVENTS.QUEUE_UPDATED, payload);
  }
}
