'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  UserCheck,
  Wallet,
  Building2,
  Users,
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Crown,
  Droplets,
  Truck,
  Wrench,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { 
  InvoiceItem, 
  BudgetRequest, 
  BudgetApprovalStage, 
  PettyCashCustodian, 
  PettyCashCategory 
} from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetRequestModal } from '@/components/finance/BudgetRequestModal';
import { CfoVettingModal } from '@/components/finance/CfoVettingModal';
import { CollateBudgetModal } from '@/components/finance/CollateBudgetModal';
import { PettyCashExpenseModal } from '@/components/finance/PettyCashExpenseModal';
import { haptics } from '@/lib/haptics';

export default function FinancePage() {
  const { 
    invoices, 
    projects, 
    clients, 
    createInvoice, 
    markInvoicePaid,
    confirmPaymentWithDrK,
    budgetRequests,
    reviewBudgetRequest,
    cfoReviewBudget,
    approveBudgetAsMD,
    declineBudgetAsMD,
    pettyCashFunds,
    pettyCashTransactions,
    pettyCashAnalyses,
    generatePettyCashMonthlyAnalysis,
    approvePettyCashReplenishment,
    currentUser
  } = useAuth();

  const [activeMainTab, setActiveMainTab] = useState<'BUDGETS' | 'PETTY_CASH' | 'INVOICES' | 'EXPENSES'>('BUDGETS');
  const [budgetStageFilter, setBudgetStageFilter] = useState<'ALL' | BudgetApprovalStage>('ALL');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'ALL' | 'ISSUED' | 'PAID'>('ALL');
  const [invoiceCurrency, setInvoiceCurrency] = useState<'NGN' | 'USD'>('NGN');
  
  // Modals state
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [vettingBudget, setVettingBudget] = useState<BudgetRequest | null>(null);
  const [collatingBudget, setCollatingBudget] = useState<BudgetRequest | null>(null);
  const [isPettyExpenseOpen, setIsPettyExpenseOpen] = useState(false);
  const [activeCustodianForExpense, setActiveCustodianForExpense] = useState<PettyCashCustodian>('GIFT');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [whtCreditNo, setWhtCreditNo] = useState('WHT-FIRS-2026-');

  // New Invoice Form
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [milestoneDescription, setMilestoneDescription] = useState('Milestone 1: Mobilization & Inception');
  const [subtotalNgn, setSubtotalNgn] = useState(25000000);
  const [whtRatePercent, setWhtRatePercent] = useState(5.0);
  const [dueDate, setDueDate] = useState('2026-09-25');

  // Role detection per SOP
  const isDrK = currentUser.id === 'usr-1' || currentUser.functionalRole === 'MANAGING_CONSULTANT';
  const isBibi = currentUser.id === 'usr-10' || currentUser.functionalRole === 'DEPUTY_MANAGING_CONSULTANT' || currentUser.name.toLowerCase().includes('bibi');
  const isErica = currentUser.id === 'usr-11' || currentUser.functionalRole === 'CFO' || currentUser.name.toLowerCase().includes('erica');
  const isOzioma = currentUser.id === 'usr-12' || currentUser.functionalRole === 'SENIOR_CONSULTANT' || currentUser.name.toLowerCase().includes('ozioma');
  const isGift = currentUser.id === 'usr-13' || currentUser.name.toLowerCase().includes('gift');
  const isMarvelous = currentUser.id === 'usr-14' || currentUser.name.toLowerCase().includes('marvelous');
  const isSuperadmin = currentUser.accessTier === 'SUPERADMIN' || isDrK || isBibi || isErica || isOzioma;

  // Superadmins & Finance Officers have complete unrestricted access across all of finance
  const isFinanceOfficer = currentUser.functionalRole === 'FINANCE_OFFICER' || currentUser.functionalRole === 'FINANCE_ADMIN' || currentUser.functionalRole === 'CFO' || currentUser.departmentName === 'Finance' || currentUser.departmentName === 'Finance & Accounts' || isGift || isMarvelous || isErica;
  const canSeeAllFinance = isSuperadmin || isFinanceOfficer;

  // Line Managers and Admins can only view their own budgets and submit budgets
  const isLineManagerOrAdmin = currentUser.accessTier === 'ADMIN' || currentUser.managementTier !== 'NONE' || currentUser.functionalRole === 'PROJECT_MANAGER';

  // Scoped budgets:
  // Superadmins & Finance Officers see all budgets across the entire company.
  // Line Managers and Admins can ONLY see the status of their own budgets.
  const accessibleBudgets = canSeeAllFinance
    ? budgetRequests
    : budgetRequests.filter(req => 
        req.requestedById === currentUser.id ||
        req.requestedByName?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()
      );

  const filteredBudgets = accessibleBudgets.filter(req => {
    if (budgetStageFilter === 'ALL') return true;
    return req.approvalStage === budgetStageFilter;
  });

  const totalBudgetRequested = accessibleBudgets.reduce((acc, curr) => acc + curr.amountNgn, 0);
  const mdPendingBudgetCount = accessibleBudgets.filter(b => b.approvalStage === 'MD_PENDING').length;
  const cfoReviewCount = accessibleBudgets.filter(b => b.approvalStage === 'CFO_REVIEW').length;
  const inCollationCount = accessibleBudgets.filter(b => b.approvalStage === 'IN_COLLATION').length;
  const withOziomaCount = accessibleBudgets.filter(b => b.approvalStage === 'WITH_OZIOMA').length;
  const approvedBudgetAmount = accessibleBudgets.filter(b => b.status === 'APPROVED').reduce((acc, curr) => acc + curr.amountNgn, 0);
  const approvedBudgetCount = accessibleBudgets.filter(b => b.status === 'APPROVED').length;
  const declinedBudgetCount = accessibleBudgets.filter(b => b.status === 'DECLINED').length;

  // Access Guard: If user is neither Finance nor a Line Manager/Admin, restrict access
  if (!canSeeAllFinance && !isLineManagerOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Restricted Finance Access
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          The Financial Governance & Invoicing module is reserved for Department Line Managers, Finance Officers, and Executive Leadership. If you require budget allocation or project funds, please liaise directly with your Line Manager.
        </p>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-6">
          Signed in as: <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({currentUser.jobTitle})
        </div>
        <Link
          href="/workspace"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          Return to My Workspace
        </Link>
      </div>
    );
  }

  // Petty Cash Funds
  const giftFund = pettyCashFunds.find(f => f.custodian === 'GIFT') || {
    id: 'pcf-gift',
    custodian: 'GIFT' as const,
    custodianName: 'Gift',
    allocatedAmountNgn: 300000,
    currentBalanceNgn: 212000,
    allocatedBy: 'Dr. Kaine Edike',
    lastReplenishedDate: '2026-09-01'
  };

  const marvelousFund = pettyCashFunds.find(f => f.custodian === 'MARVELOUS') || {
    id: 'pcf-marvelous',
    custodian: 'MARVELOUS' as const,
    custodianName: 'Marvelous',
    allocatedAmountNgn: 300000,
    currentBalanceNgn: 184500,
    allocatedBy: 'Dr. Kaine Edike',
    lastReplenishedDate: '2026-09-01'
  };

  const totalPettyCashBalance = giftFund.currentBalanceNgn + marvelousFund.currentBalanceNgn;
  const totalPettyCashSpent = pettyCashTransactions.reduce((acc, curr) => acc + curr.amountNgn, 0);

  // Invoices Calculations
  const filteredInvoices = invoices.filter(inv => {
    if (invoiceStatusFilter === 'ALL') return true;
    return inv.status === invoiceStatusFilter;
  });

  const totalBilledNgn = invoices.reduce((acc, curr) => acc + curr.subtotalNgn, 0);
  const totalPaidNgn = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.netPayableNgn, 0);
  const totalVatTracked = invoices.reduce((acc, curr) => acc + curr.vatAmountNgn, 0);
  const totalWhtDeductions = invoices.reduce((acc, curr) => acc + curr.whtDeductionNgn, 0);

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
      currency: invoiceCurrency,
      preparedByName: isMarvelous ? 'Marvelous' : (isGift ? 'Gift' : currentUser.name)
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
      {/* Header with Active Persona Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Budget, Invoice & Finance Governance
          </h1>
        </div>

        {/* Action Buttons & Persona Stamping */}
        <div className="flex items-center gap-2">
          {/* Submit Budget Request is accessible to Superadmins, Finance Officers, and Line Managers */}
          <button
            onClick={() => {
              setIsNewBudgetOpen(true);
              haptics.selection();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Budget Request</span>
          </button>

          {canSeeAllFinance && activeMainTab === 'PETTY_CASH' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveCustodianForExpense(isMarvelous ? 'MARVELOUS' : 'GIFT');
                  setIsPettyExpenseOpen(true);
                  haptics.selection();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Petty Cash Expense</span>
              </button>
            </div>
          )}

          {canSeeAllFinance && activeMainTab === 'INVOICES' && (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] dark:text-[#1D1D1F] text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Prepare Milestone Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* SOP Persona Authority Banner */}
      <div className="p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-semibold text-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A1A1A6]">
                {currentUser.jobTitle}
              </span>
              {isSuperadmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  Superadmin
                </span>
              )}
              {!isSuperadmin && isFinanceOfficer && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  Finance Officer
                </span>
              )}
              {!canSeeAllFinance && isLineManagerOrAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Line Manager
                </span>
              )}
            </div>
            {(!isLineManagerOrAdmin || isDrK || isBibi || isErica || isOzioma || isGift || isMarvelous) && (
              <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">
                {isDrK && "Founder & Managing Consultant (MD) • Primary Sign-off for All Budgets, Invoices & Petty Cash Allocations"}
                {isBibi && "Executive Director (2nd in Command) • Authorized to approve budgets on Dr. K's behalf to prevent delays"}
                {isErica && "Chief Financial Officer (CFO) • Vets, projects, and consolidates budgets. Reviews monthly petty cash"}
                {isOzioma && "Senior Consultant & Commercial Liaison • Receives PM client-facing budgets and presents to MD"}
                {isGift && "Finance Officer • Collation Lead & Primary Monthly Petty Cash Analyst (Custodian of ₦300k Fund)"}
                {isMarvelous && "Finance Officer • Primary Invoice Preparer & Petty Cash Custodian (₦300k Fund)"}
                {!isDrK && !isBibi && !isErica && !isOzioma && !isGift && !isMarvelous && !isLineManagerOrAdmin && (
                  "Standard Staff • View restricted."
                )}
              </div>
            )}
          </div>
        </div>

        {/* SLA Status Pill */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] text-[#86868B] dark:text-[#A1A1A6] text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#86868B]" />
            <span>SOP Target: 24h Approval Gate</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Segmented Control */}
      {canSeeAllFinance ? (
        <div className="inline-flex p-1 bg-black/[0.05] dark:bg-white/[0.08] rounded-2xl gap-1 max-w-full overflow-x-auto select-none">
          <button
            onClick={() => { setActiveMainTab('BUDGETS'); haptics.selection(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'BUDGETS'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>1. Budget Workflow</span>
            {mdPendingBudgetCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-semibold tnum">
                {mdPendingBudgetCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveMainTab('PETTY_CASH'); haptics.selection(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'PETTY_CASH'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>2. Petty Cash & Imprest</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('INVOICES'); haptics.selection(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'INVOICES'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>3. Milestone Invoicing</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('EXPENSES'); haptics.selection(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'EXPENSES'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. Fund Retirement</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.1] text-[#1D1D1F] dark:text-white font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>My Departmental Budget Status</span>
            </div>
            <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] font-normal hidden sm:inline">
              Personal & Departmental Submissions Only
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            Line Manager Scoped
          </span>
        </div>
      )}

      {/* TAB 1: BUDGET APPROVAL WORKFLOW */}
      {(canSeeAllFinance ? activeMainTab === 'BUDGETS' : true) && (
        <div className="space-y-6">
          {/* Telemetry Cards */}
          {canSeeAllFinance ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Capex Requested</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  ₦{(totalBudgetRequested / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">{budgetRequests.length} Total Submissions</div>
              </div>

              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>Waiting MD Approval</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  {mdPendingBudgetCount} Requests
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Ball-in-court: Dr. Kaine / Bibi</div>
              </div>

              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">With Erica (CFO Review)</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  {cfoReviewCount} Requests
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Executive financial vetting</div>
              </div>

              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Approved Disbursements</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  ₦{(approvedBudgetAmount / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Ready for wire release</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">My Submitted Budgets</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  {accessibleBudgets.length} Requests
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">
                  {accessibleBudgets.filter(b => b.budgetType === 'DEPARTMENTAL').length} Dept • {accessibleBudgets.filter(b => b.budgetType === 'CLIENT_FACING').length} Project
                </div>
              </div>

              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Requested Capex</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  ₦{(totalBudgetRequested / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Submitted for review</div>
              </div>

              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">In Review Pipeline</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  {accessibleBudgets.filter(b => b.status === 'PENDING_APPROVAL').length} Requests
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">With Collation, CFO, or MD</div>
              </div>

              <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">My Approved Funding</div>
                <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                  ₦{(approvedBudgetAmount / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">{approvedBudgetCount} Approved & Capex Ready</div>
              </div>
            </div>
          )}

          {/* Stage Filter Buttons */}
          <div className="inline-flex p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl text-xs font-medium overflow-x-auto gap-1">
            {[
              { id: 'ALL', label: canSeeAllFinance ? 'All Budgets' : `All My Submissions (${accessibleBudgets.length})` },
              { id: 'MD_PENDING', label: `Pending MD / Bibi (${mdPendingBudgetCount})` },
              { id: 'CFO_REVIEW', label: `With Erica (CFO) (${cfoReviewCount})` },
              { id: 'WITH_OZIOMA', label: `With Miss Ozioma (${withOziomaCount})` },
              { id: 'IN_COLLATION', label: `In Collation (${inCollationCount})` },
              { id: 'APPROVED', label: `Approved (${approvedBudgetCount})` },
              { id: 'DECLINED', label: `Declined (${declinedBudgetCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setBudgetStageFilter(tab.id as any); haptics.selection(); }}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  budgetStageFilter === tab.id
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                    : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Budgets Table with Live SLA and Action Buttons */}
          <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] text-[#86868B] dark:text-[#A1A1A6] font-medium text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Budget Request</th>
                    <th className="px-6 py-3.5">Type & Frequency</th>
                    <th className="px-6 py-3.5 text-right">Amount (₦ NGN)</th>
                    <th className="px-6 py-3.5">Stage & Ball-in-Court</th>
                    <th className="px-6 py-3.5">Vetting & Review History</th>
                    <th className="px-6 py-3.5 text-right">{canSeeAllFinance ? 'SOP Actions' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-normal">
                  {filteredBudgets.map((req) => {
                    const isPendingMD = req.approvalStage === 'MD_PENDING';
                    const isWithCFO = req.approvalStage === 'CFO_REVIEW';
                    const isCollation = req.approvalStage === 'IN_COLLATION';
                    const isWithOzioma = req.approvalStage === 'WITH_OZIOMA';
                    const isApproved = req.status === 'APPROVED';
                    const isDeclined = req.status === 'DECLINED';

                    return (
                      <tr key={req.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                        {/* Request Title & Department */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{req.requestNumber}</span>
                            {req.budgetType === 'CLIENT_FACING' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                                Client Project
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A1A1A6]">
                                Departmental
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">{req.title}</div>
                          <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">
                            {req.department} • By: {req.requestedByName}
                          </div>
                        </td>

                        {/* Frequency & Category */}
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] text-[11px] font-medium">
                            {req.category.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] mt-1">
                            {req.frequency || 'PERIODIC'}
                          </div>
                        </td>

                        {/* Amount & Misc */}
                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs tnum">
                            ₦{req.amountNgn.toLocaleString()}
                          </div>
                          {req.miscellaneousAmountNgn ? (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 tnum">
                              +₦{req.miscellaneousAmountNgn.toLocaleString()} Misc
                            </div>
                          ) : null}
                        </td>

                        {/* Stage & Ball-in-Court */}
                        <td className="px-6 py-4">
                          {isPendingMD && (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Awaiting MD Review</span>
                              </div>
                              <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] pl-4">
                                Dr. Kaine / Bibi
                              </div>
                            </div>
                          )}

                          {isWithCFO && (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Under CFO Vetting</span>
                              </div>
                              <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] pl-4">
                                Erica (CFO)
                              </div>
                            </div>
                          )}

                          {isCollation && (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">In Officer Collation</span>
                              </div>
                              <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] pl-4">
                                {req.collatedByName || 'Gift / Marvelous'}
                              </div>
                            </div>
                          )}

                          {isWithOzioma && (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Commercial Collation</span>
                              </div>
                              <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] pl-4">
                                Miss Ozioma
                              </div>
                            </div>
                          )}

                          {isApproved && (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Approved & Ready</span>
                              </div>
                              {req.approvedOnBehalfOfDrK && (
                                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium pl-4">
                                  Via Bibi (2nd in Command)
                                </div>
                              )}
                            </div>
                          )}

                          {isDeclined && (
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">
                                {req.declineOutcome === 'REVISE_RESUBMIT' ? 'Returned for Revision' : 'Declined'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Vetting & Review Notes */}
                        <td className="px-6 py-4 text-[11px] text-[#86868B] dark:text-[#A1A1A6] max-w-xs">
                          {req.cfoReviewNotes && (
                            <div className="text-indigo-600 dark:text-indigo-400 mb-1">
                              <strong>CFO Note:</strong> {req.cfoReviewNotes}
                            </div>
                          )}
                          {req.reviewComments && (
                            <div className="text-emerald-700 dark:text-emerald-400">
                              <strong>MD Note:</strong> {req.reviewComments}
                            </div>
                          )}
                          {!req.cfoReviewNotes && !req.reviewComments && (
                            <span className="text-[#86868B]/60 italic">No notes logged</span>
                          )}
                        </td>

                        {/* Action Buttons based on logged in persona */}
                        <td className="px-6 py-4 text-right">
                          {canSeeAllFinance ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* MD Approval Gate for Dr. K */}
                              {isPendingMD && isDrK && (
                                <>
                                  <button
                                    onClick={() => {
                                      approveBudgetAsMD(req.id, false, 'Approved by Dr. Kaine Edike (MD).');
                                      haptics.success();
                                    }}
                                    className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all"
                                  >
                                    Approve (Dr. K)
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Reason for declining:') || 'Declined during MD review.';
                                      declineBudgetAsMD(req.id, false, reason);
                                      haptics.impact();
                                    }}
                                    className="px-2.5 py-1.5 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-xl text-xs font-medium transition-all"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {/* Alternative Approval Gate for Bibi (2nd in Command) */}
                              {isPendingMD && isBibi && !isDrK && (
                                <>
                                  <button
                                    onClick={() => {
                                      approveBudgetAsMD(req.id, true, 'Approved by Bibi on behalf of Dr. Kaine Edike (2nd in Command SLA clause).');
                                      haptics.success();
                                    }}
                                    title="Approve on Dr. K's behalf to avoid project bottleneck (SOP Section 1)"
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all"
                                  >
                                    Approve for Dr. K
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Reason for declining:') || 'Declined during 2nd-in-command review.';
                                      declineBudgetAsMD(req.id, true, reason);
                                      haptics.impact();
                                    }}
                                    className="px-2.5 py-1.5 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white rounded-xl text-xs font-medium transition-all"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {/* CFO Review Action for Erica */}
                              {isWithCFO && (isErica || isSuperadmin) && (
                                <button
                                  onClick={() => setVettingBudget(req)}
                                  className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] dark:text-[#1D1D1F] text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>CFO Vet</span>
                                </button>
                              )}

                              {/* Collation Action for Gift & Marvelous */}
                              {isCollation && (isGift || isMarvelous || isSuperadmin) && (
                                <button
                                  onClick={() => setCollatingBudget(req)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Collate & Forward</span>
                                </button>
                              )}

                              {/* Ozioma Action for Client Project Budgets */}
                              {isWithOzioma && (isOzioma || isSuperadmin) && (
                                <button
                                  onClick={() => {
                                    cfoReviewBudget(req.id, 'PROJECT_TO_DR_K', 'Miss Ozioma reviewed client project budget against contract scope. Projected to Dr. Kaine Edike.');
                                    haptics.success();
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                  <span>Present to Dr. K</span>
                                </button>
                              )}

                              {isApproved && (
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                  Wire Ready
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {isPendingMD && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                  <Clock className="w-3 h-3" />
                                  <span>Awaiting MD Sign-Off</span>
                                </span>
                              )}
                              {isWithCFO && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Under CFO Vetting</span>
                                </span>
                              )}
                              {isCollation && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300">
                                  <Users className="w-3 h-3" />
                                  <span>In Collation</span>
                                </span>
                              )}
                              {isWithOzioma && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                  <Briefcase className="w-3 h-3" />
                                  <span>With Miss Ozioma</span>
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approved & Ready</span>
                                </span>
                              )}
                              {isDeclined && req.declineOutcome === 'REVISE_RESUBMIT' && (
                                <button
                                  onClick={() => {
                                    setIsNewBudgetOpen(true);
                                    haptics.selection();
                                  }}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Resubmit Revision</span>
                                </button>
                              )}
                              {isDeclined && req.declineOutcome !== 'REVISE_RESUBMIT' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400">
                                  <XCircle className="w-3 h-3" />
                                  <span>Dropped</span>
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredBudgets.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#86868B]">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                    No Budget Requests Found
                  </div>
                  <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] max-w-sm mx-auto">
                    {accessibleBudgets.length === 0
                      ? "You have not submitted any budget requests yet. Click '+ Submit Budget Request' above to create an operational or project delivery request."
                      : "No budget requests match the selected stage filter."}
                  </p>
                  {accessibleBudgets.length === 0 && (
                    <button
                      onClick={() => { setIsNewBudgetOpen(true); haptics.selection(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97] mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit Budget Request</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PETTY CASH & IMPREST LEDGER */}
      {canSeeAllFinance && activeMainTab === 'PETTY_CASH' && (
        <div className="space-y-6">
          {/* Dual Imprest Fund Cards (Gift & Marvelous - SOP Section 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gift's Fund Card */}
            <div className="rounded-3xl p-6 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Gift's Imprest Fund</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        Primary Collation
                      </span>
                    </div>
                    <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-0.5">Office water dispensers, stationery & HQ repairs</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">Available Balance</div>
                  <div className="text-2xl font-semibold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                    ₦{giftFund.currentBalanceNgn.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar of Fund Burn */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#86868B] dark:text-[#A1A1A6]">
                  <span>Spent: ₦{(giftFund.allocatedAmountNgn - giftFund.currentBalanceNgn).toLocaleString()}</span>
                  <span>Cap: ₦{giftFund.allocatedAmountNgn.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-black/[0.05] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(giftFund.currentBalanceNgn / giftFund.allocatedAmountNgn) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#86868B] dark:text-[#A1A1A6] text-[11px]">Allocated by: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Dr. Kaine Edike</strong></span>
                <button
                  onClick={() => {
                    setActiveCustodianForExpense('GIFT');
                    setIsPettyExpenseOpen(true);
                    haptics.selection();
                  }}
                  className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-medium shadow-xs active:scale-[0.97] transition-all"
                >
                  Log Voucher (Gift)
                </button>
              </div>
            </div>

            {/* Marvelous's Fund Card */}
            <div className="rounded-3xl p-6 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-sm">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Marvelous's Imprest Fund</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        Invoicing & Logistics
                      </span>
                    </div>
                    <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] mt-0.5">Uber courier, lab dispatches & field emergencies</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">Available Balance</div>
                  <div className="text-2xl font-semibold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                    ₦{marvelousFund.currentBalanceNgn.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar of Fund Burn */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#86868B] dark:text-[#A1A1A6]">
                  <span>Spent: ₦{(marvelousFund.allocatedAmountNgn - marvelousFund.currentBalanceNgn).toLocaleString()}</span>
                  <span>Cap: ₦{marvelousFund.allocatedAmountNgn.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-black/[0.05] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(marvelousFund.currentBalanceNgn / marvelousFund.allocatedAmountNgn) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#86868B] dark:text-[#A1A1A6] text-[11px]">Allocated by: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Dr. Kaine Edike</strong></span>
                <button
                  onClick={() => {
                    setActiveCustodianForExpense('MARVELOUS');
                    setIsPettyExpenseOpen(true);
                    haptics.selection();
                  }}
                  className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-medium shadow-xs active:scale-[0.97] transition-all"
                >
                  Log Voucher (Marvelous)
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Analysis & Replenishment Panel (SOP Section 4) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Monthly Petty Cash Reconciliation Analysis</h4>
              </div>
              <p className="text-[#86868B] dark:text-[#A1A1A6] text-[11px]">
                Per SOP Section 4, Gift is primarily responsible for monthly analysis (Marvelous is backup). Reconciles all physical vouchers and triggers MD replenishment back to ₦300,000.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const currentMonth = new Date().toISOString().substring(0, 7);
                  generatePettyCashMonthlyAnalysis(currentMonth);
                  haptics.success();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all"
              >
                Compile Monthly Analysis
              </button>

              {(isDrK || isBibi || isSuperadmin) && (
                <button
                  onClick={() => {
                    const latest = pettyCashAnalyses[0];
                    if (latest) {
                      approvePettyCashReplenishment(latest.id, 'Replenishment approved by MD/Executive.');
                      haptics.success();
                    } else {
                      alert('Please compile monthly analysis first.');
                    }
                  }}
                  className="px-3.5 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Approve ₦600k Replenishment</span>
                </button>
              )}
            </div>
          </div>

          {/* Imprest Transaction Vouchers Table */}
          <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                Imprest Expense Ledger ({pettyCashTransactions.length} Vouchers)
              </h3>
              <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] font-medium tnum">Total Spent This Month: ₦{totalPettyCashSpent.toLocaleString()}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] text-[#86868B] dark:text-[#A1A1A6] font-medium text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Date & Fund</th>
                    <th className="px-6 py-3.5">Expense Category</th>
                    <th className="px-6 py-3.5">Description / Purpose</th>
                    <th className="px-6 py-3.5 text-right">Amount (₦ NGN)</th>
                    <th className="px-6 py-3.5">Receipt / Voucher</th>
                    <th className="px-6 py-3.5">Custodian Sign-off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-normal">
                  {pettyCashTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{tx.date}</div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          tx.fundCustodian === 'GIFT' 
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        }`}>
                          {tx.fundCustodian}'s Fund
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[11px]">
                          {tx.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] max-w-sm">
                        {tx.description}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                        ₦{tx.amountNgn.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {tx.receiptUrl ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] underline cursor-pointer">
                            {tx.receiptUrl}
                          </span>
                        ) : (
                          <span className="text-[#86868B]/60 italic">Voucher on file</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-[#86868B] dark:text-[#A1A1A6]">
                        {tx.approvedByName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONE INVOICING & DR. K CONFIRMATION */}
      {canSeeAllFinance && activeMainTab === 'INVOICES' && (
        <div className="space-y-6">
          {/* Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="text-xs font-medium text-[#86868B] dark:text-[#A1A1A6]">Total Billed Gross</div>
              <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] tnum">₦{(totalBilledNgn / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">{invoices.length} Milestone Invoices</div>
            </div>

            <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Cash Collected (Net)</div>
              <div className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 tnum">₦{(totalPaidNgn / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Reconciled wire payments</div>
            </div>

            <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">7.5% VAT Tracked</div>
              <div className="text-2xl font-semibold tracking-tight text-indigo-600 dark:text-indigo-400 tnum">₦{(totalVatTracked / 1000000).toFixed(2)}M</div>
              <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">FIRS Compliance Ledger</div>
            </div>

            <div className="rounded-2xl p-5 space-y-1.5 bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">WHT Deductions (5%)</div>
              <div className="text-2xl font-semibold tracking-tight text-amber-600 dark:text-amber-400 tnum">₦{(totalWhtDeductions / 1000000).toFixed(2)}M</div>
              <div className="text-xs text-[#86868B] dark:text-[#A1A1A6]">Credit note reconciliation</div>
            </div>
          </div>

          {/* Filter & Preparer Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl text-xs font-medium gap-1">
              <button
                onClick={() => setInvoiceStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  invoiceStatusFilter === 'ALL' ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold' : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                All Invoices ({invoices.length})
              </button>
              <button
                onClick={() => setInvoiceStatusFilter('ISSUED')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  invoiceStatusFilter === 'ISSUED' ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold' : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Awaiting Payment ({invoices.filter(i => i.status === 'ISSUED').length})
              </button>
              <button
                onClick={() => setInvoiceStatusFilter('PAID')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  invoiceStatusFilter === 'PAID' ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold' : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                Settled ({invoices.filter(i => i.status === 'PAID').length})
              </button>
            </div>

            <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] flex items-center gap-2">
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">SOP Rule:</span> Marvelous prepares; confirmation required with Dr. Kaine Edike before clearance.
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] text-[#86868B] dark:text-[#A1A1A6] font-medium text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Invoice & Client</th>
                    <th className="px-6 py-3.5">Milestone Description</th>
                    <th className="px-6 py-3.5">Preparer (SOP)</th>
                    <th className="px-6 py-3.5 text-right">Net Payable</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Dr. K Confirmation</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-normal">
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'PAID';
                    const isConfirmed = inv.confirmedWithDrK;

                    return (
                      <tr key={inv.id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">{inv.clientName}</div>
                        </td>

                        <td className="px-6 py-4 text-[11px] text-[#86868B] dark:text-[#A1A1A6] max-w-xs">
                          {inv.milestoneDescription}
                        </td>

                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-[#86868B] dark:text-[#A1A1A6]">
                            {inv.preparedByName || 'Marvelous'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right font-mono font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] tnum">
                          ₦{inv.netPayableNgn.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            isPaid 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          }`}>
                            {isPaid ? 'Paid' : 'Issued'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirmed</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              Pending Verification
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right space-x-1.5">
                          {!isConfirmed && (
                            <button
                              onClick={() => {
                                confirmPaymentWithDrK(inv.id);
                                haptics.success();
                              }}
                              title="SOP Requirement: Confirm receipt directly with Dr. Kaine Edike"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all"
                            >
                              Confirm with Dr. K
                            </button>
                          )}

                          {!isPaid && (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] dark:text-[#1D1D1F] text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FUND RETIREMENT & EXPENSE TRACKING */}
      {canSeeAllFinance && activeMainTab === 'EXPENSES' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
            <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Fund Retirement & Project Expenditure Reconciliation</h3>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] leading-relaxed max-w-3xl">
              Per AquaEarth Financial SOP Section 5: All advances granted for field campaigns, soil testing, and bathymetric surveys must be retired within 48 hours of mobilization completion. Unspent balances are refunded back to treasury accounts, backed by physical receipts and miscellaneous justification logs.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs p-8">
            <div className="text-center py-10 space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto opacity-90" />
              <h4 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">All Active Mobilizations Fully Collated</h4>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] max-w-md mx-auto">
                No outstanding unretired cash advances past the 48-hour window. Active projects are within authorized capex thresholds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <BudgetRequestModal
        isOpen={isNewBudgetOpen}
        onClose={() => setIsNewBudgetOpen(false)}
      />

      <CfoVettingModal
        isOpen={!!vettingBudget}
        budget={vettingBudget}
        onClose={() => setVettingBudget(null)}
      />

      <CollateBudgetModal
        isOpen={!!collatingBudget}
        budget={collatingBudget}
        onClose={() => setCollatingBudget(null)}
      />

      <PettyCashExpenseModal
        isOpen={isPettyExpenseOpen}
        defaultCustodian={activeCustodianForExpense}
        onClose={() => setIsPettyExpenseOpen(false)}
      />

      {/* Record Payment Modal */}
      <AnimatePresence>
        {selectedInvoiceForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoiceForPayment(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Reconcile Client Wire Payment</span>
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
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Confirm Wire Cleared</button>
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
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Prepare Milestone Invoice</h3>
                  <p className="text-[10px] text-slate-500">Prepared by: Marvelous (Primary Preparer)</p>
                </div>
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
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Subtotal (₦ NGN)</label>
                    <input
                      type="number"
                      required
                      step={100000}
                      value={subtotalNgn}
                      onChange={(e) => setSubtotalNgn(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₦{Number(subtotalNgn).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-purple-600 dark:text-purple-400 font-semibold">
                    <span>+ 7.5% VAT:</span>
                    <span>₦{(Number(subtotalNgn) * 0.075).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                    <span>- 5.0% WHT:</span>
                    <span>₦{(Number(subtotalNgn) * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1 text-xs">
                    <span>Net Payable:</span>
                    <span>₦{(Number(subtotalNgn) * 1.025).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => setIsNewInvoiceOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Issue Invoice</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
