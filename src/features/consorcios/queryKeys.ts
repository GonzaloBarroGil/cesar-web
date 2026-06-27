export const consorcioKeys = {
  all: ["consorcios"] as const,
  lists: () => [...consorcioKeys.all, "list"] as const,
  details: () => [...consorcioKeys.all, "detail"] as const,
  detail: (id: string) => [...consorcioKeys.details(), id] as const,
  propietarios: (id: string) => [...consorcioKeys.all, "propietarios", id] as const,
  propietario: (consorcioId: string, taxId: string) =>
    [...consorcioKeys.all, "propietario", consorcioId, taxId] as const,
  periods: (id: string) => [...consorcioKeys.all, "periods", id] as const,
};
