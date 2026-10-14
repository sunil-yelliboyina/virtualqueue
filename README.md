# FlowQ — Virtual Queue Management System

FlowQ is a modern, production-grade virtual queue management web application built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma ORM**, **NextAuth.js v5**, and **Socket.io**.

It eliminates long physical and digital lines by allowing customers to join queues remotely, monitor their live countdown position on their smartphone without downloading an app, and receive real-time audio and visual alerts when their turn arrives.

---

## ⚡ Tech Stack & Architecture

- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui components, Lucide icons.
- **Backend / API:** Next.js Server Actions with transactional database operations.
- **Real-Time Engine:** Socket.io WebSocket server integrated into a unified Node.js HTTP server.
- **Database & ORM:** PostgreSQL managed via Prisma ORM.
- **Authentication:** NextAuth.js v5 (Email/Password credentials for business owners + Anonymous/Guest sessions for walk-in customers).
- **Deployment & Containers:** Multi-stage `Dockerfile` and `docker-compose.yml` for local PostgreSQL and production hosting.

---

## 🚀 Getting Started

> **Note:** As per your development instruction, all files have been scaffolded and generated without executing commands automatically. Follow the steps below when you are ready to run the project.

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` by copying `.env.example`:

```bash
cp .env.example .env.local
```

Default configuration for local development:
```env
DATABASE_URL="postgresql://flowq:flowq_password@localhost:5432/flowq_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-secure-random-string-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

### 3. Start PostgreSQL Database

Using Docker:
```bash
docker compose up -d
```

### 4. Push Prisma Schema & Seed Demo Data

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed realistic demo businesses, queues, and active tickets
npm run db:seed
```

Demo account created by seed script:
- **Email:** `owner@flowq.demo`
- **Password:** `password123`

### 5. Launch the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Oracle VM (Ubuntu guest)

Use this when the app runs inside **Oracle VM VirtualBox** on an Ubuntu 22.04 or 24.04 guest, and you open it from the Windows host.

The server listens on `0.0.0.0:3000`, so VirtualBox NAT port forwarding can reach it. Keep the app URL as `http://localhost:3000` in `.env.local`. The Windows browser uses that address; VirtualBox forwards it into the guest.

### 1. Guest networking

In VirtualBox, select the Ubuntu VM, then **Settings → Network → Adapter 1 → NAT → Advanced → Port Forwarding**:

| Name | Protocol | Host IP | Host Port | Guest Port |
| --- | --- | --- | --- | --- |
| flowq | TCP | 127.0.0.1 | 3000 | 3000 |

### 2. Put the project in the guest home directory

Copy or clone the project to something like `/home/ubuntu/virtualqueue`. Do not run it from a VirtualBox shared folder (`/media/sf_*`). Those mounts break Node file watching and native modules such as Prisma.

Do not reuse a `node_modules` folder that was installed on Windows. The setup script deletes it and installs Linux binaries.

### 3. Run setup inside the guest

```bash
cd ~/virtualqueue
chmod +x scripts/setup-ubuntu.sh
./scripts/setup-ubuntu.sh
```

The script installs Node.js 20, Docker Engine, and the Compose plugin, starts PostgreSQL, applies the Prisma schema, seeds demo data, and starts the app.

Leave it running in that terminal. To install dependencies without starting the server:

```bash
./scripts/setup-ubuntu.sh --no-start
npm run dev
```

To start FlowQ on boot:

```bash
./scripts/setup-ubuntu.sh --no-start --install-service
```

### 4. Open the app from Windows

Visit [http://localhost:3000](http://localhost:3000) on the host.

Demo account:

- **Email:** `owner@flowq.demo`
- **Password:** `password123`

---

## 📱 Features Walkthrough

### 1. Customer View (Mobile-First)
- **Public Directory & Search:** Search active businesses by name or category on the landing page (`/`).
- **One-Tap Join Line:** Customers join via web link (`/join/[slug]` or `/join/[queueId]`) or QR code scan. Supports anonymous guest check-in with name and party size.
- **Live Ticket Tracker (`/track/[ticketId]`):**
  - Displays customer's ticket number (e.g. `T-013`).
  - Animated live position indicator (`#2 in line`, `1 person ahead of you`).
  - Estimated wait time calculated dynamically from historical service averages.
  - Live indicator of currently serving ticket.
  - Real-time updates via Socket.io without page refreshes.
  - Audio and visual banners when approaching turn, next in line, or actively called to a counter/desk.

### 2. Business Admin Dashboard (`/dashboard`)
- **Operational Metrics:** Live count of waiting customers, currently served, total served today, and average service time.
- **Queue Control Panel (`/queues/[queueId]`):**
  - **"Call Next":** Automatically advances the next waiting ticket to SERVING and broadcasts live updates to all connected customers.
  - **Station/Desk Assignment:** Select desk (e.g. `Counter #1`, `Desk A`) to route called customers to specific service stations.
  - **Operational Shortcuts:** `Complete` (records completion time and updates average service statistics), `No-Show / Skip`, and `Cancel`.
  - **QR Code Sharing:** Built-in QR code generator to print or display on front-desk screens.

---

## 📁 Project Directory Structure

```
virtualqueue/
├── docker-compose.yml              # Local PostgreSQL container definition
├── Dockerfile                      # Production container build
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind theme and custom animations
├── components.json                 # shadcn/ui configuration
├── server.ts                       # Custom Node.js server with Next.js + Socket.io
├── prisma/
│   ├── schema.prisma               # Prisma schema (User, Business, Queue, Ticket)
│   └── seed.ts                     # Database seed with demo data
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Session & Socket providers
│   │   ├── page.tsx                # Public landing page with business search
│   │   ├── globals.css             # Tailwind base & CSS variables
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Business owner sign-in
│   │   │   └── register/page.tsx   # Business registration
│   │   ├── (customer)/
│   │   │   ├── join/[queueId]/     # Queue join page (by ID or slug)
│   │   │   └── track/[ticketId]/   # Live customer ticket tracker
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Admin layout with sidebar navigation
│   │   │   ├── dashboard/page.tsx  # Overview & KPI metrics
│   │   │   ├── queues/page.tsx     # Queue list & modal creation
│   │   │   ├── queues/[queueId]/   # Real-time queue control panel
│   │   │   └── settings/page.tsx   # Business profile management
│   │   └── api/
│   │       ├── auth/[...nextauth]/ # NextAuth.js route handler
│   │       └── notifications/      # Notification dispatch hook endpoint
│   ├── actions/
│   │   ├── auth.actions.ts         # User registration, login, guest auth
│   │   ├── business.actions.ts     # Business profile CRUD & search
│   │   ├── queue.actions.ts        # Queue creation & toggle status
│   │   └── ticket.actions.ts       # Join, call-next, complete, skip, cancel
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (button, card, dialog, etc.)
│   │   ├── layout/                 # Navbar, Footer, Sidebar
│   │   ├── customer/               # JoinQueueForm, TicketTracker, PositionIndicator, QueueSearch
│   │   ├── dashboard/              # QueueControlPanel, TicketCard, MetricsCards, StaffAssignment, QueueTable
│   │   ├── providers/              # SessionProvider, SocketProvider
│   │   └── shared/                 # QRCodeDisplay, NotificationBanner, LoadingSpinner
│   ├── hooks/
│   │   ├── useSocket.ts            # Socket.io connection hook
│   │   ├── useRealtimeTickets.ts   # Real-time ticket updates listener
│   │   ├── useRealtimeQueue.ts     # Real-time queue updates listener
│   │   └── useNotification.ts      # Sound and visual alert triggers
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth.js v5 credentials and guest provider
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── socket.ts               # Socket.io server manager & event emitters
│   │   ├── constants.ts            # App constants, socket events, status colors
│   │   └── utils.ts                # Tailwind cn() utility & formatting helpers
│   ├── types/
│   │   └── index.ts                # TypeScript types & interfaces
│   └── middleware.ts               # NextAuth route protection
```
