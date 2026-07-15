import { useCreateCategory, useListCategories } from "@/api/generated/expenses/expenses";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryList } from "./CategoryList";

function CategoryListPage() {
  const { data: categories = [], isLoading, error } = useListCategories();
  const createCategory = useCreateCategory();

  return (
    <div>
      <Link
        to="/expenses"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Expensas
      </Link>

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        error={error as Error | null}
        onCreateCategory={(data) =>
          createCategory.mutate({
            data: { name: data.name },
          })
        }
      />
    </div>
  );
}

export { CategoryListPage };
