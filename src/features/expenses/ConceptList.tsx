import type { ConceptResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

const GROUP_LABELS: Record<string, string> = {
  SERVICIOS: "Servicios",
  MANTENIMIENTO: "Mantenimiento",
  PERSONAL: "Personal",
  IMPUESTOS: "Impuestos",
  SEGUROS: "Seguros",
  OTROS: "Otros",
};

interface ConceptListProps {
  concepts: ConceptResponse[];
  isLoading: boolean;
  error?: Error | null;
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
  onCreateConcept: (data: { name: string; group: string }) => void;
}

function ConceptList({
  concepts,
  isLoading,
  error,
  selectedGroup,
  onSelectGroup,
  onCreateConcept,
}: ConceptListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los conceptos</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const groups = Array.from(new Set(concepts.map((c) => c.group)));

  if (concepts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay conceptos registrados</p>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear el primero
        </Button>
      </div>
    );
  }

  const filtered = selectedGroup ? concepts.filter((c) => c.group === selectedGroup) : concepts;

  const grouped = selectedGroup
    ? { [selectedGroup]: filtered }
    : Object.fromEntries(groups.map((g) => [g, concepts.filter((c) => c.group === g)]));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Conceptos</h1>
        <Button
          onClick={() => {
            setNewName("");
            setShowCreate(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Concepto
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => onSelectGroup("")}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            selectedGroup === ""
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Todos
        </button>
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onSelectGroup(g)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              selectedGroup === g
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {GROUP_LABELS[g] || g}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h2 className="text-sm font-medium text-neutral-500 mb-3">
            {GROUP_LABELS[group] || group}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{c.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <ConfirmationDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Crear Concepto"
        description="Ingrese los datos del nuevo concepto."
        confirmLabel="Crear"
        variant="default"
        onConfirm={() => {
          if (newName.trim()) {
            onCreateConcept({ name: newName.trim(), group: selectedGroup || groups[0] || "OTROS" });
            setNewName("");
            setShowCreate(false);
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="new-concept-name">Nombre</Label>
          <Input
            id="new-concept-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Mantenimiento de ascensores"
          />
        </div>
      </ConfirmationDialog>
    </div>
  );
}

export { ConceptList };
