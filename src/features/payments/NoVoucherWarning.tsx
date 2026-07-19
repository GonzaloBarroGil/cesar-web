interface NoVoucherWarningProps {
  visible: boolean;
}

function NoVoucherWarning({ visible }: NoVoucherWarningProps) {
  if (!visible) return null;

  return (
    <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
      Sin comprobante
    </span>
  );
}

export { NoVoucherWarning };
