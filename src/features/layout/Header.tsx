import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { useMediaQuery } from "@/lib/hooks";
import { Building, LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConsorcio } from "./ConsorcioContext";

interface HeaderProps {
  onMenuToggle: () => void;
}

function Header({ onMenuToggle }: HeaderProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-white">
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <ConsorcioSelector />
      </div>
      <UserMenu />
    </header>
  );
}

function ConsorcioSelector() {
  const { selectedId, consorcios, select } = useConsorcio();
  const selected = consorcios.find((c) => c.id === selectedId);

  return (
    <div className="flex items-center gap-2">
      <Building className="h-4 w-4 text-neutral-400 hidden sm:block" />
      <select
        value={selectedId ?? ""}
        onChange={(e) => select(e.target.value)}
        className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 max-w-48 truncate"
        aria-label="Seleccionar consorcio"
      >
        {consorcios.length === 0 && <option value="">Sin consorcios</option>}
        {selectedId === null && <option value="">Seleccionar consorcio</option>}
        {consorcios.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre_fantasia || c.razon_social}
          </option>
        ))}
      </select>
      {selected && (
        <span className="text-xs text-neutral-500 hidden sm:inline">CUIT: {selected.cuit}</span>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2">
        <User className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-700">{user.nombre_completo}</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
          {user.role}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Cerrar sesión">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Salir</span>
      </Button>
    </div>
  );
}

export { Header };
