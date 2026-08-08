import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, FileText, CheckCircle2, Ban, Download, Building2, Trash2, ClipboardCheck, Clock, ShieldCheck, Tag, Check, AlertOctagon } from 'lucide-react';
import jsPDF from 'jspdf';

export default function InvoiceInspectionDrawer({ invoice, isOpen, onClose, onUpdateStatus, onDeleteInvoice, onUpdateInvestigationStatus }) {
  if (!isOpen || !invoice) return null;

  const [investigationStatus, setInvestigationStatus] = useState(invoice.investigationStatus || 'Needs Review');
  const [investigatorNotes, setInvestigatorNotes] = useState(invoice.investigatorNotes || '');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (invoice) {
      setInvestigationStatus(invoice.investigationStatus || 'Needs Review');
      setInvestigatorNotes(invoice.investigatorNotes || '');
      setSaveSuccess(false);
    }
  }, [invoice]);

  const handleSaveInvestigation = async () => {
    setIsSavingReview(true);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('invoiceshield_token');
      const response = await fetch('/api/update-investigation-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id: invoice.id || invoice._uuid,
          investigationStatus: investigationStatus,
          investigatorNotes: investigatorNotes
        })
      });

      if (!response.ok) throw new Error('Failed to save audit review');

      const data = await response.json();
      setIsSavingReview(false);
      setSaveSuccess(true);
      if (onUpdateInvestigationStatus) {
        onUpdateInvestigationStatus(data.invoice);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setIsSavingReview(false);
      console.error(err);
      alert('Error saving investigation review: ' + err.message);
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(9, 6, 17);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFontSize(18);
    doc.text("InvoiceShield AI - Security Audit Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    // Invoice Details Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text("Invoice Threat Breakdown", 14, 55);

    doc.setFontSize(11);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 68);
    doc.text(`Vendor: ${invoice.vendor}`, 14, 76);
    doc.text(`GSTIN: ${invoice.gstin || '27AAACA123411Z5'}`, 14, 84);
    doc.text(`State: ${invoice.state || 'Maharashtra'}`, 14, 92);
    doc.text(`Amount: ${invoice.amountFormatted}`, 14, 100);
    doc.text(`AI Risk Score: ${invoice.riskScore} / 100`, 14, 108);
    doc.text(`Current Status: ${invoice.status}`, 14, 116);

    // Reasons
    doc.setFontSize(12);
    doc.text("Flagged AI Anomaly Findings:", 14, 130);

    doc.setFontSize(10);
    doc.setTextColor(220, 38, 38);
    (invoice.flaggedReasons || []).forEach((reason, idx) => {
      doc.text(`• ${reason}`, 20, 140 + (idx * 8));
    });

    // Save PDF
    doc.save(`Audit_Report_${invoice.id}.pdf`);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Safe') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status === 'Review') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  };

  const isHighRisk = invoice.riskScore >= 75;
  const isMediumRisk = invoice.riskScore >= 45 && invoice.riskScore < 75;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#05030a]/85 backdrop-blur-md"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-[#120b22] border-l border-purple-500/40 h-full overflow-y-auto z-10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-purple-900/40">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">INSPECTION DRAWER</span>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{invoice.id}</span>
                    <span className="text-xs text-slate-400 font-normal">({invoice.vendor})</span>
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#090611] border border-purple-900/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Visual Document Inspection View */}
            <div className="space-y-6 my-6">
              
              {/* Comprehensive Invoice Details & Structured Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Document Metadata Preview */}
                <div className="p-5 rounded-2xl bg-[#090611] border border-purple-900/40 relative space-y-4 font-mono text-[11px] text-slate-300">
                  <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                    <span className="text-white font-bold">DOCUMENT METADATA</span>
                    <span className="text-purple-400 font-bold">
                      {invoice.metadata?.copyStatus || "Original Copy"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div><span className="text-slate-500 font-bold">INVOICE #:</span> <span className="text-white font-semibold">{invoice.invoiceDetails?.number || invoice.id}</span></div>
                    <div><span className="text-slate-500 font-bold">DATE:</span> <span className="text-white font-semibold">{invoice.invoiceDetails?.date || invoice.date}</span></div>
                    <div><span className="text-slate-500 font-bold">INVOICE TYPE:</span> <span className="text-white font-semibold">{invoice.metadata?.invoiceType || "Tax Invoice"}</span></div>
                    <div><span className="text-slate-500 font-bold">SIGNATURE STATUS:</span> <span className="text-white font-semibold">{invoice.metadata?.signatureStatus || "Not present"}</span></div>
                    <div><span className="text-slate-500 font-bold">QR CODE STATUS:</span> <span className="text-white font-semibold">{invoice.metadata?.qrCodePresence || "Not present"}</span></div>
                    {invoice.invoiceDetails?.challanNumber && invoice.invoiceDetails.challanNumber !== "Not present" && (
                      <div><span className="text-slate-500 font-bold">CHALLAN:</span> <span className="text-white font-semibold">{invoice.invoiceDetails.challanNumber} ({invoice.invoiceDetails.challanDate})</span></div>
                    )}
                    {invoice.invoiceDetails?.eWayBillNumber && invoice.invoiceDetails.eWayBillNumber !== "Not present" && (
                      <div><span className="text-slate-500 font-bold">E-WAY BILL:</span> <span className="text-white font-semibold">{invoice.invoiceDetails.eWayBillNumber}</span></div>
                    )}
                  </div>
                </div>

                {/* Threat Intelligence Severity Box */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="p-5 rounded-2xl bg-[#090611] border border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">AI Threat Severity</span>
                      <div className={`text-2xl font-bold font-mono ${isHighRisk ? 'text-red-400' : isMediumRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {invoice.riskScore} / 100
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>

              </div>

              {/* Supplier Details Grid */}
              <div>
                
                {/* Supplier Section */}
                <div className="p-5 rounded-2xl bg-[#090611]/60 border border-purple-900/40 space-y-3">
                  <div className="text-xs font-bold text-purple-400 border-b border-purple-900/40 pb-1 uppercase tracking-wider">Supplier / Vendor</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div><span className="text-slate-400">Name:</span> <span className="text-white font-semibold block">{invoice.supplier?.legalName || invoice.vendor}</span></div>
                    <div><span className="text-slate-400">GSTIN:</span> <span className="text-white font-semibold block font-mono">{invoice.supplier?.gstin || invoice.gstin || "Not present"}</span></div>
                    <div><span className="text-slate-400">State:</span> <span className="text-white font-semibold block">{invoice.supplier?.state || invoice.state}</span></div>
                    {invoice.supplier?.msmeNumber && invoice.supplier.msmeNumber !== "Not present" && (
                      <div><span className="text-slate-400">MSME Number:</span> <span className="text-white font-semibold block font-mono">{invoice.supplier.msmeNumber}</span></div>
                    )}
                    {invoice.supplier?.phone && invoice.supplier.phone !== "Not present" && (
                      <div><span className="text-slate-400">Phone:</span> <span className="text-white font-semibold block font-mono">{invoice.supplier.phone}</span></div>
                    )}
                    <div className="sm:col-span-2"><span className="text-slate-400">Address:</span> <span className="text-slate-300 text-[11px] block mt-0.5 leading-relaxed">{invoice.supplier?.address || "Not present"}</span></div>
                  </div>
                </div>

              </div>

              {/* Line Items Table */}
              {invoice.lineItems && invoice.lineItems.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#090611] border border-purple-900/40 space-y-3">
                  <div className="text-xs font-bold text-purple-400 border-b border-purple-900/40 pb-1 uppercase tracking-wider">Line Items</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="border-b border-purple-900/40 text-slate-400">
                          <th className="py-1.5 pr-2">No.</th>
                          <th className="py-1.5 pr-2">Description</th>
                          <th className="py-1.5 pr-2">HSN</th>
                          <th className="py-1.5 pr-2 text-right">Qty</th>
                          <th className="py-1.5 pr-2 text-right">Rate</th>
                          <th className="py-1.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-950/40 text-slate-300">
                        {invoice.lineItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 pr-2">{item.serialNo}</td>
                            <td className="py-1.5 pr-2 truncate max-w-[150px]">{item.name}</td>
                            <td className="py-1.5 pr-2">{item.hsnSac}</td>
                            <td className="py-1.5 pr-2 text-right">{item.qty}</td>
                            <td className="py-1.5 pr-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                            <td className="py-1.5 text-right">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tax & Financial Summary Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Financial Totals */}
                <div className="p-5 rounded-2xl bg-[#090611] border border-purple-900/40 space-y-2 text-xs font-mono">
                  <div className="text-xs font-bold text-purple-400 border-b border-purple-900/40 pb-1.5 uppercase tracking-wider">Financial Summary</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Taxable Value:</span>
                    <span className="text-white font-semibold">₹{invoice.financialSummary?.totalTaxableAmount?.toLocaleString('en-IN') || "0.00"}</span>
                  </div>
                  {invoice.financialSummary?.totalCgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">CGST Amount:</span>
                      <span className="text-white">₹{invoice.financialSummary.totalCgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.financialSummary?.totalSgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">SGST Amount:</span>
                      <span className="text-white">₹{invoice.financialSummary.totalSgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.financialSummary?.totalIgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">IGST Amount:</span>
                      <span className="text-white">₹{invoice.financialSummary.totalIgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-purple-950/60 pt-1.5 font-bold">
                    <span className="text-purple-300">Total Invoice Value:</span>
                    <span className="text-white text-sm">₹{invoice.financialSummary?.totalInvoiceAmount?.toLocaleString('en-IN') || invoice.amountFormatted}</span>
                  </div>
                  {invoice.financialSummary?.amountInWords && invoice.financialSummary.amountInWords !== "Not present" && (
                    <div className="text-[10px] text-slate-400 mt-2 leading-relaxed italic">
                      In Words: {invoice.financialSummary.amountInWords}
                    </div>
                  )}
                </div>

                {/* Banking & Payment Options */}
                <div className="p-5 rounded-2xl bg-[#090611] border border-purple-900/40 space-y-2 text-xs font-mono">
                  <div className="text-xs font-bold text-purple-400 border-b border-purple-900/40 pb-1.5 uppercase tracking-wider">Banking & Payout</div>
                  <div className="space-y-1">
                    {invoice.bankingDetails?.transactionId && invoice.bankingDetails.transactionId !== "Not present" && (
                      <div><span className="text-slate-400">Transaction ID:</span> <span className="text-purple-300 font-bold text-[10px] break-all">{invoice.bankingDetails.transactionId}</span></div>
                    )}
                    {invoice.bankingDetails?.paymentMode && invoice.bankingDetails.paymentMode !== "Not present" && (
                      <div><span className="text-slate-400">Payment Mode:</span> <span className="text-emerald-400 font-bold">{invoice.bankingDetails.paymentMode}</span></div>
                    )}
                    <div><span className="text-slate-400">Bank Name:</span> <span className="text-white font-semibold">{invoice.bankingDetails?.bankName || "Not present"}</span></div>
                    <div><span className="text-slate-400">Account No:</span> <span className="text-white font-semibold">{invoice.bankingDetails?.accountNumber || "Not present"}</span></div>
                    <div><span className="text-slate-400">IFSC Code:</span> <span className="text-white font-semibold">{invoice.bankingDetails?.ifsc || "Not present"}</span></div>
                    <div><span className="text-slate-400">UPI ID:</span> <span className="text-white font-semibold text-[10px]">{invoice.bankingDetails?.upiPaymentInfo || "Not present"}</span></div>
                  </div>
                </div>

              </div>

              {/* Investigator Audit & Case Review Section */}
              <div className="p-5 rounded-2xl bg-[#0e081c] border border-purple-500/40 space-y-4 shadow-xl font-mono">
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                  <div className="flex items-center space-x-2">
                    <ClipboardCheck className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Investigator Case Review
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${
                    investigationStatus === 'Verified'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : investigationStatus === 'Suspected'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}>
                    {investigationStatus}
                  </span>
                </div>

                {/* Status Selection Buttons */}
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">
                    Set Investigation Label:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Needs Review', label: 'Needs Review' },
                      { id: 'Verified', label: 'Verified Authentic' },
                      { id: 'Suspected', label: 'Suspected Threat' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setInvestigationStatus(opt.id)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                          investigationStatus === opt.id
                            ? opt.id === 'Verified'
                              ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                              : opt.id === 'Suspected'
                              ? 'bg-rose-500/25 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50'
                              : 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-md shadow-amber-950/50'
                            : 'bg-[#05030a] border-purple-900/40 text-slate-400 hover:text-white'
                        }`}
                      >
                        {investigationStatus === opt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investigator Note Textarea */}
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                    Investigator Audit Note:
                  </label>
                  <textarea
                    rows={3}
                    value={investigatorNotes}
                    onChange={(e) => setInvestigatorNotes(e.target.value)}
                    placeholder="Enter audit observations, GST matching notes, or evidence summary..."
                    className="w-full p-3 rounded-xl bg-[#05030a] border border-purple-900/50 text-slate-200 text-xs focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                {/* Save Button & Audit Timestamp */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    {invoice.investigatedBy ? `Audited by ${invoice.investigatedBy}` : 'Unreviewed case'}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveInvestigation}
                    disabled={isSavingReview}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center space-x-1.5 ${
                      saveSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white'
                    }`}
                  >
                    {saveSuccess ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isSavingReview ? 'Saving Audit...' : saveSuccess ? 'Audit Review Saved!' : 'Save Audit Review'}</span>
                  </button>
                </div>
              </div>

              {/* Detected Anomalies / Reasons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
                  Detected AI Anomaly Reasons ({invoice.anomalies?.length || 0})
                </span>
                {(invoice.anomalies || []).map((anomaly, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#090611] border border-purple-900/40 text-xs text-slate-200 flex flex-col space-y-1 font-mono">
                    <div className="flex items-center space-x-2.5">
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${anomaly.severity === 'High' ? 'text-red-400' : anomaly.severity === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="font-bold text-white uppercase">{anomaly.anomaly_type}</span>
                      <span className="text-[10px] text-slate-400">({anomaly.severity} Severity)</span>
                    </div>
                    <div className="text-slate-300 pl-6 text-[11px] leading-relaxed">{anomaly.evidence}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2.5 rounded-xl bg-[#090611] hover:bg-[#120b22] border border-purple-900/50 text-purple-300 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Audit PDF</span>
              </button>

              {onDeleteInvoice && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete invoice ${invoice.id}?`)) {
                      onDeleteInvoice(invoice.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Record</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onUpdateStatus(invoice.id, 'Safe');
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(invoice.id, 'Blocked');
                  onClose();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-lg shadow-purple-950"
              >
                <Ban className="w-4 h-4" />
                <span>Enforce Block Hold</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
