export const debtKeys = {
  all: ["debt"] as const,
  liquidaciones: {
    all: ["debt", "liquidaciones"] as const,
    lists: () => [...debtKeys.liquidaciones.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...debtKeys.liquidaciones.lists(), filters] as const,
    details: () => [...debtKeys.liquidaciones.all, "detail"] as const,
    detail: (id: string) => [...debtKeys.liquidaciones.details(), id] as const,
  },
  certificados: {
    all: ["debt", "certificados"] as const,
    lists: () => [...debtKeys.certificados.all, "list"] as const,
    list: (unitId: string) => [...debtKeys.certificados.lists(), unitId] as const,
    details: () => [...debtKeys.certificados.all, "detail"] as const,
    detail: (id: string) => [...debtKeys.certificados.details(), id] as const,
  },
};
