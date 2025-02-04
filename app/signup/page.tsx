// app/signup/page.tsx
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side with background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 p-12 text-white relative">
        <div className="max-w-md">
          <div className="flex items-center space-x-3 mb-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="text-2xl font-bold">DudhKela</span>
          </div>

          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-xl leading-relaxed">
                "Join thousands of dairy farmers who are revolutionizing their
                business with our comprehensive management solution."
              </p>
              <footer className="text-sm mt-4">The DudhKela Team</footer>
            </blockquote>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full">
          <SignupForm className="mx-auto" />
          <p className="mt-8 text-center text-sm text-gray-500">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
