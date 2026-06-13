import { getCurrentUser } from "@/lib/auth";
import { ERPLayoutClient } from "./layout-client";

export default async function ERPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure the user is synced to the database before rendering any ERP page
  await getCurrentUser();

  return <ERPLayoutClient>{children}</ERPLayoutClient>;
}
