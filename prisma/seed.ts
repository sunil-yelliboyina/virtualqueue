import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.ticket.deleteMany()
  await prisma.queue.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Demo Business Owner
  const passwordHash = await hash("password123", 10)
  const owner = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "owner@flowq.demo",
      password: passwordHash,
      role: "BUSINESS_OWNER",
      isGuest: false,
    },
  })

  console.log(`👤 Created Demo Owner: ${owner.email} (password: password123)`)

  // 2. Create Business 1: Starlight Bistro
  const bistro = await prisma.business.create({
    data: {
      name: "Starlight Bistro & Cafe",
      slug: "starlight-bistro",
      category: "Restaurant",
      description: "Artisanal bakery and farm-to-table dining in downtown.",
      ownerId: owner.id,
    },
  })

  // Queues for Bistro
  const tableQueue = await prisma.queue.create({
    data: {
      businessId: bistro.id,
      name: "Table Dining Waitlist",
      prefix: "T",
      currentNumber: 12,
      nextNumber: 15,
      isActive: true,
      avgServiceTime: 240,
    },
  })

  const takeoutQueue = await prisma.queue.create({
    data: {
      businessId: bistro.id,
      name: "Takeout & Bar Counter",
      prefix: "B",
      currentNumber: 4,
      nextNumber: 7,
      isActive: true,
      avgServiceTime: 120,
    },
  })

  // Sample Tickets for Table Dining
  await prisma.ticket.createMany({
    data: [
      {
        queueId: tableQueue.id,
        customerName: "Elena Rostova",
        ticketNumber: 12,
        displayNumber: "T-012",
        partySize: 2,
        status: "SERVING",
        counterNumber: 1,
        calledAt: new Date(Date.now() - 3 * 60 * 1000),
        servedAt: new Date(Date.now() - 3 * 60 * 1000),
      },
      {
        queueId: tableQueue.id,
        customerName: "David Miller",
        ticketNumber: 13,
        displayNumber: "T-013",
        partySize: 4,
        status: "WAITING",
        joinedAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        queueId: tableQueue.id,
        customerName: "Sophia Chen",
        ticketNumber: 14,
        displayNumber: "T-014",
        partySize: 3,
        status: "WAITING",
        joinedAt: new Date(Date.now() - 8 * 60 * 1000),
      },
    ],
  })

  // 3. Create Business 2: CityCare Clinic
  const clinic = await prisma.business.create({
    data: {
      name: "CityCare Urgent Walk-in Clinic",
      slug: "citycare-clinic",
      category: "Healthcare",
      description: "Fast outpatient consultations, minor care, and diagnostics.",
      ownerId: owner.id,
    },
  })

  const clinicQueue = await prisma.queue.create({
    data: {
      businessId: clinic.id,
      name: "General Consultations",
      prefix: "A",
      currentNumber: 21,
      nextNumber: 24,
      isActive: true,
      avgServiceTime: 300,
    },
  })

  await prisma.ticket.createMany({
    data: [
      {
        queueId: clinicQueue.id,
        customerName: "James Wilson",
        ticketNumber: 21,
        displayNumber: "A-021",
        partySize: 1,
        status: "SERVING",
        counterNumber: 3,
        calledAt: new Date(Date.now() - 5 * 60 * 1000),
        servedAt: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        queueId: clinicQueue.id,
        customerName: "Maria Garcia",
        ticketNumber: 22,
        displayNumber: "A-022",
        partySize: 1,
        status: "WAITING",
        joinedAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        queueId: clinicQueue.id,
        customerName: "Robert Taylor",
        ticketNumber: 23,
        displayNumber: "A-023",
        partySize: 2,
        status: "WAITING",
        joinedAt: new Date(Date.now() - 12 * 60 * 1000),
      },
    ],
  })

  console.log("✅ Database seeded with demo businesses, queues, and tickets!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
