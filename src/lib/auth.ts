import { auth, currentUser as getClerkUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, type Module, type Action } from "@/lib/rbac";
import type { User } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: No active session");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // Auto-provision user if webhook didn't sync them (e.g. local dev)
    const clerkUser = await getClerkUser();
    if (!clerkUser) {
      throw new Error("User not found in database or Clerk");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "New User";

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        profileImage: clerkUser.imageUrl,
        role: "NONE", // Default to NONE for local dev testing until admin approves
        status: "ACTIVE",
      },
    });
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User account is not active");
  }

  return user;
}

export async function requirePermission(
  module: Module,
  action: Action
): Promise<User> {
  const user = await getCurrentUser();

  if (!hasPermission(user.role, module, action)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function optionalCurrentUser(): Promise<User | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}
