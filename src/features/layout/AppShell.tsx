import { HealthIndicator } from "@/features/auth/HealthIndicator";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import { ConsorcioProvider } from "./ConsorcioContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ConsorcioProvider>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className="flex-1 flex flex-col min-w-0"
          {...(sidebarOpen ? ({ inert: true } as React.HTMLAttributes<HTMLDivElement>) : {})}
        >
          <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} sidebarOpen={sidebarOpen} />
          <Breadcrumbs />
          <main className="flex-1 p-4 overflow-y-auto">
            <Outlet />
          </main>
          <footer className="flex items-center justify-between h-10 px-4 border-t text-xs text-neutral-500 bg-white">
            <span>CESAR v0.1.0</span>
            <HealthIndicator />
          </footer>
        </div>
      </div>
    </ConsorcioProvider>
  );
}

export { AppShell };
