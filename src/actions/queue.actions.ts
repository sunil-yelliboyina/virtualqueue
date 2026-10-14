"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitQueueUpdate } from "@/lib/socket";
import type { ActionResult, QueueInfo, QueueWithTickets } from "@/types";

export async function createQueue(
  businessId: string,
  data: { name: string; prefix: string }
): Promise<ActionResult<QueueInfo>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: session.user.id },
    });
    if (!business) {
      return { success: false, error: "Business not found or not authorized" };
    }

    const queue = await prisma.queue.create({
      data: {
        businessId,
        name: data.name,
        prefix: data.prefix.toUpperCase(),
      },
    });

    return { success: true, data: queue as QueueInfo };
  } catch (error) {
    console.error("[queue.actions] createQueue error:", error);
    return { success: false, error: "Failed to create queue" };
  }
}

export async function toggleQueueActive(
  queueId: string
): Promise<ActionResult<QueueInfo>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const queue = await prisma.queue.findFirst({
      where: { id: queueId },
      include: { business: true },
    });

    if (!queue || queue.business.ownerId !== session.user.id) {
      return { success: false, error: "Queue not found or not authorized" };
    }

    const updated = await prisma.queue.update({
      where: { id: queueId },
      data: { isActive: !queue.isActive },
    });

    // Emit real-time update
    emitQueueUpdate(queueId, { queue: updated });

    return { success: true, data: updated as QueueInfo };
  } catch (error) {
    console.error("[queue.actions] toggleQueueActive error:", error);
    return { success: false, error: "Failed to toggle queue" };
  }
}

export async function getActiveQueues(
  businessId: string
): Promise<ActionResult<QueueInfo[]>> {
  try {
    const queues = await prisma.queue.findMany({
      where: { businessId, isActive: true },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: queues as QueueInfo[] };
  } catch (error) {
    console.error("[queue.actions] getActiveQueues error:", error);
    return { success: false, error: "Failed to fetch queues" };
  }
}

export async function getQueueWithTickets(
  queueId: string
): Promise<ActionResult<QueueWithTickets>> {
  try {
    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      include: {
        business: true,
        tickets: {
          where: {
            status: { in: ["WAITING", "SERVING"] },
          },
          orderBy: { ticketNumber: "asc" },
        },
      },
    });

    if (!queue) {
      return { success: false, error: "Queue not found" };
    }

    return { success: true, data: queue as unknown as QueueWithTickets };
  } catch (error) {
    console.error("[queue.actions] getQueueWithTickets error:", error);
    return { success: false, error: "Failed to fetch queue" };
  }
}

export async function getAllQueuesForBusiness(
  businessId: string
): Promise<ActionResult<QueueInfo[]>> {
  try {
    const queues = await prisma.queue.findMany({
      where: { businessId },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: queues as QueueInfo[] };
  } catch (error) {
    console.error("[queue.actions] getAllQueuesForBusiness error:", error);
    return { success: false, error: "Failed to fetch queues" };
  }
}
