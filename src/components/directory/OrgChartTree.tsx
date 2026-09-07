'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Building, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/lib/haptics';

interface OrgChartTreeProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  searchTerm?: string;
  selectedDepartment?: string;
}

interface TreeNode {
  user: UserProfile;
  children: TreeNode[];
}

export default function OrgChartTree({
  users,
  onSelectUser,
  searchTerm = '',
  selectedDepartment = 'ALL'
}: OrgChartTreeProps) {
  const [zoom, setZoom] = useState(1);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Build the hierarchical tree structure
  const treeRoots = useMemo(() => {
    const userMap = new Map<string, TreeNode>();
    users.forEach(u => {
      userMap.set(u.id, { user: u, children: [] });
    });

    const roots: TreeNode[] = [];

    users.forEach(u => {
      const node = userMap.get(u.id);
      if (!node) return;

      if (u.managerId && userMap.has(u.managerId) && u.managerId !== u.id) {
        userMap.get(u.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [users]);

  // Auto-expand ancestors when searching
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase();
    const neededExpansions = new Set<string>();

    const checkNode = (node: TreeNode, parentIds: string[]): boolean => {
      const matchSelf = 
        node.user.name.toLowerCase().includes(term) ||
        node.user.jobTitle.toLowerCase().includes(term) ||
        node.user.departmentName?.toLowerCase().includes(term);

      let childMatched = false;
      node.children.forEach(child => {
        if (checkNode(child, [...parentIds, node.user.id])) {
          childMatched = true;
        }
      });

      if (matchSelf || childMatched) {
        parentIds.forEach(id => neededExpansions.add(id));
        return true;
      }
      return false;
    };

    treeRoots.forEach(root => checkNode(root, []));

    setCollapsedIds(prev => {
      const next = new Set(prev);
      neededExpansions.forEach(id => next.delete(id));
      return next;
    });
  }, [searchTerm, treeRoots]);

  const toggleCollapse = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.selection();
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    haptics.selection();
    setCollapsedIds(new Set());
  };

  const handleCollapseAll = () => {
    haptics.selection();
    const allParentIds = new Set<string>();
    users.forEach(u => {
      const hasKids = users.some(child => child.managerId === u.id);
      if (hasKids) allParentIds.add(u.id);
    });
    setCollapsedIds(allParentIds);
  };

  const handleZoomIn = () => {
    haptics.selection();
    setZoom(prev => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    haptics.selection();
    setZoom(prev => Math.max(0.6, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    haptics.selection();
    setZoom(1);
  };

  // Node Component
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isCollapsed = collapsedIds.has(node.user.id);
    const hasChildren = node.children.length > 0;
    
    const isSearchMatch = searchTerm.trim() !== '' && (
      node.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.user.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDeptMatch = selectedDepartment === 'ALL' || 
      node.user.departmentName?.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
      node.user.departmentId?.toLowerCase().includes(selectedDepartment.toLowerCase());

    return (
      <div key={node.user.id} className="flex flex-col items-center">
        {/* The Node Card */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            haptics.selection();
            onSelectUser(node.user);
          }}
          className={`relative z-10 w-64 p-3.5 rounded-2xl bg-white dark:bg-[#121216] border cursor-pointer select-none transition-all shadow-md hover:shadow-xl ${
            isSearchMatch
              ? 'ring-2 ring-emerald-500 shadow-emerald-500/20 border-emerald-500/50'
              : !isDeptMatch
                ? 'opacity-40 grayscale-[40%] border-black/[0.06] dark:border-white/[0.08]'
                : 'border-black/[0.08] dark:border-white/[0.12] hover:border-emerald-500/40'
          }`}
        >
          {/* Top Bar with Management Tier */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 ${
              node.user.functionalRole === 'MANAGING_CONSULTANT' || node.user.accessTier === 'SUPERADMIN'
                ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                : node.user.managementTier === 'DEPT_HEAD'
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                  : node.user.managementTier === 'TEAM_LEAD'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}>
              {node.user.functionalRole === 'MANAGING_CONSULTANT' ? 'EXECUTIVE' : node.user.managementTier.replace('_', ' ')}
            </span>

            {node.user.status === 'ACTIVE' ? (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            ) : (
              <span className="text-[9px] font-semibold text-slate-400">Inactive</span>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img
                src={node.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={node.user.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.1]"
              />
              {(node.user.functionalRole === 'MANAGING_CONSULTANT' || node.user.accessTier === 'SUPERADMIN') && (
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 text-white rounded-full shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {node.user.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                {node.user.jobTitle}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate mt-0.5">
                {node.user.departmentName || 'Operations'}
              </div>
            </div>
          </div>

          {/* Bottom Card Bar: Reports count & Expand/Collapse */}
          {hasChildren && (
            <div className="mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{node.children.length} direct {node.children.length === 1 ? 'report' : 'reports'}</span>
              </div>

              <button
                type="button"
                onClick={(e) => toggleCollapse(node.user.id, e)}
                className={`p-1 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                  isCollapsed
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'
                }`}
                title={isCollapsed ? 'Expand reports' : 'Collapse reports'}
              >
                <span>{isCollapsed ? `+${node.children.length}` : 'Hide'}</span>
                {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
          )}
        </motion.div>

        {/* Tree Connecting Branches */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem from parent */}
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-zinc-700" />

            {/* Children container with connecting crossbar */}
            <div className="relative flex justify-center pt-6">
              {/* Horizontal crossbar connecting all child stems */}
              {node.children.length > 1 && (
                <div 
                  className="absolute top-0 h-0.5 bg-slate-300 dark:bg-zinc-700"
                  style={{
                    left: `calc(${100 / (node.children.length * 2)}%)`,
                    right: `calc(${100 / (node.children.length * 2)}%)`
                  }}
                />
              )}

              {/* Children Nodes */}
              <div className="flex items-start gap-8">
                {node.children.map((child) => (
                  <div key={child.user.id} className="relative flex flex-col items-center">
                    {/* Vertical stem dropping into child */}
                    <div className="absolute -top-6 w-0.5 h-6 bg-slate-300 dark:bg-zinc-700" />
                    {renderNode(child, depth + 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/80 dark:bg-[#121216]/80 backdrop-blur-md rounded-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
        {/* Left: Summary Info */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Departmental Hierarchy</span>
          <span className="text-slate-400">•</span>
          <span className="text-[11px] text-slate-500 font-normal">
            {users.length} total staff profiles
          </span>
        </div>

        {/* Right: Zoom & Expand Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/10 rounded-xl">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Reset zoom to 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-black/[0.08] dark:bg-white/[0.1]" />

          <button
            type="button"
            onClick={handleExpandAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Expand All</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport with Pan / Horizontal Scroll */}
      <div className="relative w-full overflow-x-auto overflow-y-auto min-h-[560px] p-8 rounded-3xl bg-slate-50/70 dark:bg-[#0a0a0c] border border-black/[0.08] dark:border-white/[0.1] flex justify-center items-start shadow-inner">
        {/* Background Grid Accent */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />

        {/* Scaled Hierarchy */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="flex flex-col items-center gap-12 py-4"
        >
          {treeRoots.map(root => renderNode(root))}
        </div>
      </div>
    </div>
  );
}
