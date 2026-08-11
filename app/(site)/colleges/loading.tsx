/**
 * The college list is filtered through the query string, so every filter change
 * is a server round trip. This paints the page's shape immediately instead of
 * leaving the old results on screen looking unchanged.
 */
export default function CollegesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading colleges" className="bg-paper-2">
      <div className="border-b border-line bg-white">
        <div className="container-x py-10">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton mt-3 h-9 w-2/3 max-w-md" />
          <div className="skeleton mt-3 h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="container-x grid gap-6 py-8 lg:grid-cols-[16rem_1fr]">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
