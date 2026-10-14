import { Role, TicketStatus } from "@prisma/client";

// ─── Re-export Prisma Enums ────────────────────────────────────────
export { Role, TicketStatus };

// ─── User Types ────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  isGuest: boolean;
  createdAt: Date;
}

// ─── Business Types ────────────────────────────────────────────────
export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logoUrl: string | null;
  ownerId: string;
  createdAt: Date;
}

export interface BusinessWithQueues extends BusinessProfile {
  queues: QueueInfo[];
}

// ─── Queue Types ───────────────────────────────────────────────────
export interface QueueInfo {
  id: string;
  businessId: string;
  name: string;
  prefix: string;
  currentNumber: number;
  nextNumber: number;
  isActive: boolean;
  avgServiceTime: number | null;
  createdAt: Date;
}

export interface QueueWithTickets extends QueueInfo {
  tickets: TicketInfo[];
  business: BusinessProfile;
}

// ─── Ticket Types ──────────────────────────────────────────────────
export interface TicketInfo {
  id: string;
  queueId: string;
  userId: string | null;
  customerName: string;
  ticketNumber: number;
  displayNumber: string;
  partySize: number;
  status: TicketStatus;
  counterNumber: number | null;
  joinedAt: Date;
  calledAt: Date | null;
  servedAt: Date | null;
  completedAt: Date | null;
}

export interface TicketWithQueue extends TicketInfo {
  queue: QueueInfo & {
    business: BusinessProfile;
  };
}

export interface TicketStatusInfo {
  ticket: TicketWithQueue;
  position: number;
  estimatedWaitMinutes: number;
  totalWaiting: number;
  currentServing: string | null;
}

// ─── Action Result Types ───────────────────────────────────────────
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Socket.io Event Payloads ──────────────────────────────────────
export interface TicketEventPayload {
  ticket: TicketInfo;
  queueId: string;
}

export interface QueueUpdatePayload {
  queue: QueueInfo;
}

// ─── Form Types ────────────────────────────────────────────────────
export interface JoinQueueFormData {
  customerName: string;
  partySize: number;
}

export interface CreateBusinessFormData {
  name: string;
  description?: string;
  category?: string;
}

export interface CreateQueueFormData {
  name: string;
  prefix: string;
}

// ─── Dashboard Metrics ─────────────────────────────────────────────
export interface DashboardMetrics {
  totalWaiting: number;
  totalServing: number;
  totalServedToday: number;
  avgServiceTimeMinutes: number;
  activeQueues: number;
}
