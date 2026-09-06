'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="text-xs text-slate-500">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
      >
        Try again
      </button>
    </div>
  );
}
