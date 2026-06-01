"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    fetch("http://127.0.0.1:7319/ingest/ff83099a-29c4-49a5-95a4-4e57b1ef7332", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9dd02d" },
      body: JSON.stringify({
        sessionId: "9dd02d",
        location: "global-error.tsx:render",
        message: "GlobalError caught",
        data: { message: error.message, digest: error.digest, stack: error.stack?.slice(0, 500) },
        timestamp: Date.now(),
        hypothesisId: "A-E",
      }),
    }).catch(() => {});
  }

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#09090b', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Fatal Application Error</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>A critical error broke the layout tree.</p>
          
          {process.env.NODE_ENV === "development" && (
            <pre style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', maxWidth: '80%', overflowX: 'auto', fontSize: '0.875rem' }}>
              {error.message}
            </pre>
          )}

          <button 
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
