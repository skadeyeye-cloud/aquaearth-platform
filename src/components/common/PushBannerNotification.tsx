'use client';

import React from 'react';
import Link from 'next/link';
import { usePresence } from '@/lib/presence-context';
import { 
  Check, 
  ExternalLink, 
  X, 
  BellRing
} from 'lucide-react';

export default function PushBannerNotification() {
  const { activePush, dismissPush, quickApproveFromPush } = usePresence();

  if (!activePush) return null;

  const isApproved = activePush.title.includes('Approved');

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] max-w-md w-[94vw] sm:w-[460px] pointer-events-auto transition-all animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Apple Dynamic Island / Lockscreen Glass Container */}
      <div className={`p-4 rounded-3xl backdrop-blur-2xl shadow-2xl border transition-all ${
        isApproved
          ? 'bg-emerald-950/90 text-white border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'bg-[#09090b]/95 text-white border-white/[0.15] ring-1 ring-white/10'
      }`}>
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
              isApproved ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              {isApproved ? <Check className="w-3 h-3 stroke-[3]" /> : 'AE'}
            </div>
            <span className="text-[11px] font-bold tracking-tight text-white/90 whitespace-nowrap shrink-0">
              AQUAEARTH MOBILE PUSH
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>

          <div className="flex items-center gap-1 text-[10px] text-white/50 whitespace-nowrap shrink-0">
            <span>{activePush.timestamp}</span>
            <button
              type="button"
              onClick={dismissPush}
              className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer shrink-0"
              title="Dismiss push notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification Body with Actor Avatar */}
        <div className="flex items-start gap-3">
          {activePush.actorAvatar ? (
            <img
              src={activePush.actorAvatar}
              alt={activePush.actorName}
              className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/20 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-emerald-400" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="text-xs font-extrabold text-white truncate">
              {activePush.title}
            </div>
            <p className="text-[11px] text-white/70 leading-snug line-clamp-2">
              {activePush.body}
            </p>
          </div>
        </div>

        {/* Direct 1-Tap Action Bar */}
        {!isApproved && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-2 text-xs">
            {activePush.targetUrl && (
              <Link
                href={activePush.targetUrl}
                onClick={dismissPush}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Inspect</span>
                <ExternalLink className="w-3 h-3 text-white/60" />
              </Link>
            )}

            {activePush.canQuickApprove && (
              <button
                type="button"
                onClick={quickApproveFromPush}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition-all inline-flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>1-Tap Approve</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
