"use client";

import { useState } from "react";
import { AuthSplitShell, type AuthMode } from "@/components/auth/AuthSplitShell";
import { LoginForm } from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export function AuthAccessView({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <AuthSplitShell mode={mode} onModeChange={setMode}>
      {mode === "login" ? (
        <LoginForm onModeChange={() => setMode("register")} />
      ) : (
        <RegisterForm onModeChange={() => setMode("login")} />
      )}
    </AuthSplitShell>
  );
}
