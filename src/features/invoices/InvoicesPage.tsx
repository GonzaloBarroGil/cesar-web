import { apiClient } from "@/api/client";
import { getInvoiceByCae } from "@/api/generated/invoices/invoices";
import type { Invoice } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InvoiceList } from "./InvoiceList";
import { invoiceKeys } from "./queryKeys";

function InvoicesPage() {
  const navigate = useNavigate();
  const [caeSearch, setCaeSearch] = useState("");
  const [caeError, setCaeError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: invoiceKeys.lists(),
    queryFn: () => apiClient<Invoice[]>({ url: "/invoices", method: "GET" }),
  });

  const handleCaeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caeSearch.trim()) return;
    setCaeError(null);
    setIsSearching(true);
    try {
      const result = await getInvoiceByCae(caeSearch.trim());
      navigate(`/invoices/${result.data.id}`);
    } catch {
      setCaeError("No se encontró factura con ese CAE.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Facturación</h1>
        <div className="flex gap-2">
          <Link to="/invoices/factura-a/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Factura A
            </Button>
          </Link>
          <Link to="/invoices/factura-b/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Factura B
            </Button>
          </Link>
          <Link to="/invoices/factura-c/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Factura C
            </Button>
          </Link>
          <Link to="/invoices/recibos/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Recibo
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleCaeSearch} className="flex items-start gap-2 mb-4 max-w-md">
        <div className="flex-1">
          <Input
            aria-label="Buscar por CAE"
            value={caeSearch}
            onChange={(e) => {
              setCaeSearch(e.target.value);
              setCaeError(null);
            }}
            placeholder="Buscar por CAE"
          />
          {caeError && <p className="text-xs text-red-600 mt-1">{caeError}</p>}
        </div>
        <Button type="submit" variant="outline" disabled={isSearching}>
          <Search className="h-4 w-4 mr-1" />
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </form>

      <InvoiceList invoices={invoices} isLoading={isLoading} error={error as Error | null} />
    </div>
  );
}

export { InvoicesPage };
