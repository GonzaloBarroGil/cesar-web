import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/AuthContext";
import { Ban } from "lucide-react";
import { useState } from "react";

interface AnnulButtonProps {
  onAnnul: () => void;
  isSubmitting: boolean;
  label?: string;
  description?: string;
}

function AnnulButton({
  onAnnul,
  isSubmitting,
  label = "Anular",
  description = "La factura quedara marcada como ANULADA y no podra reactivarse.",
}: AnnulButtonProps) {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  if (user?.role !== "ADMIN") {
    return null;
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={isSubmitting}
      >
        <Ban className="h-4 w-4 mr-1" />
        {isSubmitting ? "Anulando..." : label}
      </Button>
      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Anular documento"
        description={description}
        confirmLabel="Anular"
        variant="destructive"
        onConfirm={() => {
          setShowDialog(false);
          onAnnul();
        }}
      />
    </>
  );
}

export { AnnulButton };
