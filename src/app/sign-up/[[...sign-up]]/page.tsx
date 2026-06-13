import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2F8]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#820AD1] mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Shiv Furniture Works
          </h1>
          <p className="text-[#595959] mt-1">Mini ERP — Create Account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-[#820AD1] hover:bg-[#9013D8] active:bg-[#6A08AC]",
              card: "shadow-lg rounded-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
