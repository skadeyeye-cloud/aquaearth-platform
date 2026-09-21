'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  AlertCircle,
  ArrowUpRight,
  Lock,
  Landmark,
  Search,
  Trash2,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  InvoiceItem, 
  BudgetRequest, 
  BudgetApprovalStage, 
  PettyCashCustodian, 
  PettyCashCategory,
  ProjectExpenseItem,
  ClientReceiptItem,
  ProjectFinancialSummary,
  ProjectExpenseCategory
} from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetRequestModal } from '@/components/finance/BudgetRequestModal';
import { CfoVettingModal } from '@/components/finance/CfoVettingModal';
import { CollateBudgetModal } from '@/components/finance/CollateBudgetModal';
import { PettyCashExpenseModal } from '@/components/finance/PettyCashExpenseModal';
import { TopUpPettyCashModal } from '@/components/finance/TopUpPettyCashModal';
import { CreateProjectExpenseModal } from '@/components/finance/CreateProjectExpenseModal';
import { RecordClientReceiptModal } from '@/components/finance/RecordClientReceiptModal';
import { exportToXls, exportToPdf } from '@/lib/export-utils';
import { haptics } from '@/lib/haptics';

function FinancePageContent() {
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
    pettyCashTopUps,
    pettyCashAnalyses,
    generatePettyCashMonthlyAnalysis,
    approvePettyCashReplenishment,
    currentUser,
    projectExpenses,
    clientReceipts,
    deleteProjectExpense,
    getProjectFinancials
  } = useAuth();

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const projectParam = searchParams?.get('projectId') || searchParams?.get('project');

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

  // Project Managers & Line Managers (Superadmins, PM functional role, Admin access tier, Line managers, or assigned Project Managers)
  const isProjectManager = currentUser.functionalRole === 'PROJECT_MANAGER' || currentUser.accessTier === 'ADMIN' || currentUser.managementTier !== 'NONE' || projects.some(p => p.leadPmId === currentUser.id || p.projectManagerId === currentUser.id);
  const isLineManagerOrAdmin = currentUser.accessTier === 'ADMIN' || currentUser.managementTier !== 'NONE' || currentUser.functionalRole === 'PROJECT_MANAGER';
  const canAccessProjectExpenses = canSeeAllFinance || isProjectManager;

  const [activeMainTab, setActiveMainTab] = useState<'BUDGETS' | 'PETTY_CASH' | 'INVOICES' | 'EXPENSES'>(() => {
    if ((tabParam === 'EXPENSES' || projectParam) && canAccessProjectExpenses) return 'EXPENSES';
    if (tabParam === 'PETTY_CASH' && canSeeAllFinance) return 'PETTY_CASH';
    if (tabParam === 'INVOICES' && canSeeAllFinance) return 'INVOICES';
    return 'BUDGETS';
  });
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
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [activeCustodianForTopUp, setActiveCustodianForTopUp] = useState<PettyCashCustodian>('GIFT');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [whtCreditNo, setWhtCreditNo] = useState('WHT-FIRS-2026-');

  // Tab 4: Project Expenses & Client Collections State
  const [isProjectExpenseModalOpen, setIsProjectExpenseModalOpen] = useState(false);
  const [isClientReceiptModalOpen, setIsClientReceiptModalOpen] = useState(false);
  const [selectedProjectIdForModal, setSelectedProjectIdForModal] = useState<string | undefined>(() => projectParam || undefined);
  const [expenseSubTab, setExpenseSubTab] = useState<'EXPENSES' | 'RECEIPTS' | 'PL_MATRIX'>('EXPENSES');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(() => projectParam || 'ALL');
  const [selectedExpenseCategoryFilter, setSelectedExpenseCategoryFilter] = useState<string>('ALL');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState<string>('');

  // New Invoice Form
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [milestoneDescription, setMilestoneDescription] = useState('Milestone 1: Mobilization & Inception');
  const [subtotalNgn, setSubtotalNgn] = useState(25000000);
  const [whtRatePercent, setWhtRatePercent] = useState(5.0);
  const [dueDate, setDueDate] = useState('2026-09-25');

  useEffect(() => {
    if (tabParam === 'EXPENSES' || projectParam) {
      if (canAccessProjectExpenses) {
        setActiveMainTab('EXPENSES');
      } else {
        setActiveMainTab('BUDGETS');
      }
    } else if (tabParam === 'BUDGETS') {
      setActiveMainTab('BUDGETS');
    } else if (tabParam === 'PETTY_CASH' && canSeeAllFinance) {
      setActiveMainTab('PETTY_CASH');
    } else if (tabParam === 'INVOICES' && canSeeAllFinance) {
      setActiveMainTab('INVOICES');
    }

    if (projectParam && canAccessProjectExpenses) {
      setSelectedProjectFilter(projectParam);
      setSelectedProjectIdForModal(projectParam);
    }
  }, [tabParam, projectParam, canSeeAllFinance, canAccessProjectExpenses]);

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
  const totalOutstandingNgn = Math.max(0, totalBilledNgn - totalPaidNgn);

  // Export Handlers
  const handleExportBudgetsXls = () => {
    exportToXls({
      filename: `AquaEarth_Budgets_${new Date().toISOString().substring(0, 7)}`,
      title: 'AQUAEARTH CONSULTING LIMITED — CORPORATE BUDGET SCHEDULE',
      subtitle: 'Departmental & Client Facing Budget Ledger',
      category: 'BUDGET SCHEDULE',
      metadata: {
        'Exported By': currentUser.name,
        'Department': currentUser.departmentName || 'Corporate',
        'Total Requests': String(filteredBudgets.length),
        'Total Value': `₦${totalBudgetRequested.toLocaleString()} NGN`
      },
      summaryMetrics: [
        { label: 'Total Value', value: `₦${totalBudgetRequested.toLocaleString()} NGN` },
        { label: 'Approved Value', value: `₦${approvedBudgetAmount.toLocaleString()} NGN` },
        { label: 'MD Pending', value: mdPendingBudgetCount },
        { label: 'CFO Review', value: cfoReviewCount }
      ],
      columns: [
        { header: 'Request #', key: 'requestNumber' },
        { header: 'Title', key: 'title' },
        { header: 'Department', key: 'department' },
        { header: 'Type', key: 'budgetType', format: (val) => val === 'CLIENT_FACING' ? 'Client Project' : 'Departmental' },
        { header: 'Category', key: 'category', format: (val) => String(val).replace(/_/g, ' ') },
        { header: 'Amount (₦ NGN)', key: 'amountNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Approval Stage', key: 'approvalStage', format: (val) => String(val).replace(/_/g, ' ') },
        { header: 'Status', key: 'status' },
        { header: 'Requested By', key: 'requestedByName' },
        { header: 'Date', key: 'createdAt' }
      ],
      data: filteredBudgets
    });
    haptics.success();
  };

  const handleExportBudgetsPdf = () => {
    exportToPdf({
      filename: `AquaEarth_Budgets_${new Date().toISOString().substring(0, 7)}`,
      title: 'Corporate Budget Schedule & Ledger',
      subtitle: 'AquaEarth Consulting Limited — Formal Vetting & Approval Docket',
      category: 'BUDGET RECORD',
      summaryMetrics: [
        { label: 'Total Value', value: `₦${totalBudgetRequested.toLocaleString()}` },
        { label: 'Approved Value', value: `₦${approvedBudgetAmount.toLocaleString()}` },
        { label: 'MD Pending', value: String(mdPendingBudgetCount), subtext: 'Dr. K Docket' },
        { label: 'CFO Review', value: String(cfoReviewCount), subtext: 'Mrs. Erica' }
      ],
      columns: [
        { header: 'Req #', key: 'requestNumber', width: '90px' },
        { header: 'Title / Purpose', key: 'title' },
        { header: 'Dept', key: 'department' },
        { header: 'Type', key: 'budgetType', format: (val) => val === 'CLIENT_FACING' ? 'Client' : 'Dept' },
        { header: 'Amount (₦)', key: 'amountNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Stage', key: 'approvalStage', format: (val) => String(val).replace(/_/g, ' ') },
        { header: 'Status', key: 'status' },
        { header: 'By', key: 'requestedByName' }
      ],
      data: filteredBudgets,
      signatories: [
        { role: 'COMPILED BY', name: currentUser.name, title: `${currentUser.functionalRole} (Finance)` },
        { role: 'VETTED BY', name: 'Mrs. Erica Okonkwo', title: 'Chief Financial Officer (CFO)' },
        { role: 'FINAL APPROVAL', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportPettyCashXls = () => {
    exportToXls({
      filename: `AquaEarth_Petty_Cash_Ledger_${new Date().toISOString().substring(0, 7)}`,
      title: 'AQUAEARTH CONSULTING LIMITED — IMPREST EXPENSE LEDGER',
      subtitle: 'Official SOP Section 4 Custodian Imprest Voucher Audit',
      category: 'PETTY CASH LEDGER',
      metadata: {
        'Exported By': currentUser.name,
        'Role': currentUser.functionalRole,
        'Total Vouchers': String(pettyCashTransactions.length),
        'Total Spent': `₦${totalPettyCashSpent.toLocaleString()} NGN`
      },
      summaryMetrics: [
        { label: 'Total Imprest Expenditure', value: `₦${totalPettyCashSpent.toLocaleString()} NGN` },
        { label: "Gift's Balance", value: `₦${giftFund.currentBalanceNgn.toLocaleString()} NGN` },
        { label: "Marvelous's Balance", value: `₦${marvelousFund.currentBalanceNgn.toLocaleString()} NGN` },
        { label: 'Total Vouchers', value: pettyCashTransactions.length }
      ],
      columns: [
        { header: 'Date', key: 'date', width: '100px' },
        { header: 'Fund Custodian', key: 'fundCustodian', format: (val) => `${val}'s Fund` },
        { header: 'Expense Category', key: 'category', format: (val) => String(val).replace(/_/g, ' ') },
        { header: 'Description / Purpose', key: 'description' },
        { header: 'Amount (₦ NGN)', key: 'amountNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Receipt Reference', key: 'receiptUrl', format: (val) => val || 'Voucher on file' },
        { header: 'Approved By', key: 'approvedByName' }
      ],
      data: pettyCashTransactions
    });
    haptics.success();
  };

  const handleExportPettyCashPdf = () => {
    exportToPdf({
      filename: `AquaEarth_Petty_Cash_Ledger_${new Date().toISOString().substring(0, 7)}`,
      title: 'Imprest Petty Cash Expenditure Ledger',
      subtitle: 'AquaEarth Consulting Limited — Official Custodian Voucher Log (SOP Section 4)',
      category: 'PETTY CASH AUDIT',
      summaryMetrics: [
        { label: 'Total Disbursed', value: `₦${totalPettyCashSpent.toLocaleString()}`, subtext: 'Both Funds' },
        { label: "Gift's Fund Available", value: `₦${giftFund.currentBalanceNgn.toLocaleString()}`, subtext: 'HQ & Collation' },
        { label: "Marvelous's Fund Available", value: `₦${marvelousFund.currentBalanceNgn.toLocaleString()}`, subtext: 'Field Logistics' },
        { label: 'Total Vouchers Filed', value: String(pettyCashTransactions.length), subtext: 'Verified Receipts' }
      ],
      columns: [
        { header: 'Date', key: 'date', width: '90px' },
        { header: 'Custodian', key: 'fundCustodian', format: (val) => `${val}` },
        { header: 'Category', key: 'category', format: (val) => String(val).replace(/_/g, ' ') },
        { header: 'Description / Purpose', key: 'description' },
        { header: 'Amount (₦)', key: 'amountNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Receipt Link', key: 'receiptUrl', format: (val) => val || 'On File' },
        { header: 'Sign-off', key: 'approvedByName' }
      ],
      data: pettyCashTransactions,
      signatories: [
        { role: 'PREPARED BY', name: currentUser.name, title: `${currentUser.functionalRole} (Custodian)` },
        { role: 'REVIEWED BY', name: 'Mrs. Erica Okonkwo', title: 'Chief Financial Officer (CFO)' },
        { role: 'APPROVED BY', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportAnalysisXls = () => {
    exportToXls({
      filename: `AquaEarth_Petty_Cash_Analysis_${new Date().toISOString().substring(0, 7)}`,
      title: 'AQUAEARTH CONSULTING LIMITED — MONTHLY PETTY CASH RECONCILIATION',
      subtitle: 'SOP Section 4 Monthly Imprest Analysis & Replenishment Request',
      category: 'PETTY CASH AUDIT',
      summaryMetrics: [
        { label: 'Total Disbursed', value: `₦${totalPettyCashSpent.toLocaleString()} NGN` },
        { label: "Gift's Closing Balance", value: `₦${giftFund.currentBalanceNgn.toLocaleString()} NGN` },
        { label: "Marvelous's Closing Balance", value: `₦${marvelousFund.currentBalanceNgn.toLocaleString()} NGN` }
      ],
      columns: [
        { header: 'Month / Cycle', key: 'monthYear' },
        { header: 'Compiled By', key: 'analyzedByName' },
        { header: "Gift Opening (₦)", key: 'giftOpeningBalanceNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: "Gift Spent (₦)", key: 'giftDisbursedNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: "Gift Closing (₦)", key: 'giftClosingBalanceNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: "Marvelous Opening (₦)", key: 'marvelousOpeningBalanceNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: "Marvelous Spent (₦)", key: 'marvelousDisbursedNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: "Marvelous Closing (₦)", key: 'marvelousClosingBalanceNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: "Total Disbursed (₦)", key: 'totalDisbursedNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: 'Status', key: 'status', format: (v) => String(v).replace(/_/g, ' ') }
      ],
      data: pettyCashAnalyses
    });
    haptics.success();
  };

  const handleExportAnalysisPdf = () => {
    exportToPdf({
      filename: `AquaEarth_Petty_Cash_Analysis_${new Date().toISOString().substring(0, 7)}`,
      title: 'Monthly Petty Cash Reconciliation & Replenishment Analysis',
      subtitle: 'AquaEarth Consulting Limited — Official SOP Section 4 Imprest Audit Docket',
      category: 'IMPREST AUDIT',
      summaryMetrics: [
        { label: 'Total Disbursed This Cycle', value: `₦${totalPettyCashSpent.toLocaleString()}`, subtext: 'Gift + Marvelous' },
        { label: "Gift's Closing Fund", value: `₦${giftFund.currentBalanceNgn.toLocaleString()}`, subtext: 'HQ & Collation' },
        { label: "Marvelous's Closing Fund", value: `₦${marvelousFund.currentBalanceNgn.toLocaleString()}`, subtext: 'Field Logistics' },
        { label: 'Replenishment Requested', value: `₦${totalPettyCashSpent.toLocaleString()}`, subtext: 'MD Approval Required' }
      ],
      columns: [
        { header: 'Cycle', key: 'monthYear', width: '90px' },
        { header: 'Analyst', key: 'analyzedByName' },
        { header: 'Gift Spent', key: 'giftDisbursedNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: 'Gift Balance', key: 'giftClosingBalanceNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: 'Marvelous Spent', key: 'marvelousDisbursedNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: 'Marvelous Balance', key: 'marvelousClosingBalanceNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: 'Total Spent', key: 'totalDisbursedNgn', align: 'right', format: (v) => `₦${Number(v).toLocaleString()}` },
        { header: 'Status', key: 'status', format: (v) => String(v).replace(/_/g, ' ') }
      ],
      data: pettyCashAnalyses,
      signatories: [
        { role: 'PRIMARY ANALYST (SOP)', name: 'Gift', title: 'Finance & Collation Officer' },
        { role: 'VERIFIED BY', name: 'Mrs. Erica Okonkwo', title: 'Chief Financial Officer (CFO)' },
        { role: 'REPLENISHMENT APPROVAL', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

  const handleExportInvoicesXls = () => {
    exportToXls({
      filename: `AquaEarth_Invoices_${new Date().toISOString().substring(0, 7)}`,
      title: 'AQUAEARTH CONSULTING LIMITED — ACCOUNTS RECEIVABLE & MILESTONES',
      subtitle: 'Client Milestone Invoices & Tax Deduction Reconciliation (VAT & WHT)',
      category: 'INVOICES LEDGER',
      metadata: {
        'Exported By': currentUser.name,
        'Role': currentUser.functionalRole,
        'Total Billed': `₦${totalBilledNgn.toLocaleString()} NGN`,
        'Total Settled': `₦${totalPaidNgn.toLocaleString()} NGN`
      },
      summaryMetrics: [
        { label: 'Gross Invoiced', value: `₦${(totalBilledNgn / 1000000).toFixed(2)}M` },
        { label: 'Collected', value: `₦${(totalPaidNgn / 1000000).toFixed(2)}M` },
        { label: 'Outstanding A/R', value: `₦${(totalOutstandingNgn / 1000000).toFixed(2)}M` },
        { label: 'VAT Tracked (7.5%)', value: `₦${(totalVatTracked / 1000000).toFixed(2)}M` }
      ],
      columns: [
        { header: 'Invoice #', key: 'invoiceNumber' },
        { header: 'Client', key: 'clientName' },
        { header: 'Milestone Description', key: 'milestoneDescription' },
        { header: 'Subtotal (₦)', key: 'subtotalNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'VAT 7.5% (₦)', key: 'vatAmountNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'WHT 5.0% (₦)', key: 'whtDeductionNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Net Payable (₦)', key: 'netPayableNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Status', key: 'status' },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Dr. K Confirmed', key: 'confirmedWithDrK', format: (val) => val ? 'Yes' : 'Pending' }
      ],
      data: filteredInvoices
    });
    haptics.success();
  };

  const handleExportInvoicesPdf = () => {
    exportToPdf({
      filename: `AquaEarth_Invoices_${new Date().toISOString().substring(0, 7)}`,
      title: 'Milestone Invoices & Accounts Receivable Docket',
      subtitle: 'AquaEarth Consulting Limited — Client Milestone Invoicing, FIRS 7.5% VAT & 5% WHT Ledger',
      category: 'ACCOUNTS RECEIVABLE',
      summaryMetrics: [
        { label: 'Gross Invoiced', value: `₦${(totalBilledNgn / 1000000).toFixed(2)}M`, subtext: 'All Milestones' },
        { label: 'Cash Collected', value: `₦${(totalPaidNgn / 1000000).toFixed(2)}M`, subtext: 'Bank Cleared' },
        { label: 'Receivables Outstanding', value: `₦${(totalOutstandingNgn / 1000000).toFixed(2)}M`, subtext: 'Unpaid Invoices' },
        { label: 'FIRS VAT Tracked', value: `₦${(totalVatTracked / 1000000).toFixed(2)}M`, subtext: '7.5% Output VAT' }
      ],
      columns: [
        { header: 'Inv #', key: 'invoiceNumber', width: '90px' },
        { header: 'Client', key: 'clientName' },
        { header: 'Milestone Purpose', key: 'milestoneDescription' },
        { header: 'Subtotal (₦)', key: 'subtotalNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'VAT (₦)', key: 'vatAmountNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'WHT (₦)', key: 'whtDeductionNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Net (₦)', key: 'netPayableNgn', align: 'right', format: (val) => `₦${Number(val).toLocaleString()}` },
        { header: 'Status', key: 'status' },
        { header: 'Dr. K Clearance', key: 'confirmedWithDrK', format: (val) => val ? 'Confirmed' : 'Pending' }
      ],
      data: filteredInvoices,
      signatories: [
        { role: 'PREPARED BY (SOP)', name: 'Marvelous', title: 'Invoicing & Logistics Officer' },
        { role: 'REVIEWED BY', name: 'Mrs. Erica Okonkwo', title: 'Chief Financial Officer (CFO)' },
        { role: 'APPROVED BY', name: 'Dr. Kaine Edike', title: 'Managing Consultant (MD / FNEC)' }
      ]
    });
    haptics.success();
  };

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

  // Tab 4 Computed Telemetry
  const allProjectSummaries: ProjectFinancialSummary[] = projects.map(p => getProjectFinancials(p.id));
  const totalClientReceiptsNgn = clientReceipts.reduce((sum, r) => sum + r.amountNgn, 0);
  const totalProjectExpensesNgn = projectExpenses.reduce((sum, e) => sum + e.amountNgn, 0);
  const netCashMarginNgn = totalClientReceiptsNgn - totalProjectExpensesNgn;
  const portfolioMarginPercent = totalClientReceiptsNgn > 0 ? (netCashMarginNgn / totalClientReceiptsNgn) * 100 : 0;
  const portfolioBurnPercent = totalClientReceiptsNgn > 0 ? (totalProjectExpensesNgn / totalClientReceiptsNgn) * 100 : 0;

  // Filtered expenses
  const filteredProjectExpenses = projectExpenses.filter(e => {
    if (selectedProjectFilter !== 'ALL' && e.projectId !== selectedProjectFilter) return false;
    if (selectedExpenseCategoryFilter !== 'ALL' && e.category !== selectedExpenseCategoryFilter) return false;
    if (expenseSearchQuery.trim()) {
      const q = expenseSearchQuery.toLowerCase();
      const match = e.title.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.expenseNumber.toLowerCase().includes(q) ||
        e.projectName.toLowerCase().includes(q) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered receipts
  const filteredClientReceipts = clientReceipts.filter(r => {
    if (selectedProjectFilter !== 'ALL' && r.projectId !== selectedProjectFilter) return false;
    if (expenseSearchQuery.trim()) {
      const q = expenseSearchQuery.toLowerCase();
      const match = r.receiptNumber.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.paymentReference.toLowerCase().includes(q) ||
        r.milestoneDescription.toLowerCase().includes(q) ||
        r.bankAccount.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered P&L summaries
  const filteredProjectSummaries = allProjectSummaries.filter(s => {
    if (selectedProjectFilter !== 'ALL' && s.projectId !== selectedProjectFilter) return false;
    if (expenseSearchQuery.trim()) {
      const q = expenseSearchQuery.toLowerCase();
      const match = s.projectName.toLowerCase().includes(q) || s.clientName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportExpenses = (format: 'pdf' | 'xls') => {
    const filename = `AquaEarth_Project_Expenses_${new Date().toISOString().split('T')[0]}`;
    const columns = [
      { header: 'Expense #', key: 'expenseNumber' },
      { header: 'Date', key: 'date' },
      { header: 'Project', key: 'projectName' },
      { header: 'Category', key: 'category' },
      { header: 'Description', key: 'title' },
      { header: 'Vendor', key: 'vendor' },
      { header: 'Amount (NGN)', key: 'amountNgn', format: (v: number) => `₦${v.toLocaleString()}` },
      { header: 'Payment Method', key: 'paymentMethod' },
      { header: 'Status', key: 'status' },
      { header: 'Ref/Receipt', key: 'receiptNumber' }
    ];
    const exportData = {
      filename,
      title: 'Project Direct Expense Ledger',
      subtitle: 'Certified Direct Cost Ledger per Project',
      category: 'PROJECT_ACCOUNTING',
      columns,
      data: filteredProjectExpenses,
      summaryMetrics: [
        { label: 'Total Incurred Expenses', value: `₦${filteredProjectExpenses.reduce((s, e) => s + e.amountNgn, 0).toLocaleString()}` },
        { label: 'Total Expense Items', value: filteredProjectExpenses.length }
      ]
    };
    if (format === 'xls') exportToXls(exportData);
    else exportToPdf(exportData);
    haptics.success();
  };

  const handleExportReceipts = (format: 'pdf' | 'xls') => {
    const filename = `AquaEarth_Client_Receipts_${new Date().toISOString().split('T')[0]}`;
    const columns = [
      { header: 'Receipt #', key: 'receiptNumber' },
      { header: 'Payment Date', key: 'paymentDate' },
      { header: 'Project', key: 'projectName' },
      { header: 'Client', key: 'clientName' },
      { header: 'Milestone / Purpose', key: 'milestoneDescription' },
      { header: 'Amount Received (NGN)', key: 'amountNgn', format: (v: number) => `₦${v.toLocaleString()}` },
      { header: 'WHT Deducted (NGN)', key: 'whtDeductedNgn', format: (v: number) => `₦${(v || 0).toLocaleString()}` },
      { header: 'Wire Reference', key: 'paymentReference' },
      { header: 'Receiving Bank Account', key: 'bankAccount' },
      { header: 'Recorded By', key: 'recordedByName' }
    ];
    const exportData = {
      filename,
      title: 'Client Payment Receipts Ledger',
      subtitle: 'Corporate Treasury Wire Collections by Project',
      category: 'CLIENT_COLLECTIONS',
      columns,
      data: filteredClientReceipts,
      summaryMetrics: [
        { label: 'Total Cash Collected', value: `₦${filteredClientReceipts.reduce((s, r) => s + r.amountNgn, 0).toLocaleString()}` },
        { label: 'Total Receipt Items', value: filteredClientReceipts.length }
      ]
    };
    if (format === 'xls') exportToXls(exportData);
    else exportToPdf(exportData);
    haptics.success();
  };

  const handleExportPlMatrix = (format: 'pdf' | 'xls') => {
    const filename = `AquaEarth_Project_PL_Matrix_${new Date().toISOString().split('T')[0]}`;
    const columns = [
      { header: 'Project Code', key: 'projectId' },
      { header: 'Project Name', key: 'projectName' },
      { header: 'Client Name', key: 'clientName' },
      { header: 'Contract Value (NGN)', key: 'contractValueNgn', format: (v: number) => `₦${v.toLocaleString()}` },
      { header: 'Amount Received (NGN)', key: 'totalReceivedNgn', format: (v: number) => `₦${v.toLocaleString()}` },
      { header: 'Collection %', key: 'collectionPercent', format: (v: number) => `${v}%` },
      { header: 'Direct Expenses (NGN)', key: 'totalExpensesNgn', format: (v: number) => `₦${v.toLocaleString()}` },
      { header: 'Burn Rate %', key: 'burnRatePercent', format: (v: number) => `${v}%` },
      { header: 'Net Cash Margin (NGN)', key: 'netMarginNgn', format: (v: number) => `₦${v.toLocaleString()}` },
      { header: 'Margin %', key: 'marginPercent', format: (v: number) => `${v}%` }
    ];
    const exportData = {
      filename,
      title: 'Project Profit & Loss Telemetry Matrix',
      subtitle: 'Direct Profitability, Collections & Cost Burn per Project',
      category: 'FINANCIAL_GOVERNANCE',
      columns,
      data: filteredProjectSummaries,
      summaryMetrics: [
        { label: 'Total Client Receipts', value: `₦${totalClientReceiptsNgn.toLocaleString()}` },
        { label: 'Total Incurred Expenses', value: `₦${totalProjectExpensesNgn.toLocaleString()}` },
        { label: 'Portfolio Net Margin', value: `₦${netCashMarginNgn.toLocaleString()} (${portfolioMarginPercent.toFixed(1)}%)` }
      ]
    };
    if (format === 'xls') exportToXls(exportData);
    else exportToPdf(exportData);
    haptics.success();
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

          {canAccessProjectExpenses && activeMainTab === 'EXPENSES' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedProjectIdForModal(selectedProjectFilter !== 'ALL' ? selectedProjectFilter : undefined);
                  setIsProjectExpenseModalOpen(true);
                  haptics.selection();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Project Expense</span>
              </button>
              <button
                onClick={() => {
                  setSelectedProjectIdForModal(selectedProjectFilter !== 'ALL' ? selectedProjectFilter : undefined);
                  setIsClientReceiptModalOpen(true);
                  haptics.selection();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Client Receipt</span>
              </button>
            </div>
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
            <span>4. Project Expenses & Collections</span>
          </button>
        </div>
      ) : isProjectManager ? (
        <div className="flex items-center justify-between p-1.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setActiveMainTab('BUDGETS'); haptics.selection(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeMainTab === 'BUDGETS'
                  ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                  : 'text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>1. My Budget Requests</span>
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
              <span>2. Project Expenses & Collections</span>
            </button>
          </div>
          <span className="px-2.5 py-1 mr-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 whitespace-nowrap">
            Project Manager Scoped
          </span>
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
            Employee Scoped
          </span>
        </div>
      )}

      {/* TAB 1: BUDGET APPROVAL WORKFLOW */}
      {(activeMainTab === 'BUDGETS' || (!canAccessProjectExpenses && !canSeeAllFinance)) && (
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
            <div className="p-4 sm:p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Departmental & Client Budget Ledger ({filteredBudgets.length} Requests)
                </h3>
                <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">Formal vetting, CFO endorsement & MD sign-off schedule</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBudgetsPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportBudgetsXls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>XLS</span>
                </button>
              </div>
            </div>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveCustodianForTopUp('GIFT');
                      setIsTopUpOpen(true);
                      haptics.selection();
                    }}
                    disabled={isMarvelous && !isSuperadmin && !isErica}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Top Up Fund</span>
                  </button>

                  {isMarvelous && !isSuperadmin && !isErica ? (
                    <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] italic flex items-center gap-1 px-2.5 py-1 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl font-medium">
                      <Lock className="w-3 h-3 text-[#86868B]" /> Restricted to Gift
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveCustodianForExpense('GIFT');
                        setIsPettyExpenseOpen(true);
                        haptics.selection();
                      }}
                      className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-medium shadow-xs active:scale-[0.97] transition-all cursor-pointer"
                    >
                      Log Voucher (Gift)
                    </button>
                  )}
                </div>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveCustodianForTopUp('MARVELOUS');
                      setIsTopUpOpen(true);
                      haptics.selection();
                    }}
                    disabled={isGift && !isSuperadmin && !isErica}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Top Up Fund</span>
                  </button>

                  {isGift && !isSuperadmin && !isErica ? (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 italic flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 rounded-xl font-medium">
                      <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Restricted to Marvelous
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveCustodianForExpense('MARVELOUS');
                        setIsPettyExpenseOpen(true);
                        haptics.selection();
                      }}
                      className="px-3 py-1.5 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-medium shadow-xs active:scale-[0.97] transition-all cursor-pointer"
                    >
                      Log Voucher (Marvelous)
                    </button>
                  )}
                </div>
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

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleExportAnalysisPdf}
                className="px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1D1D1F] dark:text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportAnalysisXls}
                className="px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1D1D1F] dark:text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>XLS</span>
              </button>

              <button
                onClick={() => {
                  const currentMonth = new Date().toISOString().substring(0, 7);
                  generatePettyCashMonthlyAnalysis(currentMonth);
                  haptics.success();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all cursor-pointer"
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
                  className="px-3.5 py-2 bg-[#1D1D1F] hover:bg-[#333336] dark:bg-white dark:hover:bg-[#E5E5E7] text-white dark:text-[#1D1D1F] rounded-xl text-xs font-semibold shadow-xs active:scale-[0.97] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Approve ₦600k Replenishment</span>
                </button>
              )}
            </div>
          </div>

          {/* Imprest Transaction Vouchers Table */}
          <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Imprest Expense Ledger ({pettyCashTransactions.length} Vouchers)
                </h3>
                <span className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] font-medium tnum">Total Spent This Month: ₦{totalPettyCashSpent.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPettyCashPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportPettyCashXls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>XLS</span>
                </button>
              </div>
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
            <div className="p-4 sm:p-5 border-b border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Accounts Receivable & Milestone Invoices ({filteredInvoices.length} Invoices)
                </h3>
                <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] mt-0.5">Client milestone billing, 7.5% VAT and 5% WHT deductions ledger</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportInvoicesPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportInvoicesXls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>XLS</span>
                </button>
              </div>
            </div>
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

      {/* TAB 4: PROJECT EXPENSES & CLIENT COLLECTIONS GOVERNANCE */}
      {canAccessProjectExpenses && activeMainTab === 'EXPENSES' && (
        <div className="space-y-6">
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Client Receipts */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868B] dark:text-[#A1A1A6] uppercase tracking-wider">
                  Client Collections (Received)
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  ₦{(totalClientReceiptsNgn / 1000000).toFixed(2)}M
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{clientReceipts.length} cleared wire receipts</span>
                </p>
              </div>
            </div>

            {/* Card 2: Total Project Expenses */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868B] dark:text-[#A1A1A6] uppercase tracking-wider">
                  Direct Project Expenses
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  ₦{(totalProjectExpensesNgn / 1000000).toFixed(2)}M
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                  <Activity className="w-3 h-3" />
                  <span>{projectExpenses.length} itemized direct cost lines</span>
                </p>
              </div>
            </div>

            {/* Card 3: Net Cash Operating Margin */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868B] dark:text-[#A1A1A6] uppercase tracking-wider">
                  Net Cash Margin
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold tracking-tight ${netCashMarginNgn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {netCashMarginNgn >= 0 ? '+' : ''}₦{(netCashMarginNgn / 1000000).toFixed(2)}M
                </div>
                <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] font-medium mt-0.5">
                  {portfolioMarginPercent.toFixed(1)}% operating cash margin
                </p>
              </div>
            </div>

            {/* Card 4: Expense-to-Receipts Burn Rate */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868B] dark:text-[#A1A1A6] uppercase tracking-wider">
                  Cost Burn Rate
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  {portfolioBurnPercent.toFixed(1)}%
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  Direct costs vs cash collections
                </p>
              </div>
            </div>
          </div>

          {/* Sub-navigation & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            {/* View Pills */}
            <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-2xl overflow-x-auto">
              <button
                onClick={() => { setExpenseSubTab('EXPENSES'); haptics.selection(); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  expenseSubTab === 'EXPENSES'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                <span>Project Direct Expenses</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono">
                  {filteredProjectExpenses.length}
                </span>
              </button>

              <button
                onClick={() => { setExpenseSubTab('RECEIPTS'); haptics.selection(); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  expenseSubTab === 'RECEIPTS'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                <span>Client Wire Receipts</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono">
                  {filteredClientReceipts.length}
                </span>
              </button>

              <button
                onClick={() => { setExpenseSubTab('PL_MATRIX'); haptics.selection(); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  expenseSubTab === 'PL_MATRIX'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Project P&L Matrix</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono">
                  {filteredProjectSummaries.length}
                </span>
              </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Project Filter */}
              <select
                value={selectedProjectFilter}
                onChange={e => setSelectedProjectFilter(e.target.value)}
                className="px-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL" className="bg-white dark:bg-[#1C1C1E]">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#1C1C1E]">
                    {p.projectCode} • {p.title.slice(0, 30)}...
                  </option>
                ))}
              </select>

              {/* Category Filter (only on expenses) */}
              {expenseSubTab === 'EXPENSES' && (
                <select
                  value={selectedExpenseCategoryFilter}
                  onChange={e => setSelectedExpenseCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
                >
                  <option value="ALL" className="bg-white dark:bg-[#1C1C1E]">All Categories</option>
                  <option value="EQUIPMENT_RENTAL" className="bg-white dark:bg-[#1C1C1E]">Equipment & Vessel Rental</option>
                  <option value="FIELD_OPERATIONS" className="bg-white dark:bg-[#1C1C1E]">Field Operations & Muster</option>
                  <option value="LAB_TESTING" className="bg-white dark:bg-[#1C1C1E]">Laboratory Testing</option>
                  <option value="LOGISTICS_TRAVEL" className="bg-white dark:bg-[#1C1C1E]">Logistics & Marine Transit</option>
                  <option value="REGULATORY_PERMITS" className="bg-white dark:bg-[#1C1C1E]">Regulatory & Port Permits</option>
                  <option value="SUBCONTRACTOR" className="bg-white dark:bg-[#1C1C1E]">Subcontractor Services</option>
                  <option value="MATERIALS_CONSUMABLES" className="bg-white dark:bg-[#1C1C1E]">Materials & Consumables</option>
                </select>
              )}

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-[#86868B]" />
                <input
                  type="text"
                  value={expenseSearchQuery}
                  onChange={e => setExpenseSearchQuery(e.target.value)}
                  placeholder="Search ledger..."
                  className="pl-8 pr-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs text-[#1D1D1F] dark:text-[#F6F4F0] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
                />
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-2">
                <button
                  onClick={() => {
                    if (expenseSubTab === 'EXPENSES') handleExportExpenses('pdf');
                    else if (expenseSubTab === 'RECEIPTS') handleExportReceipts('pdf');
                    else handleExportPlMatrix('pdf');
                  }}
                  title="Export PDF"
                  className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 text-[#1D1D1F] dark:text-[#F6F4F0] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => {
                    if (expenseSubTab === 'EXPENSES') handleExportExpenses('xls');
                    else if (expenseSubTab === 'RECEIPTS') handleExportReceipts('xls');
                    else handleExportPlMatrix('xls');
                  }}
                  title="Export Excel (XLS)"
                  className="px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 text-[#1D1D1F] dark:text-[#F6F4F0] flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>XLS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-view 1: Direct Project Expenses Ledger */}
          {expenseSubTab === 'EXPENSES' && (
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[#86868B] dark:text-[#A1A1A6] font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Expense # & Date</th>
                      <th className="py-3 px-4">Project & Client</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Item & Technical Scope</th>
                      <th className="py-3 px-4">Vendor / Payee</th>
                      <th className="py-3 px-4 text-right">Amount (NGN)</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {filteredProjectExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#86868B]">
                          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                          <p className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F6F4F0]">No Direct Project Expenses Found</p>
                          <p className="text-xs text-[#86868B] mt-1">Log equipment hire, vessel charters, or lab analysis to track costs.</p>
                          <button
                            onClick={() => {
                              setSelectedProjectIdForModal(selectedProjectFilter !== 'ALL' ? selectedProjectFilter : undefined);
                              setIsProjectExpenseModalOpen(true);
                            }}
                            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            + Log First Project Expense
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredProjectExpenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">{exp.expenseNumber}</div>
                            <div className="text-[10px] text-[#86868B]">{exp.date}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{exp.projectName}</div>
                            <div className="text-[10px] text-[#86868B] truncate">Logged by: {exp.recordedByName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 whitespace-nowrap">
                              {exp.category.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{exp.title}</div>
                            {exp.description && (
                              <div className="text-[10px] text-[#86868B] truncate">{exp.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0]">{exp.vendor}</div>
                            {exp.receiptNumber && (
                              <div className="text-[10px] font-mono text-[#86868B]">Ref: {exp.receiptNumber}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#1D1D1F] dark:text-[#F6F4F0]">
                            ₦{exp.amountNgn.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-[#86868B]">
                            {exp.paymentMethod.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exp.status === 'PAID' 
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                            }`}>
                              {exp.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`Delete project expense line "${exp.title}" (₦${exp.amountNgn.toLocaleString()})?`)) {
                                  deleteProjectExpense(exp.id);
                                  haptics.impact();
                                }
                              }}
                              title="Delete Expense"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-view 2: Client Wire Receipts Ledger */}
          {expenseSubTab === 'RECEIPTS' && (
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[#86868B] dark:text-[#A1A1A6] font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Receipt # & Date</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Client Organization</th>
                      <th className="py-3 px-4">Milestone / Purpose</th>
                      <th className="py-3 px-4 text-right">Amount Received (NGN)</th>
                      <th className="py-3 px-4 text-right">WHT Deducted (NGN)</th>
                      <th className="py-3 px-4">Wire Reference</th>
                      <th className="py-3 px-4">Receiving Bank Account</th>
                      <th className="py-3 px-4">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {filteredClientReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#86868B]">
                          <Landmark className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                          <p className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F6F4F0]">No Client Payment Receipts Found</p>
                          <p className="text-xs text-[#86868B] mt-1">Record mobilization advances or milestone payments received from clients.</p>
                          <button
                            onClick={() => {
                              setSelectedProjectIdForModal(selectedProjectFilter !== 'ALL' ? selectedProjectFilter : undefined);
                              setIsClientReceiptModalOpen(true);
                            }}
                            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            + Record First Client Payment
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredClientReceipts.map(rec => (
                        <tr key={rec.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">{rec.receiptNumber}</div>
                            <div className="text-[10px] text-[#86868B]">{rec.paymentDate}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{rec.projectName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0]">{rec.clientName}</div>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="font-medium text-[#1D1D1F] dark:text-[#F6F4F0] truncate">{rec.milestoneDescription}</div>
                            {rec.notes && <div className="text-[10px] text-[#86868B] truncate">{rec.notes}</div>}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₦{rec.amountNgn.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                            ₦{(rec.whtDeductedNgn || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#86868B]">
                            {rec.paymentReference}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-[#86868B] max-w-xs truncate">
                            {rec.bankAccount}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-[#86868B]">
                            {rec.recordedByName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-view 3: Project P&L Performance Matrix */}
          {expenseSubTab === 'PL_MATRIX' && (
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[#86868B] dark:text-[#A1A1A6] font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Project & Client</th>
                      <th className="py-3 px-4 text-right">Contract Value</th>
                      <th className="py-3 px-4 text-right">Invoiced</th>
                      <th className="py-3 px-4 text-right">Cash Received</th>
                      <th className="py-3 px-4">Collection %</th>
                      <th className="py-3 px-4 text-right">Direct Expenses</th>
                      <th className="py-3 px-4">Cost Burn %</th>
                      <th className="py-3 px-4 text-right">Net Cash Margin</th>
                      <th className="py-3 px-4 text-center">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {filteredProjectSummaries.map(summary => {
                      const proj = projects.find(p => p.id === summary.projectId);
                      return (
                        <tr key={summary.projectId} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-[#1D1D1F] dark:text-[#F6F4F0] truncate">
                              {proj?.projectCode} • {summary.projectName}
                            </div>
                            <div className="text-[10px] text-[#86868B]">{summary.clientName}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-[#1D1D1F] dark:text-[#F6F4F0]">
                            ₦{(summary.contractValueNgn / 1000000).toFixed(2)}M
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#86868B]">
                            ₦{(summary.totalInvoicedNgn / 1000000).toFixed(2)}M
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₦{(summary.totalReceivedNgn / 1000000).toFixed(2)}M
                          </td>
                          <td className="py-3 px-4 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${Math.min(100, summary.collectionPercent)}%` }} 
                                />
                              </div>
                              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                {summary.collectionPercent}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                            ₦{(summary.totalExpensesNgn / 1000000).toFixed(2)}M
                          </td>
                          <td className="py-3 px-4 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500 rounded-full" 
                                  style={{ width: `${Math.min(100, summary.burnRatePercent)}%` }} 
                                />
                              </div>
                              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                {summary.burnRatePercent}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className={`font-mono font-bold ${summary.netMarginNgn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {summary.netMarginNgn >= 0 ? '+' : ''}₦{(summary.netMarginNgn / 1000000).toFixed(2)}M
                            </div>
                            <div className="text-[10px] text-[#86868B] font-mono">
                              {summary.marginPercent}% margin
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedProjectIdForModal(summary.projectId);
                                  setIsProjectExpenseModalOpen(true);
                                  haptics.selection();
                                }}
                                title="Log expense for this project"
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                + Expense
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProjectIdForModal(summary.projectId);
                                  setIsClientReceiptModalOpen(true);
                                  haptics.selection();
                                }}
                                title="Record client payment receipt"
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                + Receipt
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESTRICTED ACCESS NOTICE FOR UNAUTHORIZED USERS */}
      {!canAccessProjectExpenses && activeMainTab === 'EXPENSES' && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white">Access Restricted</h3>
          <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] max-w-md mx-auto">
            Project financial governance, direct project expense tracking, and client wire collections are restricted to Superadmins and Project Managers.
          </p>
          <div className="pt-2">
            <button
              onClick={() => { setActiveMainTab('BUDGETS'); haptics.selection(); }}
              className="px-4 py-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Return to Budget Status
            </button>
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

      <TopUpPettyCashModal
        isOpen={isTopUpOpen}
        defaultCustodian={activeCustodianForTopUp}
        onClose={() => setIsTopUpOpen(false)}
      />

      <CreateProjectExpenseModal
        isOpen={isProjectExpenseModalOpen}
        defaultProjectId={selectedProjectIdForModal}
        onClose={() => {
          setIsProjectExpenseModalOpen(false);
          setSelectedProjectIdForModal(undefined);
        }}
      />

      <RecordClientReceiptModal
        isOpen={isClientReceiptModalOpen}
        defaultProjectId={selectedProjectIdForModal}
        onClose={() => {
          setIsClientReceiptModalOpen(false);
          setSelectedProjectIdForModal(undefined);
        }}
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

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin" />
        </div>
      }
    >
      <FinancePageContent />
    </Suspense>
  );
}

