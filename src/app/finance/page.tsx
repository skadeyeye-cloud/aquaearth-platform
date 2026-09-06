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
  ShieldCheck
} from 'lucide-react';
import { InvoiceItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinancePage() {
  const { invoices, projects, clients, createInvoice, markInvoicePaid } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUED' | 'PAID'>('ALL');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Milestone Billing & Tax Tracker
          </h1>
          <p className="text-xs text-slate-500">
            Milestone-based client invoicing, automated Nigerian 7.5% VAT / 5% WHT deductions, and FIRS credit notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewInvoiceOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-[0.96]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Milestone Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Telemetry Cards with Tabular Figures */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Billed Gross</div>
          <div className="text-xl font-extrabold text-slate-900 tnum">₦{(totalBilledNgn / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">{invoices.length} Milestone Invoices</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Cash Collected (Net)</div>
          <div className="text-xl font-extrabold text-emerald-600 tnum">₦{(totalPaidNgn / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">Reconciled bank transfers</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">7.5% VAT Tracked</div>
          <div className="text-xl font-extrabold text-purple-600 tnum">₦{(totalVatTracked / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">Federal Inland Revenue (FIRS)</div>
        </div>

        <div className="apple-glass-card rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">WHT Deductions (5%)</div>
          <div className="text-xl font-extrabold text-amber-600 tnum">₦{(totalWhtDeductions / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-500 font-medium">Credit note reconciliation</div>
        </div>
      </div>

      {/* Segmented Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('ISSUED')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              statusFilter === 'ISSUED' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Awaiting Payment ({invoices.filter(i => i.status === 'ISSUED').length})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1 rounded-lg transition-all active:scale-[0.96] ${
              statusFilter === 'PAID' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Settled & Reconciled ({invoices.filter(i => i.status === 'PAID').length})
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="apple-glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 border-b border-black/[0.05] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-black/[0.04] font-medium">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'PAID';
                return (
                  <tr key={inv.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500">{inv.clientName}</div>
                    </td>

                    <td className="px-5 py-3 text-[11px] text-slate-600 max-w-xs">
                      {inv.milestoneDescription}
                    </td>

                    <td className="px-5 py-3 text-right font-mono font-semibold text-slate-700 tnum">
                      ₦{inv.subtotalNgn.toLocaleString()}
                    </td>

                    <td className="px-5 py-3 text-right font-mono text-purple-700 font-semibold tnum">
                      +₦{inv.vatAmountNgn.toLocaleString()}
                    </td>

                    <td className="px-5 py-3 text-right font-mono text-amber-700 font-semibold tnum">
                      -₦{inv.whtDeductionNgn.toLocaleString()}
                    </td>

                    <td className="px-5 py-3 text-right font-mono font-bold text-xs text-slate-900 tnum">
                      ₦{inv.netPayableNgn.toLocaleString()}
                    </td>

                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
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
                        <span className="text-[10px] text-slate-400 font-mono">Paid {inv.paidDate}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {selectedInvoiceForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoiceForPayment(null)} className="fixed inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Client Payment</h3>
                  <div className="text-[10px] text-slate-400">{selectedInvoiceForPayment.invoiceNumber}</div>
                </div>
                <button onClick={() => setSelectedInvoiceForPayment(null)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-black/[0.05] space-y-1 font-mono text-xs">
                <div className="flex justify-between"><span>Subtotal:</span><b>₦{selectedInvoiceForPayment.subtotalNgn.toLocaleString()}</b></div>
                <div className="flex justify-between text-purple-700"><span>7.5% VAT:</span><b>+₦{selectedInvoiceForPayment.vatAmountNgn.toLocaleString()}</b></div>
                <div className="flex justify-between text-amber-700"><span>5% WHT Deduction:</span><b>-₦{selectedInvoiceForPayment.whtDeductionNgn.toLocaleString()}</b></div>
                <div className="flex justify-between text-slate-900 font-bold border-t pt-1"><span>Net Inflow:</span><b>₦{selectedInvoiceForPayment.netPayableNgn.toLocaleString()}</b></div>
              </div>

              <form onSubmit={handleConfirmPayment} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">FIRS WHT Credit Note Number</label>
                  <input
                    type="text"
                    required
                    value={whtCreditNo}
                    onChange={(e) => setWhtCreditNo(e.target.value)}
                    placeholder="WHT-FIRS-2026-XXXX"
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setSelectedInvoiceForPayment(null)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Confirm Receipt</button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-black/[0.08] p-6 space-y-4 z-10 text-xs">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                <h3 className="text-sm font-bold text-slate-900">Generate Milestone Invoice</h3>
                <button onClick={() => setIsNewInvoiceOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectCode} - {p.title.substring(0, 25)}...</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Milestone Description</label>
                  <input
                    type="text"
                    required
                    value={milestoneDescription}
                    onChange={(e) => setMilestoneDescription(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subtotal Amount (₦)</label>
                    <input
                      type="number"
                      required
                      value={subtotalNgn}
                      onChange={(e) => setSubtotalNgn(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-mono tnum"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">WHT Deduction Rate</label>
                    <select
                      value={whtRatePercent}
                      onChange={(e) => setWhtRatePercent(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-black/[0.08] rounded-xl text-xs font-bold"
                    >
                      <option value={5.0}>5.0% (Standard Technical Advisory)</option>
                      <option value={10.0}>10.0% (Construction / Field Drilling)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border space-y-0.5 text-[10px] font-mono">
                  <div className="flex justify-between"><span>+7.5% VAT:</span><b>₦{((subtotalNgn * 7.5) / 100).toLocaleString()}</b></div>
                  <div className="flex justify-between"><span>-5.0% WHT:</span><b>₦{((subtotalNgn * whtRatePercent) / 100).toLocaleString()}</b></div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.05]">
                  <button type="button" onClick={() => setIsNewInvoiceOpen(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold shadow-xs active:scale-[0.96]">Issue Invoice</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
