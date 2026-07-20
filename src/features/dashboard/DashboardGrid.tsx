import type { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
}

function DashboardGrid({ children }: DashboardGridProps) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>;
}

export { DashboardGrid };
export type { DashboardGridProps };
