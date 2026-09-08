import type { ReactNode } from "react";

export function StatusMessage({ children }: { children: ReactNode }) {
  return <p className="status-message">{children}</p>;
}