import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PeriodData } from "@/mocks/fixtures/data";
import { useEffect, useState } from "react";

interface PeriodTimelineProps {
  periods: PeriodData[];
  onOpen: (data: { code: string; start_date: string; end_date: string }) => void;
  onClose: (periodId: string) => void;
  onArchive: (periodId: string) => void;
  isMutating: boolean;
}

function PeriodTimeline({ periods, onOpen, onClose, onArchive, isMutating }: PeriodTimelineProps) {
  const [localPeriods, setLocalPeriods] = useState<PeriodData[]>(periods);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "close" | "archive";
    period: PeriodData;
  } | null>(null);

  const [code, setCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLocalPeriods(periods);
  }, [periods]);

  const handleOpen = () => {
    const newPeriod: PeriodData = {
      id: `period-${code}`,
      consorcio_id: periods[0]?.consorcio_id ?? "",
      code,
      start_date: startDate,
      end_date: endDate,
      status: "OPEN",
      created_at: new Date().toISOString(),
      closed_at: null,
      archived_at: null,
    };
    setLocalPeriods((prev) => [newPeriod, ...prev]);
    onOpen({ code, start_date: startDate, end_date: endDate });
    setShowOpenForm(false);
    setCode("");
    setStartDate("");
    setEndDate("");
  };

  const handleClose = (id: string) => {
    setLocalPeriods((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "CLOSED" as const } : p)),
    );
    onClose(id);
    setConfirmAction(null);
  };

  const handleArchive = (id: string) => {
    setLocalPeriods((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "ARCHIVED" as const } : p)),
    );
    onArchive(id);
    setConfirmAction(null);
  };

  const statusLabels: Record<string, string> = {
    OPEN: "Abierto",
    CLOSED: "Cerrado",
    ARCHIVED: "Archivado",
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-green-100 text-green-700",
    CLOSED: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-neutral-100 text-neutral-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Períodos Fiscales</h2>
        <Button size="sm" onClick={() => setShowOpenForm(true)}>
          Abrir Período
        </Button>
      </div>

      {showOpenForm && (
        <div className="rounded-lg border p-4 mb-4 space-y-3 bg-neutral-50">
          <div>
            <Label htmlFor="code">Código (YYYYMM)</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="202607"
              maxLength={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start_date">Fecha de inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Fecha de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleOpen} disabled={!code || isMutating}>
              Confirmar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowOpenForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {localPeriods.length === 0 ? (
        <div className="text-center py-8 rounded-lg border">
          <p className="text-neutral-500 mb-2">Abra el primer período fiscal</p>
          <Button onClick={() => setShowOpenForm(true)}>Abrir Período</Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Código</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                  Desde
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                  Hasta
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {localPeriods.map((p) => (
                <tr key={p.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium">{p.code}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                    {p.start_date}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                    {p.end_date}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isMutating}
                        onClick={() => setConfirmAction({ type: "close", period: p })}
                      >
                        Cerrar
                      </Button>
                    )}
                    {p.status === "CLOSED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isMutating}
                        onClick={() => setConfirmAction({ type: "archive", period: p })}
                      >
                        Archivar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "close"
                ? `¿Cerrar el período ${confirmAction.period.code}?`
                : `¿Archivar el período ${confirmAction?.period.code ?? ""}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "close"
                ? "No se podrán agregar nuevos gastos."
                : "Será de solo lectura."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = confirmAction;
                if (!action) return;
                if (action.type === "close") handleClose(action.period.id);
                else if (action.type === "archive") handleArchive(action.period.id);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { PeriodTimeline };
