'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="notice error"><h1>We could not load this view</h1><p>No clinical action was completed.</p><button className="button" onClick={reset}>Try again</button></div>;
}
