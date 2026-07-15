import { useCreateConcept, useListConcepts } from "@/api/generated/expenses/expenses";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConceptList } from "./ConceptList";

function ConceptListPage() {
  const { data: concepts = [], isLoading, error } = useListConcepts();
  const createConcept = useCreateConcept();
  const [selectedGroup, setSelectedGroup] = useState("");

  return (
    <div>
      <Link
        to="/expenses"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Expensas
      </Link>

      <ConceptList
        concepts={concepts}
        isLoading={isLoading}
        error={error as Error | null}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
        onCreateConcept={(data) =>
          createConcept.mutate({
            data: { name: data.name, group: data.group as never },
          })
        }
      />
    </div>
  );
}

export { ConceptListPage };
