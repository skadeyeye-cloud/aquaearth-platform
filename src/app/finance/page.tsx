'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Receipt, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Plus, 
  TrendingUp, 
  Download, 
  CreditCard,
  Building,
  ShieldCheck,
  Check,
  XCircle,
  Tag,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { InvoiceItem, BudgetRequest } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetRequestModal } from '@/components/finance/BudgetRequestModal';
import { haptics } from '@/lib/haptics';

export default function FinancePage() {
  const { 
    invoices, 
    projects, 
    clients, 
    createInvoice, 
    markInvoicePaid,
    budgetRequests,
    reviewBudgetRequest,
    currentUser
  } = useAuth();

  const [activeMainTab, setActiveMainTab] = useState<'INVOICES' | 'BUDGETS'>('INVOICES');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUED' | 'PAID'>('ALL');
  const [budgetStatusFilter, setBudgetStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED'>('ALL');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [whtCreditNo, setWhtCreditNo] = useState('WHT-FIRS-2026-');

  // New Invoice Form
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [milestoneDescription, setMilestoneDescription] = useState('Milestone 1: Mobilization & Inception');
  const [subtotalNgn, setSubtotalNgn] = useState(25000000);
  const [whtRatePercent, setWhtRatePercent] = useState(5.0);
  const [dueDate, setDueDate] = useState('2026-09-25');

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

  const filteredBudgets = budgetRequests.filter(req => {
    if (budgetStatusFilter === 'ALL') return true;
    return req.status === budgetStatusFilter;
  });

  const totalBilledNgn = invoices.reduce((acc, curr) => acc + curr.subtotalNgn, 0);
  const totalPaidNgn = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.netPayableNgn, 0);
  const totalVatTracked = invoices.reduce((acc, curr) => acc + curr.vatAmountNgn, 0);
  const totalWhtDeductions = invoices.reduce((acc, curr) => acc + curr.whtDeductionNgn, 0);

  // Budget stats
  const totalBudgetRequested = budgetRequests.reduce((acc, curr) => acc + curr.amountNgn, 0);
  const pendingBudgetCount = budgetRequests.filter(b => b.status === 'PENDING_APPROVAL').length;
  const approvedBudgetAmount = budgetRequests.filter(b => b.status === 'APPROVED').reduce((acc, curr) => acc + curr.amountNgn, 0);

  // Permissions
  const canReviewBudget = 
    currentUser.accessTier === 'SUPERADMIN' ||
    currentUser.accessTier === 'ADMIN' ||
    currentUser.functionalRole === 'MANAGING_CONSULTANT' ||
    currentUser.functionalRole === 'FINANCE_ADMIN' ||
    currentUser.managementTier === 'LINE_MANAGER' ||
    currentUser.managementTier === 'DEPT_HEAD';

  const canSubmitBudget = 
    currentUser.managementTier !== 'NONE' || 
    currentUser.accessTier === 'ADMIN' || 
    currentUser.accessTier === 'SUPERADMIN' ||
    currentUser.functionalRole === 'FINANCE_ADMIN';

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === projectId);
    const client = clients.find(c => c.id === proj?.clientId);

    createInvoice({
      projectId,
      projectName: proj?.title || 'Active Project',
      clientId: client?.id || 'cli-1',
      clientName: client?.name || 'Direct Client',
      milestoneDescription,
      subtotalNgn: Number(subtotalNgn),
      vatRatePercent: 7.5,
      whtRatePercent: Number(whtRatePercent),
      whtCreditNoteReceived: false,
      status: 'ISSUED',
      dueDate,
      currency: 'NGN'
    });

    setIsNewInvoiceOpen(false);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    markInvoicePaid(selectedInvoiceForPayment.id, whtCreditNo);
    setSelectedInvoiceForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 tracking-tight">
            Module 10 • Financial Operations & Invoicing
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Finance & Capital Disbursements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Client milestone billing, automated 7.5% VAT / 5% WHT deductions, and departmental budget approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMainTab === 'BUDGETS' ? (
            <button
              onClick={() => {
                if (!canSubmitBudget) {
                  alert('Only Team Leads, Managers, and Admins can submit departmental budget requests.');
                  return;
                }
                setIsNewBudgetOpen(true);
                haptics.selection();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Budget Request</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Milestone Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => { setActiveMainTab('INVOICES'); haptics.selection(); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'INVOICES'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Milestone Invoices & Tax Ledger ({invoices.length})</span>
        </button>

        <button
          onClick={() => { setActiveMainTab('BUDGETS'); haptics.selection(); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
            activeMainTab === 'BUDGETS'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Budget Requests & Approvals ({budgetRequests.length})</span>
          {pendingBudgetCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
              {pendingBudgetCount}
            </span>
          )}
        </button>
      </div>

      {/* Conditional View Rendering */}
      {activeMainTab === 'INVOICES' ? (
        <>
          {/* Financial Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed Gross</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">₦{(totalBilledNgn / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{invoices.length} Milestone Invoices</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Cash Collected (Net)</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">₦{(totalPaidNgn / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Reconciled bank transfers</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">7.5% VAT Tracked</div>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tnum">₦{(totalVatTracked / 1000000).toFixed(2)}M</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Federal Inland Revenue (FIRS)</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">WHT Deductions (5%)</div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tnum">₦{(totalWhtDeductions / 1000000).toFixed(2)}M</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Credit note reconciliation</div>
            </div>
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
                  statusFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Invoices ({invoices.length})
              </button>
              <button
                onClick={() => setStatusFilter('ISSUED')}
                className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
                  statusFilter === 'ISSUED' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Awaiting Payment ({invoices.filter(i => i.status === 'ISSUED').length})
              </button>
              <button
                onClick={() => setStatusFilter('PAID')}
                className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
                  statusFilter === 'PAID' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Settled & Reconciled ({invoices.filter(i => i.status === 'PAID').length})
              </button>
            </div>
          </div>

          {/* Invoices List */}
          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-black/[0.05] dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Invoice & Client</th>
                    <th className="px-5 py-3">Milestone Description</th>
                    <th className="px-5 py-3 text-right">Subtotal</th>
                    <th className="px-5 py-3 text-right">7.5% VAT</th>
                    <th className="px-5 py-3 text-right">5% WHT</th>
                    <th className="px-5 py-3 text-right">Net Payable</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-slate-800 font-medium">
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'PAID';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{inv.clientName}</div>
                        </td>

                        <td className="px-5 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                          {inv.milestoneDescription}
                        </td>

                        <td className="px-5 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 tnum">
                          ₦{inv.subtotalNgn.toLocaleString()}
                        </td>

                        <td className="px-5 py-3 text-right font-mono text-purple-700 dark:text-purple-400 font-semibold tnum">
                          +₦{inv.vatAmountNgn.toLocaleString()}
                        </td>

                        <td className="px-5 py-3 text-right font-mono text-amber-700 dark:text-amber-400 font-semibold tnum">
                          -₦{inv.whtDeductionNgn.toLocaleString()}
                        </td>

                        <td className="px-5 py-3 text-right font-mono font-bold text-xs text-slate-900 dark:text-white tnum">
                          ₦{inv.netPayableNgn.toLocaleString()}
                        </td>

                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            isPaid ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-right space-x-1.5">
                          {!isPaid ? (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-[0.96]"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {inv.whtCreditNoteNumber ? `Cert: ${inv.whtCreditNoteNumber}` : 'Direct Transfer'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Budget Requests View */
        <>
          {/* Budget Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Requested Capex</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">
                ₦{(totalBudgetRequested / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Across all departments</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Pending Executive Review</div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tnum">
                {pendingBudgetCount} Requests
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Awaiting Admin/Manager sign-off</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Approved Disbursements</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">
                ₦{(approvedBudgetAmount / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Released to teams</div>
            </div>
          </div>

          {/* Budget Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
              {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'DECLINED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => { setBudgetStatusFilter(st); haptics.selection(); }}
                  className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
                    budgetStatusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All Requests' : st === 'PENDING_APPROVAL' ? 'Pending Review' : st === 'APPROVED' ? 'Approved' : 'Declined'}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {canReviewBudget ? '✓ Authorized as Reviewer' : 'Requester View'}
            </span>
          </div>

          {/* Budget Requests Table */}
          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-black/[0.05] dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Request Number & Title</th>
                    <th className="px-5 py-3">Department & Requester</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Amount (₦ NGN)</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Review Notes</th>
                    {canReviewBudget && <th className="px-5 py-3 text-right">Manager Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-slate-800 font-medium">
                  {filteredBudgets.map((req) => {
                    const isPending = req.status === 'PENDING_APPROVAL';
                    const isApproved = req.status === 'APPROVED';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">{req.requestNumber}</div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{req.title}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{req.justification}</p>
                        </td>

                        <td className="px-5 py-3 text-xs">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{req.department}</div>
                          <div className="text-[11px] text-slate-500">By {req.requestedByName}</div>
                        </td>

                        <td className="px-5 py-3 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {req.category.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 dark:text-white text-xs tnum">
                          ₦{req.amountNgn.toLocaleString()}
                        </td>

                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isPending
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-[11px] text-slate-500 max-w-xs">
                          {req.reviewedByName ? (
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Reviewed by {req.reviewedByName}:</span> {req.reviewComments || 'Approved.'}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pending review</span>
                          )}
                        </td>

                        {canReviewBudget && (
                          <td className="px-5 py-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    reviewBudgetRequest(req.id, 'APPROVED', 'Approved for operational disbursement.');
                                    haptics.success();
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-2xs active:scale-95 transition-all"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter reason for declining budget request:') || 'Declined upon managerial review.';
                                    reviewBudgetRequest(req.id, 'DECLINED', reason);
                                    haptics.impact();
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 rounded-lg text-[11px] font-bold border border-rose-200 dark:border-rose-800 transition-all"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Done</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      <AnimatePresence>
        {selectedInvoiceForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoiceForPayment(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Reconcile Client Payment</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Confirm receipt of wire transfer for invoice <strong className="text-slate-900 dark:text-white font-mono">{selectedInvoiceForPayment.invoiceNumber}</strong> ({selectedInvoiceForPayment.clientName}).
              </p>
              <form onSubmit={handleConfirmPayment} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">FIRS WHT Credit Certificate No.</label>
                  <input
                    type="text"
                    required
                    value={whtCreditNo}
                    onChange={(e) => setWhtCreditNo(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setSelectedInvoiceForPayment(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Confirm Receipt</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {isNewInvoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewInvoiceOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generate Client Milestone Invoice</h3>
                <button onClick={() => setIsNewInvoiceOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">&times;</button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectCode} - {p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Milestone Description</label>
                  <input
                    type="text"
                    required
                    value={milestoneDescription}
                    onChange={(e) => setMilestoneDescription(e.target.value)}
                    placeholder="e.g. Milestone 2: 50% Draft EIA Submission"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Gross Subtotal (₦ NGN)</label>
                    <input
                      type="number"
                      required
                      value={subtotalNgn}
                      onChange={(e) => setSubtotalNgn(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono tnum text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">WHT Deduction (%)</label>
                    <select
                      value={whtRatePercent}
                      onChange={(e) => setWhtRatePercent(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value={5.0}>5.0% (Consulting & Technical)</option>
                      <option value={10.0}>10.0% (Corporate Construction)</option>
                      <option value={0.0}>0.0% (Exempt / Free Trade Zone)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setIsNewInvoiceOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Issue Milestone Invoice</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Request Modal */}
      <BudgetRequestModal
        isOpen={isNewBudgetOpen}
        onClose={() => setIsNewBudgetOpen(false)}
      />
    </div>
  );
}
