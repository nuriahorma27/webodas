import Link from "next/link";

export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Card({
  className = "",
  children,
  "data-tour": dataTour,
}: {
  className?: string;
  children: React.ReactNode;
  "data-tour"?: string;
}) {
  return (
    <div
      data-tour={dataTour}
      data-ui="card"
      className={`rounded-xl border border-line bg-surface p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start justify-between gap-4 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <span className="min-w-0 text-sm">
        <span className="block font-medium text-foreground">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span>}
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-[#d9d2c7] transition peer-checked:bg-[#66735e] peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "muted",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "muted" | "positive" | "negative";
}) {
  const subColor =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
        ? "text-[#7b2233]"
        : "text-muted";
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {sub && <p className={`mt-1 text-sm ${subColor}`}>{sub}</p>}
    </Card>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent-soft">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const badgeTones: Record<string, string> = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  neutral: "bg-neutral-100 text-neutral-600",
  muted: "bg-neutral-100 text-neutral-400 line-through",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof badgeTones;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Button({
  href,
  variant = "primary",
  children,
  type,
  onClick,
}: {
  href?: string;
  variant?: "primary" | "ghost";
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const cls =
    variant === "primary"
      ? "bg-foreground text-white hover:opacity-90"
      : "border border-line bg-surface hover:bg-accent-soft";
  const base = `inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition ${cls}`;
  return href ? (
    <Link href={href} className={base}>
      {children}
    </Link>
  ) : (
    <button type={type ?? "button"} className={base} onClick={onClick}>
      {children}
    </button>
  );
}
