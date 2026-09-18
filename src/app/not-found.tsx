import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">The requested resource could not be found.</p>
      <Link href="/workspace" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-xl active:scale-[0.96] transition-all cursor-pointer">
        Return to Workspace
      </Link>
    </div>
  );
}
