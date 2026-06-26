import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ConsorcioListItem {
  id: string;
  cuit: string;
  razon_social: string;
  nombre_fantasia: string;
}

interface ConsorcioState {
  selectedId: string | null;
  consorcios: ConsorcioListItem[];
  isLoading: boolean;
  select: (id: string) => void;
}

const STORAGE_KEY = "cesar_consorcio_id";

const FIXTURE_CONSORCIOS: ConsorcioListItem[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    cuit: "30711111111",
    razon_social: "Consorcio Torre Norte",
    nombre_fantasia: "Torre Norte",
  },
];

const ConsorcioContext = createContext<ConsorcioState | null>(null);

function ConsorcioProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  });

  const select = useCallback((id: string) => {
    setSelectedId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <ConsorcioContext.Provider
      value={{
        selectedId,
        consorcios: FIXTURE_CONSORCIOS,
        isLoading: false,
        select,
      }}
    >
      {children}
    </ConsorcioContext.Provider>
  );
}

function useConsorcio(): ConsorcioState {
  const context = useContext(ConsorcioContext);
  if (!context) {
    throw new Error("useConsorcio must be used within a ConsorcioProvider");
  }
  return context;
}

export { ConsorcioProvider, useConsorcio };
export type { ConsorcioListItem };
