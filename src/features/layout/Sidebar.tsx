import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks";
import { Building, Receipt, FileText, Scale, DollarSign, TrendingUp, Home } from "lucide-react";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", icon: Home, label: "Inicio", roles: ["ADMIN"] },
  { to: "/consorcios", icon: Building, label: "Consorcios", roles: ["ADMIN"] },
  { to: "/expenses", icon: Receipt, label: "Expensas", roles: ["ADMIN"] },
  { to: "/invoices", icon: FileText, label: "Facturación", roles: ["ADMIN", "ACCOUNTANT"] },
  { to: "/debt", icon: Scale, label: "Deuda", roles: ["ADMIN"] },
  { to: "/payments", icon: DollarSign, label: "Pagos", roles: ["ADMIN"] },
  { to: "/incomes-outputs", icon: TrendingUp, label: "Ing./Egr.", roles: ["ADMIN"] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isDesktop && !open) return null;

  return (
    <>
      {!isDesktop && open && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={onClose} />
      )}
      <aside
        className={cn(
          "flex flex-col bg-neutral-900 text-neutral-100",
          isDesktop ? "w-56 min-h-screen" : "fixed inset-y-0 left-0 z-40 w-56",
        )}
      >
        <div className="px-4 py-5 border-b border-neutral-700">
          <span className="text-lg font-semibold tracking-tight">CESAR</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export { Sidebar };
