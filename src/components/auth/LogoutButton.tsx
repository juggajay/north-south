"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button, ButtonProps } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps extends Omit<ButtonProps, "loading" | "onClick"> {
  /** Optional: show icon */
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  showIcon = false,
  children,
  ...props
}: LogoutButtonProps) {
  const { signOut } = useAuthActions();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Failed to sign out:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      loading={loading}
      onClick={handleLogout}
      {...props}
    >
      {showIcon && <LogOut />}
      {children || "Logout"}
    </Button>
  );
}
