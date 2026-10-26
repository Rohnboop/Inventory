"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const nextPath = searchParams.get("next") ?? "/";
  const callbackError = searchParams.get("error");

  return (
    <div className="app-shell">
      <main className="page-content" style={{ maxWidth: 460, paddingTop: 90 }}>
        <div className="page-title" style={{ flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <div>
            <p className="eyebrow">Oak &amp; Pine</p>
            <h1>Stockroom</h1>
            <p className="page-subtitle">
              {mode === "login" ? "Sign in to run sales and manage stock." : "Create a staff account to open the register."}
            </p>
          </div>
        </div>
        <div className="table-wrap" style={{ padding: 28 }}>
          {mode === "login" ? (
            <>
              {callbackError && <p className="auth-error">{callbackError}</p>}
              <LoginForm onSuccess={() => router.replace(nextPath)} />
            </>
          ) : (
            <RegisterForm
              onSuccess={(hasSession) => {
                if (hasSession) router.replace(nextPath);
                else setMode("login");
              }}
            />
          )}
          <p className="auth-switch" style={{ marginTop: 18, textAlign: "center", fontSize: 12 }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="secondary-button"
              style={{ padding: 0, background: "none", border: "none", color: "var(--green)", fontSize: 12, fontWeight: 700, textDecoration: "underline" }}
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <p style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/" className="muted" style={{ fontSize: 12, textDecoration: "none" }}>Back to the store</Link>
        </p>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="app-shell" />}>
      <SignInContent />
    </Suspense>
  );
}
