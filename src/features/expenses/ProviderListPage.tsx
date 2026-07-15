import { useListProviders, useTombstoneProvider } from "@/api/generated/expenses/expenses";
import { ProviderList } from "./ProviderList";

function ProviderListPage() {
  const { data: providers = [], isLoading, error } = useListProviders();
  const tombstoneProvider = useTombstoneProvider();

  return (
    <ProviderList
      providers={providers}
      isLoading={isLoading}
      error={error as Error | null}
      onTombstone={(id) => tombstoneProvider.mutate({ id })}
    />
  );
}

export { ProviderListPage };
