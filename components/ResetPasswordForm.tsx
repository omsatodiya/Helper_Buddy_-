"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/app/fireConfig";

interface ResetPasswordFormProps {
  className?: string;
}

type PasswordRequirement = {
  regex: RegExp;
  message: string;
};

const passwordRequirements: PasswordRequirement[] = [
  { regex: /[A-Z]/, message: "one uppercase letter" },
  { regex: /[a-z]/, message: "one lowercase letter" },
  { regex: /[0-9]/, message: "one number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "one special character" },
  { regex: /.{8,}/, message: "minimum of 8 characters" },
];

export function ResetPasswordForm({ className = "" }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      setError("Invalid password reset link");
      return;
    }

    const verifyCode = async () => {
      try {
        const email = await verifyPasswordResetCode(auth, code);
        setEmail(email);
        setOobCode(code);
      } catch (error) {
        setError("This password reset link has expired or is invalid");
      }
    };

    verifyCode();
  }, [searchParams]);

  const validatePassword = (password: string): string[] => {
    return passwordRequirements
      .filter((requirement) => !requirement.regex.test(password))
      .map((requirement) => requirement.message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate password requirements
    const missingRequirements = validatePassword(password);
    if (missingRequirements.length > 0) {
      setError(`Password must contain ${missingRequirements.join(", ")}`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!oobCode) {
      setError("Invalid reset code");
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      router.push("/login?resetSuccess=true");
    } catch (error: any) {
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className={`w-full max-w-md ${className}`}>
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowPasswordRequirements(true)}
            disabled={isLoading}
          />
          {showPasswordRequirements && (
            <div className="absolute z-10 mt-1 w-full p-4 bg-white border border-gray-200 rounded-md shadow-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must contain:
              </p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li
                    key={index}
                    className={`text-sm flex items-center space-x-2 ${
                      req.regex.test(password)
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}>
                    {req.regex.test(password) ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      </svg>
                    )}
                    <span>At least {req.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setShowPasswordRequirements(false)}
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
