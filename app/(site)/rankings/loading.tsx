/** Rankings reads its stream from the query string, so switching tabs is a
 *  server round trip. Paint the table's shape while it runs. */
export default function RankingsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading rankings" className="bg-paper-2">
      <div className="border-b border-line bg-white">
        <div className="container-x py-10">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton mt-3 h-9 w-1/2 max-w-sm" />
          <div className="skeleton mt-3 h-4 w-full max-w-lg" />
        </div>
      </div>

      <div className="container-x space-y-4 py-8">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-28 rounded-full" />
          ))}
        </div>
        <div className="skeleton h-[28rem] rounded-2xl" />
      </div>
    </div>
  );
}
