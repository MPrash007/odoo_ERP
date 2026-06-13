"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, Shield, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import { User, UserRole, UserStatus } from "@prisma/client";

export function UsersClient({ initialData }: { initialData: User[] }) {
  const [search, setSearch] = useState("");

  const filteredData = initialData.filter((u) => {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="System Administrator Dashboard"
        description="Manage system users, view their profiles, and assign roles."
      />

      <div className="mt-6 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3 w-12"></th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Joined On</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredData.length > 0 ? (
                filteredData.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F5F2F8]/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#EBE3F2] flex items-center justify-center text-[#820AD1]">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-[#595959]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          user.role === "ADMIN" || user.role === "OWNER"
                            ? "bg-[#820AD1]/10 text-[#820AD1] border-[#820AD1]/20"
                            : "bg-[#F5F5F5] text-[#595959] border-[#E0E0E0]"
                        }
                      >
                        {user.role === "ADMIN" || user.role === "OWNER" ? (
                          <Shield className="w-3 h-3 mr-1 inline-block" />
                        ) : null}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#595959]">
                      {user.position || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-[#595959]">
                      {formatDateTime(user.createdAt.toISOString())}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/users/${user.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-[#820AD1]")}>
                        <Eye className="w-4 h-4 mr-1.5" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[#8C8C8C]"
                  >
                    No users found matching your search.
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
