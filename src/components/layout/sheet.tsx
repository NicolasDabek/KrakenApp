import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" className="absolute inset-0 bg-background/70" onClick={onClose} aria-label="Fermer" />
      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto mb-1 mt-2 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between px-4">
          <p className="text-sm font-medium">{title}</p>
          <button type="button" className="grid size-11 place-items-center" onClick={onClose} aria-label="Fermer">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
