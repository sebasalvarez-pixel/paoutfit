export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-ink/10 p-5 rounded">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="font-heading text-3xl text-ink mt-2">{value}</p>
      {hint && <p className="text-xs text-ink/40 mt-1">{hint}</p>}
    </div>
  );
}
