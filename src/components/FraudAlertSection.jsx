import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ShieldAlert, Ban, AlertTriangle, ExternalLink, CheckCircle2, FileText, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';

export default function FraudAlertSection({ selectedInvoice, onAction }) {
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);

  // If no invoice selected or no high-risk threat present, don't show static card
  if (!selectedInvoice) {
    return null;
  }

  const invoice = selectedInvoice;

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(9, 6, 17);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFontSize(18);
    doc.text("InvoiceShield AI - Incident Investigation Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Incident Invoice ID: ${invoice.id}`, 14, 55);
    doc.text(`Target Vendor: ${invoice.vendor}`, 14, 63);
    doc.text(`Billing Amount: ${invoice.amountFormatted}`, 14, 71);
    doc.text(`AI Threat Severity Score: ${invoice.riskScore} / 100`, 14, 79);
    doc.text(`Action Taken: ${invoice.status}`, 14, 87);

    doc.text("Cryptographic Forensic Findings:", 14, 102);
    (invoice.flaggedReasons || []).forEach((reason, idx) => {
      doc.text(`• ${reason}`, 20, 112 + (idx * 8));
    });

    doc.save(`Incident_Investigation_${invoice.id}.pdf`);
  };

  return (
    <section className="relative py-8 bg-[#090611] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#180e30] via-[#120b22] to-[#090611] border border-purple-500/40 shadow-2xl shadow-purple-950/60"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>ACTIVE SECURITY THREAT INSPECTOR</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {invoice.status === 'Blocked' ? 'High-Risk Invoice Intercepted' : 'Invoice Compliance Threat Under Review'}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#090611] px-5 py-3 rounded-2xl border border-purple-500/30 self-start sm:self-auto">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase">AI Threat Level</span>
                <span className="text-xs font-bold text-purple-400 font-mono">SEVERITY {invoice.riskScore}/100</span>
              </div>
              <div className="text-3xl font-black font-mono text-purple-400">
                {invoice.riskScore}<span className="text-sm text-slate-500 font-normal">/100</span>
              </div>
            </div>
          </div>

          {/* Invoice Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-4 rounded-xl bg-[#090611]/80 border border-purple-900/40 text-xs font-mono">
            <div>
              <span className="text-slate-500 uppercase block">Invoice ID</span>
              <span className="text-purple-300 font-bold text-sm">{invoice.id}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block">Vendor</span>
              <span className="text-white font-bold text-sm">{invoice.vendor}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block">Amount</span>
              <span className="text-slate-200 font-bold text-sm">{invoice.amountFormatted}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block">Status</span>
              <span className={invoice.status === 'Blocked' ? 'text-red-400 font-bold text-sm' : 'text-amber-400 font-bold text-sm'}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Reasons */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>AI Anomaly Explanation Breakdown</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(invoice.flaggedReasons || []).map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-[#090611]/60 border border-purple-900/30 text-xs text-slate-200"
                >
                  <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-purple-900/40">

            {invoice.status !== 'Safe' && (
              <button
                onClick={() => onAction && onAction('safe', invoice)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Exception</span>
              </button>
            )}

            {invoice.status !== 'Blocked' && (
              <button
                onClick={() => onAction && onAction('block', invoice)}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-950 transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>Enforce Block Hold</span>
              </button>
            )}
          </div>

        </motion.div>

      </div>
    </section>
  );
}
