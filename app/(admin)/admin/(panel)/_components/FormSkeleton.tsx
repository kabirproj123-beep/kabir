/**
 * Loading shape for the college editor. The panel's default skeleton is a
 * table, which reads as the wrong page entirely when what's coming is a form.
 */
export default function FormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="border-b border-line bg-white px-4 py-5 sm:px-6">
        <div className="skeleton h-7 w-56" />
        <div className="skeleton mt-2 h-4 w-36" />
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section} className="card space-y-4 p-5">
            <div className="skeleton h-4 w-32" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, field) => (
                <div key={field} className="space-y-1.5">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="skeleton h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
