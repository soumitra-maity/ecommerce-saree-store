// ✅ Import from @clerk/nextjs (not /components)
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignIn 
        appearance={{ 
          elements: { formButtonPrimary: "bg-gray-900 hover:bg-gray-800 text-white" } 
        }} 
      />
    </div>
  );
}