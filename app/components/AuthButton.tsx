"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";

export function AuthButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <button
        className="avatar"
        aria-label={isAuthenticated ? "Open profile" : "Sign in"}
        onClick={() => setModalOpen(true)}
      >
        {isLoading ? "…" : user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? "AR"}
      </button>
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
