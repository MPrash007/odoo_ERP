"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";

export default function ERPError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ERP Error Boundary caught:", error);
  }, [error]);

  const isUnauthorized = error.message.includes("Access Denied");

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-[#F5F2F8]">
          {isUnauthorized ? (
            <ShieldAlert className="w-8 h-8 text-[#E53935]" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-[#FFB300]" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {isUnauthorized ? "Access Denied" : "Something went wrong"}
          </h1>
          <p className="text-sm text-[#595959]">
            {isUnauthorized
              ? error.message.replace("Access Denied: ", "")
              : "We encountered an unexpected error while loading this page."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-[#F5F2F8]">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          {!isUnauthorized && (
            <Button
              className="w-full sm:w-auto bg-[#820AD1] hover:bg-[#9013D8]"
              onClick={() => reset()}
            >
              Try Again
            </Button>
          )}
          {isUnauthorized && (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full bg-[#820AD1] hover:bg-[#9013D8]">
                Return to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
