import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="erp-page flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Pending Administrator Approval</h1>
      <p className="text-[#595959] max-w-md mb-8">
        Your account has been successfully created, but you have not yet been assigned a role. 
        Please contact a System Administrator to assign you the appropriate privileges so you can access the system.
      </p>
      <Link href="/sign-in">
        <Button variant="outline" className="text-[#820AD1] border-[#820AD1]">
          Return to Sign In
        </Button>
      </Link>
    </div>
  );
}
