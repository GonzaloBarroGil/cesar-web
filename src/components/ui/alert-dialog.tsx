import { cn } from "@/lib/utils";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

function AlertDialog({ children, ...props }: AlertDialogPrimitive.AlertDialogProps) {
  return <AlertDialogPrimitive.Root {...props}>{children}</AlertDialogPrimitive.Root>;
}

function AlertDialogTrigger({ children, ...props }: AlertDialogPrimitive.AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger {...props}>{children}</AlertDialogPrimitive.Trigger>;
}

function AlertDialogContent({
  className,
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg w-full max-w-md",
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-neutral-500", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-2 mt-4", className)} {...props} />;
}

function AlertDialogCancel({ children, ...props }: AlertDialogPrimitive.AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Cancel>
  );
}

function AlertDialogAction({ children, ...props }: AlertDialogPrimitive.AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action
      className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Action>
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
