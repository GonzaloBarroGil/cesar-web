export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  unitBalance: (unitId: string) => [...paymentKeys.all, "unit", unitId, "balance"] as const,
  unitHistory: (unitId: string) => [...paymentKeys.all, "unit", unitId, "history"] as const,
};
