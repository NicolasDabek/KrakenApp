import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto", className)}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "h-9 shrink-0 rounded-full px-3 text-xs font-medium transition-colors duration-150",
            value === option.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
