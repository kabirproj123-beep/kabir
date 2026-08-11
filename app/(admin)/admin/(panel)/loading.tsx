/**
 * Shown the instant an admin link is clicked, for every page in the panel.
 *
 * Two jobs. It replaces the dead wait — the panel's pages are dynamic and each
 * costs a Firestore round trip or two, which used to leave the previous page on
 * screen with no sign the click registered. And its existence is what lets
 * Next prefetch these routes at all: a dynamic route with no loading boundary
 * has no shell to send ahead, so the navigation can't start until the server
 * has finished the whole render.
 */
export default function PanelLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="border-b border-line bg-white px-4 py-5 sm:px-6">
        <div className="skeleton h-7 w-44" />
        <div className="skeleton mt-2 h-4 w-28" />
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="skeleton h-[4.5rem] w-full rounded-xl" />

        <div className="card overflow-hidden">
          <div className="border-b border-line bg-paper-2 px-4 py-3">
            <div className="skeleton h-3.5 w-32" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-b-0"
            >
              <div className="skeleton size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
              <div className="skeleton hidden h-6 w-24 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
