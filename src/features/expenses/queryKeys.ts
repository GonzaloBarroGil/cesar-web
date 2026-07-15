export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  versions: (id: string) => [...expenseKeys.all, "versions", id] as const,
  concepts: {
    all: () => [...expenseKeys.all, "concepts"] as const,
    group: (group: string) => [...expenseKeys.concepts.all(), group] as const,
  },
  categories: {
    all: () => [...expenseKeys.all, "categories"] as const,
  },
  providers: {
    all: () => [...expenseKeys.all, "providers"] as const,
    detail: (id: string) => [...expenseKeys.providers.all(), id] as const,
  },
};
