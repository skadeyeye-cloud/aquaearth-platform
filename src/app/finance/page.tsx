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
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 tracking-tight">
              Module 10 • Financial Governance & Invoicing
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Official SOP Enforced
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Budget, Invoice & Finance Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-stage collation, CFO vetting, Dr. K / Bibi executive authorization, and dual ₦300,000 imprest funds.
          </p>
        </div>

        {/* Action Buttons & Persona Stamping */}
        <div className="flex items-center gap-2">
          {/* Submit Budget Request is accessible to Superadmins, Finance Officers, and Line Managers */}
          <button
            onClick={() => {
              setIsNewBudgetOpen(true);
              haptics.selection();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Petty Cash Expense</span>
              </button>
            </div>
          )}

          {canSeeAllFinance && activeMainTab === 'INVOICES' && (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Prepare Milestone Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* SOP Persona Authority Banner */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentUser.jobTitle}
              </span>
              {isSuperadmin && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  SUPERADMIN
                </span>
              )}
              {!isSuperadmin && isFinanceOfficer && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  FINANCE OFFICER
                </span>
              )}
              {!canSeeAllFinance && isLineManagerOrAdmin && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  LINE MANAGER (SCOPED)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isDrK && "Founder & Managing Consultant (MD) • Primary Sign-off for All Budgets, Invoices & Petty Cash Allocations"}
              {isBibi && "Executive Director (2nd in Command) • Authorized to approve budgets on Dr. K's behalf to prevent delays"}
              {isErica && "Chief Financial Officer (CFO) • Vets, projects, and consolidates budgets. Reviews monthly petty cash"}
              {isOzioma && "Senior Consultant & Commercial Liaison • Receives PM client-facing budgets and presents to MD"}
              {isGift && "Finance Officer • Collation Lead & Primary Monthly Petty Cash Analyst (Custodian of ₦300k Fund)"}
              {isMarvelous && "Finance Officer • Primary Invoice Preparer & Petty Cash Custodian (₦300k Fund)"}
              {!isDrK && !isBibi && !isErica && !isOzioma && !isGift && !isMarvelous && (
                isLineManagerOrAdmin
                  ? "Line Manager Portal • Scoped strictly to your departmental budget submissions. Approvals & petty cash are managed by Finance & Executive Leadership."
                  : "Standard Staff • View restricted."
              )}
            </div>
          </div>
        </div>

        {/* SLA Status Pill */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>SOP Target: 24h Approval Gate</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      {canSeeAllFinance ? (
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => { setActiveMainTab('BUDGETS'); haptics.selection(); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'BUDGETS'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>1. Budget Approval Workflow</span>
            {mdPendingBudgetCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {mdPendingBudgetCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveMainTab('PETTY_CASH'); haptics.selection(); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'PETTY_CASH'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>2. Petty Cash & Imprest (Gift & Marvelous)</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('INVOICES'); haptics.selection(); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'INVOICES'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>3. Milestone Invoicing & Dr. K Confirmation</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('EXPENSES'); haptics.selection(); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
              activeMainTab === 'EXPENSES'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. Fund Retirement & Cost Tracking</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-2xs">
              <DollarSign className="w-3.5 h-3.5" />
              <span>My Departmental Budget Status</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Personal & Line Manager Submissions Only
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Line Manager Scoped
          </span>
        </div>
      )}

      {/* TAB 1: BUDGET APPROVAL WORKFLOW */}
      {(canSeeAllFinance ? activeMainTab === 'BUDGETS' : true) && (
        <div className="space-y-4">
          {/* Telemetry Cards */}
          {canSeeAllFinance ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Capex Requested</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">
                  ₦{(totalBudgetRequested / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{budgetRequests.length} Total Submissions</div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-rose-500 flex items-center justify-between">
                  <span>Waiting MD Approval</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tnum">
                  {mdPendingBudgetCount} Requests
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Ball-in-court: Dr. Kaine / Bibi</div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-purple-500">With Erica (CFO Review)</div>
                <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tnum">
                  {cfoReviewCount} Requests
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Executive financial vetting</div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-emerald-500">Approved Disbursements</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">
                  ₦{(approvedBudgetAmount / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Ready for wire release</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">My Submitted Budgets</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">
                  {accessibleBudgets.length} Requests
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {accessibleBudgets.filter(b => b.budgetType === 'DEPARTMENTAL').length} Dept • {accessibleBudgets.filter(b => b.budgetType === 'CLIENT_FACING').length} Project
                </div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-blue-500">Total Requested Capex</div>
                <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tnum">
                  ₦{(totalBudgetRequested / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Submitted for review</div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-amber-500">In Review Pipeline</div>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tnum">
                  {accessibleBudgets.filter(b => b.status === 'PENDING_APPROVAL').length} Requests
                </div>
                <div className="text-[10px] text-slate-500 font-medium">With Collation, CFO, or MD</div>
              </div>

              <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-emerald-500">My Approved Funding</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">
                  ₦{(approvedBudgetAmount / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{approvedBudgetCount} Approved & Capex Ready</div>
              </div>
            </div>
          )}

          {/* Stage Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold overflow-x-auto">
            {[
              { id: 'ALL', label: canSeeAllFinance ? 'All Budgets' : `All My Submissions (${accessibleBudgets.length})` },
              { id: 'MD_PENDING', label: `Pending MD / Bibi (${mdPendingBudgetCount})`, alert: mdPendingBudgetCount > 0 },
              { id: 'CFO_REVIEW', label: `With Erica (CFO) (${cfoReviewCount})` },
              { id: 'WITH_OZIOMA', label: `With Miss Ozioma (${withOziomaCount})` },
              { id: 'IN_COLLATION', label: `In Collation (${inCollationCount})` },
              { id: 'APPROVED', label: `Approved (${approvedBudgetCount})` },
              { id: 'DECLINED', label: `Declined (${declinedBudgetCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setBudgetStageFilter(tab.id as any); haptics.selection(); }}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  budgetStageFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Budgets Table with Live SLA and Action Buttons */}
          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Budget Request</th>
                    <th className="px-5 py-3">Type & Frequency</th>
                    <th className="px-5 py-3 text-right">Amount (₦ NGN)</th>
                    <th className="px-5 py-3">Stage & Ball-in-Court</th>
                    <th className="px-5 py-3">Vetting & Review History</th>
                    <th className="px-5 py-3 text-right">{canSeeAllFinance ? 'SOP Actions' : 'Status & Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredBudgets.map((req) => {
                    const isPendingMD = req.approvalStage === 'MD_PENDING';
                    const isWithCFO = req.approvalStage === 'CFO_REVIEW';
                    const isCollation = req.approvalStage === 'IN_COLLATION';
                    const isWithOzioma = req.approvalStage === 'WITH_OZIOMA';
                    const isApproved = req.status === 'APPROVED';
                    const isDeclined = req.status === 'DECLINED';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Request Title & Department */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{req.requestNumber}</span>
                            {req.budgetType === 'CLIENT_FACING' ? (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                CLIENT PROJECT
                              </span>
                            ) : (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                DEPARTMENTAL
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{req.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Dept: <strong className="text-slate-700 dark:text-slate-300">{req.department}</strong> • By: {req.requestedByName}
                          </div>
                        </td>

                        {/* Frequency & Category */}
                        <td className="px-5 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {req.category.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Frequency: {req.frequency || 'PERIODIC'}
                          </div>
                        </td>

                        {/* Amount & Misc */}
                        <td className="px-5 py-3 text-right">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs tnum">
                            ₦{req.amountNgn.toLocaleString()}
                          </div>
                          {req.miscellaneousAmountNgn ? (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                              +₦{req.miscellaneousAmountNgn.toLocaleString()} Misc
                            </div>
                          ) : null}
                        </td>

                        {/* Stage & Ball-in-Court */}
                        <td className="px-5 py-3">
                          {isPendingMD && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span>Waiting on MD / Bibi</span>
                              </span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Ball: <strong>Dr. Kaine Edike</strong> / <strong>Bibi</strong>
                              </div>
                            </div>
                          )}

                          {isWithCFO && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <ShieldCheck className="w-3 h-3" />
                                <span>CFO Review & Vetting</span>
                              </span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Ball: <strong>Erica (CFO)</strong>
                              </div>
                            </div>
                          )}

                          {isCollation && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                <Users className="w-3 h-3" />
                                <span>Collation with Officers</span>
                              </span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Assigned: <strong>{req.collatedByName || 'Gift / Marvelous'}</strong>
                              </div>
                            </div>
                          )}

                          {isWithOzioma && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <Briefcase className="w-3 h-3" />
                                <span>Commercial Collation</span>
                              </span>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Ball: <strong>Miss Ozioma</strong>
                              </div>
                            </div>
                          )}

                          {isApproved && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Disbursement Approved</span>
                              </span>
                              {req.approvedOnBehalfOfDrK && (
                                <div className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold">
                                  Approved by Bibi (2nd-in-Command)
                                </div>
                              )}
                            </div>
                          )}

                          {isDeclined && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <XCircle className="w-3 h-3" />
                              <span>{req.declineOutcome === 'REVISE_RESUBMIT' ? 'Returned for Revision' : 'Declined & Dropped'}</span>
                            </span>
                          )}
                        </td>

                        {/* Vetting & Review Notes */}
                        <td className="px-5 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                          {req.cfoReviewNotes && (
                            <div className="text-purple-700 dark:text-purple-300 mb-1">
                              <strong>CFO Note:</strong> {req.cfoReviewNotes}
                            </div>
                          )}
                          {req.reviewComments && (
                            <div className="text-emerald-700 dark:text-emerald-300">
                              <strong>MD Note:</strong> {req.reviewComments}
                            </div>
                          )}
                          {!req.cfoReviewNotes && !req.reviewComments && (
                            <span className="text-slate-400 italic">No vetting comments logged</span>
                          )}
                        </td>

                        {/* Action Buttons based on logged in persona */}
                        <td className="px-5 py-3 text-right">
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
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-95 transition-all"
                                  >
                                    Approve (Dr. K)
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Reason for declining:') || 'Declined during MD review.';
                                      declineBudgetAsMD(req.id, false, reason);
                                      haptics.impact();
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition-all"
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
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-95 transition-all"
                                  >
                                    Approve on Dr. K Behalf
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Reason for declining:') || 'Declined during 2nd-in-command review.';
                                      declineBudgetAsMD(req.id, true, reason);
                                      haptics.impact();
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition-all"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {/* CFO Review Action for Erica */}
                              {isWithCFO && (isErica || isSuperadmin) && (
                                <button
                                  onClick={() => setVettingBudget(req)}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>CFO Vet</span>
                                </button>
                              )}

                              {/* Collation Action for Gift & Marvelous */}
                              {isCollation && (isGift || isMarvelous || isSuperadmin) && (
                                <button
                                  onClick={() => setCollatingBudget(req)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
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
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                                >
                                  <Crown className="w-3 h-3" />
                                  <span>Present to Dr. K</span>
                                </button>
                              )}

                              {isApproved && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  Ready for Wire
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {isPendingMD && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  <Clock className="w-3 h-3" />
                                  <span>Awaiting MD Sign-Off</span>
                                </span>
                              )}
                              {isWithCFO && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Under CFO Vetting</span>
                                </span>
                              )}
                              {isCollation && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  <Users className="w-3 h-3" />
                                  <span>In Collation</span>
                                </span>
                              )}
                              {isWithOzioma && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  <Briefcase className="w-3 h-3" />
                                  <span>With Miss Ozioma</span>
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approved & Capex Ready</span>
                                </span>
                              )}
                              {isDeclined && req.declineOutcome === 'REVISE_RESUBMIT' && (
                                <button
                                  onClick={() => {
                                    setIsNewBudgetOpen(true);
                                    haptics.selection();
                                  }}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Resubmit Revision</span>
                                </button>
                              )}
                              {isDeclined && req.declineOutcome !== 'REVISE_RESUBMIT' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
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
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    No Budget Requests Found
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {accessibleBudgets.length === 0
                      ? "You have not submitted any budget requests yet. Click '+ Submit Budget Request' above to create an operational or project delivery request."
                      : "No budget requests match the selected stage filter."}
                  </p>
                  {accessibleBudgets.length === 0 && (
                    <button
                      onClick={() => { setIsNewBudgetOpen(true); haptics.selection(); }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 mt-2"
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
        <div className="space-y-5">
          {/* Dual Imprest Fund Cards (Gift & Marvelous - SOP Section 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gift's Fund Card */}
            <div className="apple-glass-card rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gift's Imprest Fund</h3>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Primary Collation
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Office water dispensers, stationery & HQ repairs</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Available Balance</div>
                  <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    ₦{giftFund.currentBalanceNgn.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar of Fund Burn */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Spent: ₦{(giftFund.allocatedAmountNgn - giftFund.currentBalanceNgn).toLocaleString()}</span>
                  <span>Cap: ₦{giftFund.allocatedAmountNgn.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(giftFund.currentBalanceNgn / giftFund.allocatedAmountNgn) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Allocated by: <strong>Dr. Kaine Edike</strong></span>
                <button
                  onClick={() => {
                    setActiveCustodianForExpense('GIFT');
                    setIsPettyExpenseOpen(true);
                    haptics.selection();
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-lg text-xs font-semibold shadow-2xs active:scale-95 transition-all"
                >
                  Log Voucher (Gift)
                </button>
              </div>
            </div>

            {/* Marvelous's Fund Card */}
            <div className="apple-glass-card rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Marvelous's Imprest Fund</h3>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                        Invoicing & Logistics
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Uber courier, lab dispatches & field emergencies</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Available Balance</div>
                  <div className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                    ₦{marvelousFund.currentBalanceNgn.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar of Fund Burn */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Spent: ₦{(marvelousFund.allocatedAmountNgn - marvelousFund.currentBalanceNgn).toLocaleString()}</span>
                  <span>Cap: ₦{marvelousFund.allocatedAmountNgn.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(marvelousFund.currentBalanceNgn / marvelousFund.allocatedAmountNgn) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Allocated by: <strong>Dr. Kaine Edike</strong></span>
                <button
                  onClick={() => {
                    setActiveCustodianForExpense('MARVELOUS');
                    setIsPettyExpenseOpen(true);
                    haptics.selection();
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-lg text-xs font-semibold shadow-2xs active:scale-95 transition-all"
                >
                  Log Voucher (Marvelous)
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Analysis & Replenishment Panel (SOP Section 4) */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-slate-900 dark:text-white">Monthly Petty Cash Reconciliation Analysis</h4>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
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
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-2xs active:scale-95 transition-all"
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
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Approve ₦600k Replenishment</span>
                </button>
              )}
            </div>
          </div>

          {/* Imprest Transaction Vouchers Table */}
          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Imprest Expense Ledger & Supporting Receipts ({pettyCashTransactions.length})
              </h3>
              <span className="text-[11px] text-slate-400">Total Spent This Month: ₦{totalPettyCashSpent.toLocaleString()}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Date & Fund</th>
                    <th className="px-5 py-3">Expense Category</th>
                    <th className="px-5 py-3">Description / Purpose</th>
                    <th className="px-5 py-3 text-right">Amount (₦ NGN)</th>
                    <th className="px-5 py-3">Receipt / Voucher</th>
                    <th className="px-5 py-3">Custodian Sign-off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {pettyCashTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">{tx.date}</div>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                          tx.fundCustodian === 'GIFT' 
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                            : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}>
                          {tx.fundCustodian}'S FUND
                        </span>
                      </td>

                      <td className="px-5 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {tx.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-700 dark:text-slate-300 max-w-sm">
                        {tx.description}
                      </td>

                      <td className="px-5 py-3 text-right font-mono font-bold text-xs text-slate-900 dark:text-white tnum">
                        ₦{tx.amountNgn.toLocaleString()}
                      </td>

                      <td className="px-5 py-3 text-xs">
                        {tx.receiptUrl ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] underline cursor-pointer">
                            {tx.receiptUrl}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Voucher on file</span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-500">
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
        <div className="space-y-4">
          {/* Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed Gross</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tnum">₦{(totalBilledNgn / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-500 font-medium">{invoices.length} Milestone Invoices</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Cash Collected (Net)</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">₦{(totalPaidNgn / 1000000).toFixed(1)}M</div>
              <div className="text-[10px] text-slate-500 font-medium">Reconciled wire payments</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">7.5% VAT Tracked</div>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tnum">₦{(totalVatTracked / 1000000).toFixed(2)}M</div>
              <div className="text-[10px] text-slate-500 font-medium">FIRS Compliance Ledger</div>
            </div>

            <div className="apple-glass-card rounded-2xl p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">WHT Deductions (5%)</div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 tnum">₦{(totalWhtDeductions / 1000000).toFixed(2)}M</div>
              <div className="text-[10px] text-slate-500 font-medium">Credit note reconciliation</div>
            </div>
          </div>

          {/* Filter & Preparer Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setInvoiceStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  invoiceStatusFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                All Invoices ({invoices.length})
              </button>
              <button
                onClick={() => setInvoiceStatusFilter('ISSUED')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  invoiceStatusFilter === 'ISSUED' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                Awaiting Payment ({invoices.filter(i => i.status === 'ISSUED').length})
              </button>
              <button
                onClick={() => setInvoiceStatusFilter('PAID')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  invoiceStatusFilter === 'PAID' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                Settled ({invoices.filter(i => i.status === 'PAID').length})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">SOP Rule:</span> Marvelous is primary preparer; confirmation required directly with Dr. Kaine Edike before clearance.
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Invoice & Client</th>
                    <th className="px-5 py-3">Milestone Description</th>
                    <th className="px-5 py-3">Preparer (SOP)</th>
                    <th className="px-5 py-3 text-right">Net Payable</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Dr. K Confirmation</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'PAID';
                    const isConfirmed = inv.confirmedWithDrK;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{inv.clientName}</div>
                        </td>

                        <td className="px-5 py-3 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
                          {inv.milestoneDescription}
                        </td>

                        <td className="px-5 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {inv.preparedByName || 'Marvelous (Lead)'}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-right font-mono font-bold text-xs text-slate-900 dark:text-white tnum">
                          ₦{inv.netPayableNgn.toLocaleString()}
                        </td>

                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            isPaid 
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirmed with Dr. K</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              Pending MD Verification
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 text-right space-x-1.5">
                          {!isConfirmed && (
                            <button
                              onClick={() => {
                                confirmPaymentWithDrK(inv.id);
                                haptics.success();
                              }}
                              title="SOP Requirement: Confirm receipt directly with Dr. Kaine Edike"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-[0.96]"
                            >
                              Confirm with Dr. K
                            </button>
                          )}

                          {!isPaid && (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-lg text-[10px] font-bold shadow-2xs active:scale-[0.96]"
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
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fund Retirement & Project Expenditure Reconciliation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
              Per AquaEarth Financial SOP Section 5: All advances granted for field campaigns, soil testing, and bathymetric surveys must be retired within 48 hours of mobilization completion. Unspent balances are refunded back to treasury accounts, backed by physical receipts and miscellaneous justification logs.
            </p>
          </div>

          <div className="apple-glass-card rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5">
            <div className="text-center py-12 space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Active Mobilizations Fully Collated</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
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
