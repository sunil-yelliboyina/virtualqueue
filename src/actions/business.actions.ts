"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type {
  ActionResult,
  BusinessProfile,
  BusinessWithQueues,
} from "@/types";

export async function createBusiness(data: {
  name: string;
  description?: string;
  category?: string;
}): Promise<ActionResult<BusinessProfile>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Generate a unique slug
    let slug = slugify(data.name);
    const existingSlug = await prisma.business.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const business = await prisma.business.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        category: data.category || null,
        ownerId: session.user.id,
      },
    });

    // Update user role to BUSINESS_OWNER if not already
    if (session.user.role !== "BUSINESS_OWNER") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "BUSINESS_OWNER" },
      });
    }

    return { success: true, data: business as BusinessProfile };
  } catch (error) {
    console.error("[business.actions] createBusiness error:", error);
    return { success: false, error: "Failed to create business" };
  }
}

export async function updateBusiness(
  businessId: string,
  data: { name?: string; description?: string; category?: string }
): Promise<ActionResult<BusinessProfile>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: session.user.id },
    });
    if (!business) {
      return { success: false, error: "Business not found or not authorized" };
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.category !== undefined && { category: data.category }),
      },
    });

    return { success: true, data: updated as BusinessProfile };
  } catch (error) {
    console.error("[business.actions] updateBusiness error:", error);
    return { success: false, error: "Failed to update business" };
  }
}

export async function getBusinessBySlug(
  slug: string
): Promise<ActionResult<BusinessWithQueues>> {
  try {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        queues: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    return { success: true, data: business as unknown as BusinessWithQueues };
  } catch (error) {
    console.error("[business.actions] getBusinessBySlug error:", error);
    return { success: false, error: "Failed to fetch business" };
  }
}

export async function getMyBusiness(): Promise<
  ActionResult<BusinessWithQueues>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      include: {
        queues: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!business) {
      return { success: false, error: "No business found" };
    }

    return { success: true, data: business as unknown as BusinessWithQueues };
  } catch (error) {
    console.error("[business.actions] getMyBusiness error:", error);
    return { success: false, error: "Failed to fetch business" };
  }
}

export async function searchBusinesses(
  query: string
): Promise<ActionResult<BusinessProfile[]>> {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: businesses as BusinessProfile[],
    };
  } catch (error) {
    console.error("[business.actions] searchBusinesses error:", error);
    return { success: false, error: "Failed to search businesses" };
  }
}
