import { useState, useEffect, useCallback } from "react";
import { shortenUrl, listUrls, deleteUrl } from "./api";
import type { URLRecord } from "./types";
import { useTheme } from "./useTheme";

// ─── Icons ────────────────────────────────────────────────────────────────────

function LinkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const [inputUrl, setInputUrl] = useState("");
  const [urls, setUrls] = useState<URLRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      const data = await listUrls();
      setUrls(data.urls);
    } catch {
      /* non-critical */
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await shortenUrl(trimmed);
      setInputUrl("");
      await fetchUrls();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(shortCode: string) {
    try {
      await deleteUrl(shortCode);
      setUrls((prev) => prev.filter((u) => u.short_code !== shortCode));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleCopy(shortUrl: string, shortCode: string) {
    await navigator.clipboard.writeText(shortUrl);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  // ─── Derived class sets ──────────────────────────────────────────────────

  const bg = isDark
    ? "bg-neutral-900"
    : "";   // light uses inline radial-gradient

  const cardBg    = isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200";
  const headingCl = isDark ? "text-neutral-50"  : "text-neutral-900";
  const subtextCl = isDark ? "text-neutral-400" : "text-neutral-500";
  const labelCl   = isDark ? "text-neutral-300" : "text-neutral-700";
  const inputCl   = isDark
    ? "bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500 focus:ring-primary-400 focus:border-primary-400"
    : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:ring-primary-500 focus:border-primary-500";
  const dividerCl = isDark ? "border-neutral-700" : "border-neutral-100";
  const rowHoverCl= isDark ? "hover:bg-neutral-700/50" : "hover:bg-neutral-50";
  const countBadge= isDark ? "bg-neutral-700 text-neutral-400" : "bg-neutral-100 text-neutral-500";
  const listHeaderCl = isDark ? "text-neutral-400" : "text-neutral-700";
  const iconDotCl = isDark ? "bg-primary-900 text-primary-400" : "bg-primary-50 text-primary-600";
  const clickBadge= isDark ? "bg-primary-900 text-primary-300" : "bg-primary-50 text-primary-700";
  const dateCl    = isDark ? "text-neutral-500" : "text-neutral-400";
  const extLinkCl = isDark ? "text-neutral-600" : "text-neutral-300";
  const origUrlCl = isDark ? "text-neutral-500" : "text-neutral-400";
  const copyBtn   = isDark ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200";
  const trashBtn  = isDark ? "text-neutral-500 hover:bg-red-900/40 hover:text-red-400" : "text-neutral-400 hover:bg-red-50 hover:text-red-600";
  const footerCl  = isDark ? "text-neutral-600" : "text-neutral-400";
  const toggleCl  = isDark
    ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border-neutral-600"
    : "bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200";
  const emptyStateCl = isDark ? "text-neutral-500" : "text-neutral-400";
  const logoTextCl   = isDark ? "text-neutral-200" : "text-neutral-800";

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${bg}`}
      style={
        isDark
          ? {
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(220,30%,8%), hsl(220,20%,5%))",
            }
          : {
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(210,100%,97%), hsl(0,0%,100%))",
            }
      }
    >
      {/* ── Dark-mode toggle — fixed top-right, mirrors MUI ColorModeSelect ── */}
      <button
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={[
          "fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center",
          "rounded-lg border shadow-sm transition-colors duration-150",
          toggleCl,
        ].join(" ")}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col items-center justify-start px-4 py-12 sm:py-20">

        {/* Wordmark */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
            <LinkIcon size={20} />
          </div>
          <span className={`text-lg font-semibold tracking-tight ${logoTextCl}`}>
            Snip
          </span>
        </div>

        {/* ── Main card ─────────────────────────────────────────────────────── */}
        <div
          className={`w-full max-w-[480px] rounded-xl border px-8 py-8 transition-colors duration-200 ${cardBg}`}
          style={{ boxShadow: isDark ? "var(--shadow-card-dark)" : "var(--shadow-card)" }}
        >
          <h1 className={`mb-1 text-[clamp(1.6rem,5vw,2rem)] font-semibold leading-tight tracking-tight ${headingCl}`}>
            Shorten a URL
          </h1>
          <p className={`mb-6 text-sm ${subtextCl}`}>
            Paste a long link and get a short one you can share anywhere.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="url-input" className={`text-sm font-medium ${labelCl}`}>
                Destination URL
              </label>
              <input
                id="url-input"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                disabled={loading}
                aria-describedby={error ? "url-error" : undefined}
                className={[
                  "w-full rounded-lg border px-3.5 py-2.5 text-sm",
                  "outline-none transition-shadow duration-150 focus:ring-2",
                  error ? "border-error-main ring-1 ring-error-main" : "",
                  loading ? "opacity-50 cursor-not-allowed" : "",
                  inputCl,
                ].filter(Boolean).join(" ")}
              />
              {error && (
                <p id="url-error" role="alert"
                  className="mt-0.5 flex items-center gap-1 text-xs text-error-main">
                  <span aria-hidden="true">⚠</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className={[
                "w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white",
                "shadow-sm transition-colors duration-150",
                "hover:bg-primary-700 active:bg-primary-800",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Shortening…" : "Shorten URL"}
            </button>
          </form>
        </div>

        {/* ── URL list card ──────────────────────────────────────────────────── */}
        {(fetching || urls.length > 0) && (
          <div
            className={`mt-4 w-full max-w-[480px] rounded-xl border transition-colors duration-200 ${cardBg}`}
            style={{ boxShadow: isDark ? "var(--shadow-card-dark)" : "var(--shadow-card)" }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b px-6 py-4 ${dividerCl}`}>
              <h2 className={`text-sm font-semibold ${listHeaderCl}`}>Your links</h2>
              {!fetching && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${countBadge}`}>
                  {urls.length}
                </span>
              )}
            </div>

            {fetching ? (
              <div className="flex items-center justify-center px-6 py-8">
                <svg className="h-5 w-5 animate-spin text-primary-500"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  aria-label="Loading">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            ) : (
              <ul aria-label="Shortened URLs">
                {urls.map((url, i) => (
                  <li
                    key={url.id}
                    className={[
                      "group flex items-start gap-4 px-6 py-4 transition-colors duration-100",
                      rowHoverCl,
                      i < urls.length - 1 ? `border-b ${dividerCl}` : "",
                    ].join(" ")}
                  >
                    {/* Icon dot */}
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconDotCl}`}>
                      <LinkIcon size={16} />
                    </div>

                    {/* URL info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={url.short_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary-500 hover:underline"
                          aria-label={`Short URL for ${url.original_url}`}
                        >
                          {url.short_url.replace(/^https?:\/\//, "")}
                        </a>
                        <span className={extLinkCl}>
                          <ExternalLinkIcon />
                        </span>
                      </div>
                      <p className={`mt-0.5 truncate text-xs ${origUrlCl}`} title={url.original_url}>
                        {url.original_url}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${clickBadge}`}>
                          {url.clicks} {url.clicks === 1 ? "click" : "clicks"}
                        </span>
                        <span className={`text-[11px] ${dateCl}`}>
                          {formatDate(url.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions — revealed on row hover */}
                    <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        onClick={() => handleCopy(url.short_url, url.short_code)}
                        className={[
                          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                          copiedCode === url.short_code
                            ? "bg-green-500/10 text-green-500"
                            : copyBtn,
                        ].join(" ")}
                        aria-label="Copy short URL to clipboard"
                      >
                        {copiedCode === url.short_code
                          ? <><CheckIcon /> Copied</>
                          : <><CopyIcon /> Copy</>}
                      </button>
                      <button
                        onClick={() => handleDelete(url.short_code)}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${trashBtn}`}
                        aria-label={`Delete short URL ${url.short_code}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Empty state */}
        {!fetching && urls.length === 0 && (
          <p className={`mt-6 text-sm ${emptyStateCl}`}>
            No links yet — shorten your first URL above.
          </p>
        )}

        {/* Footer */}
        <p className={`mt-10 text-xs ${footerCl}`}>
          © {new Date().getFullYear()} Snip · Built with FastAPI & React
        </p>
      </div>
    </div>
  );
}
