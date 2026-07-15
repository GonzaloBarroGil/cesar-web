import type { CategoryResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CategoryListProps {
  categories: CategoryResponse[];
  isLoading: boolean;
  error?: Error | null;
  onCreateCategory: (data: { name: string }) => void;
}

function CategoryList({ categories, isLoading, error, onCreateCategory }: CategoryListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar las categorias</p>
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
          <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay categorias registradas</p>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear la primera
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Categorias</h1>
        <Button
          onClick={() => {
            setNewName("");
            setShowCreate(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoria
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-neutral-900">{c.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Crear Categoria"
        description="Ingrese el nombre de la nueva categoria."
        confirmLabel="Crear"
        variant="default"
        onConfirm={() => {
          if (newName.trim()) {
            onCreateCategory({ name: newName.trim() });
            setNewName("");
            setShowCreate(false);
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="new-category-name">Nombre</Label>
          <Input
            id="new-category-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Mantenimiento"
          />
        </div>
      </ConfirmationDialog>
    </div>
  );
}

export { CategoryList };
