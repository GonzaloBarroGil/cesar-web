import { useListConsorcios } from "@/api/generated/consorcio/consorcio";
import type { ConsorcioResponse } from "@/api/generated/models";
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface ConsorcioListItem {
  id: string;
  cuit: string;
  razon_social: string;
}

interface ConsorcioState {
  selectedId: string | null;
  consorcios: ConsorcioListItem[];
  isLoading: boolean;
  select: (id: string) => void;
}

const STORAGE_KEY = "cesar_consorcio_id";

function toListItem(c: ConsorcioResponse): ConsorcioListItem {
  return {
    id: c.id ?? "",
    cuit: c.cuit?.value ?? "",
    razon_social: c.razon_social ?? "",
  };
}

const ConsorcioContext = createContext<ConsorcioState | null>(null);

function ConsorcioProvider({ children }: { children: ReactNode }) {
  const { data: apiConsorcios = [], isLoading } = useListConsorcios();

  const consorcios = useMemo(() => apiConsorcios.map(toListItem), [apiConsorcios]);

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
        consorcios,
        isLoading,
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

export { ConsorcioContext, ConsorcioProvider, useConsorcio };
export type { ConsorcioListItem };
