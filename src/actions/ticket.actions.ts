"use server";

import { prisma } from "@/lib/prisma";
import { emitTicketEvent, emitQueueUpdate } from "@/lib/socket";
import { formatDisplayNumber } from "@/lib/utils";
import { SOCKET_EVENTS, DEFAULT_SERVICE_TIME_SECONDS } from "@/lib/constants";
import type { ActionResult, TicketInfo, TicketStatusInfo } from "@/types";

export async function joinQueue(
  queueId: string,
  customerName: string,
  partySize: number = 1,
  userId?: string
): Promise<ActionResult<TicketInfo>> {
  try {
    // Use a transaction to safely increment the ticket number
    const result = await prisma.$transaction(async (tx) => {
      const queue = await tx.queue.findUnique({ where: { id: queueId } });
      if (!queue) throw new Error("Queue not found");
      if (!queue.isActive) throw new Error("Queue is not active");

      const ticketNumber = queue.nextNumber;
      const displayNumber = formatDisplayNumber(queue.prefix, ticketNumber);

      // Create the ticket
      const ticket = await tx.ticket.create({
        data: {
          queueId,
          userId: userId || null,
          customerName,
          ticketNumber,
          displayNumber,
          partySize,
          status: "WAITING",
        },
      });

      // Increment the queue's next number
      await tx.queue.update({
        where: { id: queueId },
        data: { nextNumber: { increment: 1 } },
      });

      return ticket;
    });

    // Emit real-time event
    emitTicketEvent(SOCKET_EVENTS.TICKET_NEW, queueId, {
      ticket: result,
      queueId,
    });

    return { success: true, data: result as TicketInfo };
  } catch (error) {
    console.error("[ticket.actions] joinQueue error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to join queue";
    return { success: false, error: message };
  }
}

export async function callNextTicket(
  queueId: string,
  counterNumber?: number
): Promise<ActionResult<TicketInfo>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find the next WAITING ticket
      const nextTicket = await tx.ticket.findFirst({
        where: { queueId, status: "WAITING" },
        orderBy: { ticketNumber: "asc" },
      });

      if (!nextTicket) throw new Error("No waiting tickets");

      // Update ticket to SERVING
      const updated = await tx.ticket.update({
        where: { id: nextTicket.id },
        data: {
          status: "SERVING",
          calledAt: new Date(),
          servedAt: new Date(),
          counterNumber: counterNumber || null,
        },
      });

      // Update the queue's current number
      await tx.queue.update({
        where: { id: queueId },
        data: { currentNumber: nextTicket.ticketNumber },
      });

      return updated;
    });

    // Fetch updated queue for broadcast
    const updatedQueue = await prisma.queue.findUnique({
      where: { id: queueId },
    });

    // Emit real-time events
    emitTicketEvent(SOCKET_EVENTS.TICKET_CALLED, queueId, {
      ticket: result,
      queueId,
    });

    if (updatedQueue) {
      emitQueueUpdate(queueId, { queue: updatedQueue });
    }

    return { success: true, data: result as TicketInfo };
  } catch (error) {
    console.error("[ticket.actions] callNextTicket error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to call next ticket";
    return { success: false, error: message };
  }
}

export async function completeTicket(
  ticketId: string
): Promise<ActionResult<TicketInfo>> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { queue: true },
    });

    if (!ticket) return { success: false, error: "Ticket not found" };
    if (ticket.status !== "SERVING")
      return { success: false, error: "Ticket is not being served" };

    const now = new Date();
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "COMPLETED",
        completedAt: now,
      },
    });

    // Update average service time for the queue
    if (ticket.servedAt) {
      const serviceTimeSeconds = Math.floor(
        (now.getTime() - ticket.servedAt.getTime()) / 1000
      );
      const currentAvg = ticket.queue.avgServiceTime || DEFAULT_SERVICE_TIME_SECONDS;
      const newAvg = Math.floor((currentAvg + serviceTimeSeconds) / 2);

      await prisma.queue.update({
        where: { id: ticket.queueId },
        data: { avgServiceTime: newAvg },
      });
    }

    // Emit real-time event
    emitTicketEvent(SOCKET_EVENTS.TICKET_COMPLETED, ticket.queueId, {
      ticket: updated,
      queueId: ticket.queueId,
    });

    return { success: true, data: updated as TicketInfo };
  } catch (error) {
    console.error("[ticket.actions] completeTicket error:", error);
    return { success: false, error: "Failed to complete ticket" };
  }
}

export async function skipTicket(
  ticketId: string
): Promise<ActionResult<TicketInfo>> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) return { success: false, error: "Ticket not found" };
    if (ticket.status !== "WAITING" && ticket.status !== "SERVING") {
      return { success: false, error: "Ticket cannot be skipped" };
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "NO_SHOW",
        completedAt: new Date(),
      },
    });

    // Emit real-time event
    emitTicketEvent(SOCKET_EVENTS.TICKET_SKIPPED, ticket.queueId, {
      ticket: updated,
      queueId: ticket.queueId,
    });

    return { success: true, data: updated as TicketInfo };
  } catch (error) {
    console.error("[ticket.actions] skipTicket error:", error);
    return { success: false, error: "Failed to skip ticket" };
  }
}

export async function cancelTicket(
  ticketId: string
): Promise<ActionResult<TicketInfo>> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) return { success: false, error: "Ticket not found" };
    if (ticket.status === "COMPLETED" || ticket.status === "CANCELLED") {
      return { success: false, error: "Ticket cannot be cancelled" };
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
      },
    });

    // Emit real-time event
    emitTicketEvent(SOCKET_EVENTS.TICKET_CANCELLED, ticket.queueId, {
      ticket: updated,
      queueId: ticket.queueId,
    });

    return { success: true, data: updated as TicketInfo };
  } catch (error) {
    console.error("[ticket.actions] cancelTicket error:", error);
    return { success: false, error: "Failed to cancel ticket" };
  }
}

export async function getTicketStatus(
  ticketId: string
): Promise<ActionResult<TicketStatusInfo>> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        queue: {
          include: { business: true },
        },
      },
    });

    if (!ticket) return { success: false, error: "Ticket not found" };

    // Calculate position in queue
    let position = 0;
    let totalWaiting = 0;

    if (ticket.status === "WAITING") {
      const waitingAhead = await prisma.ticket.count({
        where: {
          queueId: ticket.queueId,
          status: "WAITING",
          ticketNumber: { lt: ticket.ticketNumber },
        },
      });
      position = waitingAhead + 1;

      totalWaiting = await prisma.ticket.count({
        where: { queueId: ticket.queueId, status: "WAITING" },
      });
    }

    // Find currently serving ticket
    const servingTicket = await prisma.ticket.findFirst({
      where: { queueId: ticket.queueId, status: "SERVING" },
      orderBy: { ticketNumber: "asc" },
    });

    // Estimate wait time
    const avgServiceTime =
      ticket.queue.avgServiceTime || DEFAULT_SERVICE_TIME_SECONDS;
    const estimatedWaitMinutes = Math.ceil(
      (position * avgServiceTime) / 60
    );

    return {
      success: true,
      data: {
        ticket: ticket as unknown as TicketStatusInfo["ticket"],
        position,
        estimatedWaitMinutes,
        totalWaiting,
        currentServing: servingTicket?.displayNumber || null,
      },
    };
  } catch (error) {
    console.error("[ticket.actions] getTicketStatus error:", error);
    return { success: false, error: "Failed to fetch ticket status" };
  }
}

export async function getDashboardMetrics(businessId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalWaiting, totalServing, totalServedToday, activeQueues, queues] =
      await Promise.all([
        prisma.ticket.count({
          where: {
            queue: { businessId },
            status: "WAITING",
          },
        }),
        prisma.ticket.count({
          where: {
            queue: { businessId },
            status: "SERVING",
          },
        }),
        prisma.ticket.count({
          where: {
            queue: { businessId },
            status: "COMPLETED",
            completedAt: { gte: today },
          },
        }),
        prisma.queue.count({
          where: { businessId, isActive: true },
        }),
        prisma.queue.findMany({
          where: { businessId },
          select: { avgServiceTime: true },
        }),
      ]);

    // Calculate overall average service time
    const avgTimes = queues
      .map((q) => q.avgServiceTime)
      .filter((t): t is number => t !== null);
    const avgServiceTimeMinutes =
      avgTimes.length > 0
        ? Math.round(
            avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length / 60
          )
        : 0;

    return {
      success: true,
      data: {
        totalWaiting,
        totalServing,
        totalServedToday,
        avgServiceTimeMinutes,
        activeQueues,
      },
    };
  } catch (error) {
    console.error("[ticket.actions] getDashboardMetrics error:", error);
    return { success: false, error: "Failed to fetch metrics" };
  }
}
