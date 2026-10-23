"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  if (isAuthenticated && user) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <div className="form-heading">
            <h3>Signed in</h3>
          </div>
          <p className="muted">Welcome, {user.email}</p>
          <p className="muted" style={{fontSize: 12}}>{user.user_metadata?.full_name || "Store staff"}</p>
          <div className="form-actions" style={{marginTop: 20}}>
            <button className="secondary-button" onClick={onClose}>Close</button>
            <button className="primary-button" onClick={async () => { await logout(); onClose(); router.replace("/signin"); router.refresh(); }}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-heading">
          <h3>{mode === "login" ? "Sign in" : "Create account"}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {mode === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <RegisterForm onSuccess={(hasSession) => { if (hasSession) onClose(); }} />
        )}
        <p className="auth-switch" style={{marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--muted)"}}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="secondary-button"
            style={{padding: 0, background: "none", border: "none", color: "var(--green)", fontSize: 12, fontWeight: 700, textDecoration: "underline"}}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
