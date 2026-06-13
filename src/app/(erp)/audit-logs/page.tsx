import { prisma } from "@/lib/prisma";
import { AuditClient } from "./audit-client";

export default async function AuditLogsPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500, // Limit to recent 500 logs to prevent payload overload
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return <AuditClient initialData={JSON.parse(JSON.stringify(auditLogs))} />;
}
