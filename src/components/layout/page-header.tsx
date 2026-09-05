import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  kicker,
}: {
  title: string;
  kicker?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-1">
      <Link
        to="/tools"
        aria-label="Retour aux outils"
        className="-ml-2 grid size-11 shrink-0 place-items-center text-muted-foreground"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <div className="min-w-0 pt-2">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {kicker ? <p className="mt-1 text-sm text-muted-foreground">{kicker}</p> : null}
      </div>
    </div>
  );
}
