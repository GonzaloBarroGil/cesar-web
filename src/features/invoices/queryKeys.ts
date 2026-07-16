export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  byCae: (cae: string) => [...invoiceKeys.all, "cae", cae] as const,
  notasCredito: {
    all: () => [...invoiceKeys.all, "notas-credito"] as const,
    lists: () => [...invoiceKeys.notasCredito.all(), "list"] as const,
  },
  notasDebito: {
    all: () => [...invoiceKeys.all, "notas-debito"] as const,
    lists: () => [...invoiceKeys.notasDebito.all(), "list"] as const,
  },
  recibos: {
    all: () => [...invoiceKeys.all, "recibos"] as const,
    lists: () => [...invoiceKeys.recibos.all(), "list"] as const,
    detail: (id: string) => [...invoiceKeys.recibos.all(), "detail", id] as const,
  },
};
