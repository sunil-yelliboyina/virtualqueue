"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import type { ActionResult, UserProfile } from "@/types";
import type { Role } from "@prisma/client";

export async function register(
  name: string,
  email: string,
  password: string,
  role: Role = "CUSTOMER"
): Promise<ActionResult<UserProfile>> {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isGuest: false,
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isGuest: user.isGuest,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error("[auth.actions] register error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function login(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    console.error("[auth.actions] login error:", error);
    return { success: false, error: "Invalid email or password" };
  }
}

export async function loginAsGuest(
  name?: string
): Promise<ActionResult<{ userId: string }>> {
  try {
    const result = await signIn("guest", {
      name: name || undefined,
      redirect: false,
    });
    // The guest user is created inside the authorize callback
    return { success: true, data: { userId: result?.id || "" } };
  } catch (error) {
    console.error("[auth.actions] loginAsGuest error:", error);
    return { success: false, error: "Failed to sign in as guest" };
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirect: false });
}
