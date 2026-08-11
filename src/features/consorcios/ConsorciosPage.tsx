import { apiClient } from "@/api/client";
import type { ConsorcioData } from "@/mocks/fixtures/data";
import { useQuery } from "@tanstack/react-query";
import { ConsorcioList } from "./ConsorcioList";
import { consorcioKeys } from "./queryKeys";

function ConsorciosPage() {
  const {
    data: consorcios = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: consorcioKeys.lists(),
    queryFn: () => apiClient<ConsorcioData[]>({ url: "/consorcios", method: "GET" }),
  });

  return (
    <ConsorcioList
      consorcios={consorcios}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}

export { ConsorciosPage };
