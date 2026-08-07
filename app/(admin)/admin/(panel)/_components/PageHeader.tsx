/** Title row shared by every panel page, so they start at the same rhythm. */
export default function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-line bg-white px-4 py-5 sm:px-6">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
