import type { ReactNode } from "react";
import { ConsorcioContext } from "../ConsorcioContext";
import type { ConsorcioListItem } from "../ConsorcioContext";

interface MockConsorcioProviderProps {
  children: ReactNode;
  selectedId?: string | null;
  consorcios?: ConsorcioListItem[];
  select?: (id: string) => void;
}

function MockConsorcioProvider({
  children,
  selectedId = null,
  consorcios = [],
  select = () => {},
}: MockConsorcioProviderProps) {
  return (
    <ConsorcioContext.Provider value={{ selectedId, consorcios, isLoading: false, select }}>
      {children}
    </ConsorcioContext.Provider>
  );
}

export { MockConsorcioProvider };
export type { ConsorcioListItem };
