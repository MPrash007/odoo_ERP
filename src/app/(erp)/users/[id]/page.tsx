import { UserDetailClient } from "./user-detail-client";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [user, vendors] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
    }),
    prisma.vendor.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
  ]);

  if (!user) {
    notFound();
  }

  return <UserDetailClient initialData={user} vendors={vendors} />;
}
