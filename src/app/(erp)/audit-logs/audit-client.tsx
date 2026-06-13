"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
  user: { name: string; email: string };
}

export function AuditClient({ initialData }: { initialData: AuditLog[] }) {
  const [search, setSearch] = useState("");

  const filteredData = initialData.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType.toLowerCase().includes(search.toLowerCase()) ||
    log.user.name.toLowerCase().includes(search.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="erp-page">
      <PageHeader
        title="Audit Logs"
        description="System-wide trail of data modifications and inventory movements."
      />

      <div className="mt-6 flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search by action, entity, user, or details..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[800px] erp-scrollbar relative">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-[#F5F2F8]/95 text-[#595959] font-medium sticky top-0 z-10 backdrop-blur-sm border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-3 whitespace-nowrap">User</th>
                <th className="px-4 py-3 whitespace-nowrap">Action</th>
                <th className="px-4 py-3 whitespace-nowrap">Entity</th>
                <th className="px-4 py-3 whitespace-nowrap">Entity ID</th>
                <th className="px-4 py-3 w-1/3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F5F2F8]/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-[#595959] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A1A1A] whitespace-nowrap">
                      {log.user.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={
                          log.action.includes("CREATE")
                            ? "bg-[#00A868]/10 text-[#00A868]"
                            : log.action.includes("UPDATE") || log.action.includes("ADJUST")
                            ? "bg-[#E08600]/10 text-[#E08600]"
                            : log.action.includes("DELETE")
                            ? "bg-[#E53935]/10 text-[#E53935]"
                            : "bg-[#820AD1]/10 text-[#820AD1]"
                        }
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#595959] whitespace-nowrap">
                      {log.entityType}
                    </td>
                    <td className="px-4 py-3 text-[#8C8C8C] text-xs font-mono whitespace-nowrap">
                      {log.entityId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-[#595959] text-xs font-mono break-all max-w-[300px]">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[#8C8C8C]"
                  >
                    No audit logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
