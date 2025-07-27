"use client";

import { useEffect } from "react";
import { LoginForm } from "@/lib/components/core/auth/login-form";
import { useAuth } from "@/lib/components/core/auth/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = (user: any) => {
    login(user);
    router.push("/home");
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
} 