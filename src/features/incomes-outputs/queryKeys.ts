export const incomeOutputKeys = {
  all: ["incomes-outputs"] as const,
  lists: () => [...incomeOutputKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...incomeOutputKeys.lists(), filters] as const,
  details: () => [...incomeOutputKeys.all, "detail"] as const,
  detail: (id: string) => [...incomeOutputKeys.details(), id] as const,
  summaries: () => [...incomeOutputKeys.all, "summary"] as const,
  summary: (periodCode?: string) => [...incomeOutputKeys.summaries(), periodCode] as const,
};
