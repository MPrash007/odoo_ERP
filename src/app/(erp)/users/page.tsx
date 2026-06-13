import { UsersClient } from "./users-client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requirePermission("users", "read");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <UsersClient initialData={users} />;
}
