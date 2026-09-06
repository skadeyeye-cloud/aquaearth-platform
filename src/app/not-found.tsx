import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
      <p className="text-xs text-slate-500">The requested resource could not be found.</p>
      <Link href="/workspace" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl">
        Return to Workspace
      </Link>
    </div>
  );
}
