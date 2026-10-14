export const APP_NAME = "FlowQ";
export const APP_DESCRIPTION =
  "Virtual Queue Management — Skip the line, not the service.";

/** Number of positions ahead at which to trigger "almost your turn" notification */
export const NOTIFICATION_THRESHOLD = 3;

/** Default estimated service time per customer in seconds */
export const DEFAULT_SERVICE_TIME_SECONDS = 180; // 3 minutes

/** Socket.io event names */
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_QUEUE_ROOM: "queue:join",
  LEAVE_QUEUE_ROOM: "queue:leave",

  // Server -> Client
  TICKET_NEW: "ticket:new",
  TICKET_CALLED: "ticket:called",
  TICKET_COMPLETED: "ticket:completed",
  TICKET_SKIPPED: "ticket:skipped",
  TICKET_CANCELLED: "ticket:cancelled",
  QUEUE_UPDATED: "queue:updated",
} as const;

/** Ticket status display labels */
export const STATUS_LABELS: Record<string, string> = {
  WAITING: "Waiting",
  SERVING: "Now Serving",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

/** Ticket status colors (Tailwind classes) */
export const STATUS_COLORS: Record<string, string> = {
  WAITING: "bg-amber-100 text-amber-800 border-amber-200",
  SERVING: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  NO_SHOW: "bg-orange-100 text-orange-800 border-orange-200",
};

/** Business categories */
export const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Healthcare",
  "Government",
  "Banking",
  "Retail",
  "Salon & Spa",
  "Automotive",
  "Education",
  "Entertainment",
  "Other",
] as const;
