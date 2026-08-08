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

  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    if (invoice) {
      setInvestigationStatus(invoice.investigationStatus || 'Needs Review');
      setInvestigatorNotes(invoice.investigatorNotes || '');
      setSaveSuccess(false);
      setExportMenuOpen(false);
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Dark Enterprise Header
    doc.setFillColor(18, 11, 34);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("InvoiceShield AI - Security Audit Report", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} | Case ID: ${invoice.id || invoice._uuid}`, 14, 33);

    // Primary Metrics Card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 182, 42, 3, 3, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Vendor: ${invoice.vendor || 'Unknown Vendor'}`, 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`GSTIN: ${invoice.gstin || 'Not present'} | State Jurisdiction: ${invoice.state || 'Not present'}`, 20, 68);
    doc.text(`Amount: ${invoice.amountFormatted || '₹' + (invoice.amount || 0)} | Billing Month: ${invoice.month || 'Aug'}`, 20, 76);
    doc.text(`OCR Extractor Engine: ${invoice.ocrEngine || 'pdf-parse Vector PDF Extractor / Google Cloud Vision'}`, 20, 84);

    doc.setFont("helvetica", "bold");
    if (invoice.riskScore >= 75) doc.setTextColor(185, 28, 28);
    else if (invoice.riskScore >= 45) doc.setTextColor(217, 119, 6);
    else doc.setTextColor(4, 120, 87);
    doc.text(`AI Risk Score: ${invoice.riskScore} / 100 (${invoice.status || 'Safe'})`, 120, 60);

    doc.setTextColor(79, 70, 229);
    doc.text(`Investigation: ${investigationStatus || invoice.investigationStatus || 'Needs Review'}`, 120, 68);

    // Line Items & Financial Summary
    let y = 102;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Financial Breakdown & Compliance Verification", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    const fin = invoice.financialSummary || {};
    doc.text(`Total Taxable Amount: ₹${(fin.totalTaxableAmount || (invoice.amount / 1.18) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 20, y);
    doc.text(`Total Tax Amount: ₹${(fin.totalTax || (invoice.amount - (invoice.amount / 1.18)) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 110, y);
    y += 7;
    doc.text(`Bank Name: ${invoice.bankingDetails?.bankName || 'N/A'} | Account #: ${invoice.bankingDetails?.accountNumber || 'N/A'}`, 20, y);
    doc.text(`IFSC Code: ${invoice.bankingDetails?.ifsc || invoice.ifsc || 'N/A'}`, 110, y);
    y += 12;

    // Flagged Reasons & Anomalies
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Detected Security Anomalies & Risk Analysis", 14, y);
    y += 8;

    const reasons = invoice.flaggedReasons || [];
    if (reasons.length === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(4, 120, 87);
      doc.text("• No compliance anomalies detected.", 20, y);
      y += 8;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(185, 28, 28);
      reasons.forEach(r => {
        doc.text(`• ${r}`, 20, y);
        y += 7;
      });
    }

    y += 6;
    // Auditor Investigation Review Section
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Investigator Audit Review Notes", 14, y);
    y += 8;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 34, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(`Auditor: ${invoice.investigatedBy || 'Senior Compliance Auditor'} | Audit Date: ${invoice.investigatedAt || new Date().toLocaleDateString()}`, 20, y + 8);
    doc.setFont("helvetica", "normal");
    const noteText = investigatorNotes || invoice.investigatorNotes || "No auditor notes recorded.";
    const splitNotes = doc.splitTextToSize(`Auditor Note: "${noteText}"`, 170);
    doc.text(splitNotes, 20, y + 17);

    doc.save(`Security_Report_${invoice.id || invoice._uuid}.pdf`);
  };

  const handleDownloadCSV = () => {
    const headers = ["Case ID", "Vendor", "GSTIN", "State", "Amount", "Risk Score", "Status", "Investigation Status", "Investigator Notes", "Investigated By", "Investigated At", "Flagged Reasons"];
    const row = [
      `"${invoice.id || invoice._uuid}"`,
      `"${(invoice.vendor || '').replace(/"/g, '""')}"`,
      `"${invoice.gstin || ''}"`,
      `"${invoice.state || ''}"`,
      `"${invoice.amount || 0}"`,
      `"${invoice.riskScore || 0}"`,
      `"${invoice.status || ''}"`,
      `"${investigationStatus || invoice.investigationStatus || ''}"`,
      `"${(investigatorNotes || invoice.investigatorNotes || '').replace(/"/g, '""')}"`,
      `"${(invoice.investigatedBy || 'Reviewer').replace(/"/g, '""')}"`,
      `"${invoice.investigatedAt || ''}"`,
      `"${(invoice.flaggedReasons || []).join('; ').replace(/"/g, '""')}"`
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Security_Report_${invoice.id || invoice._uuid}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHTML = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>InvoiceShield Security Audit Dossier - ${invoice.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0714; color: #e2e8f0; margin: 0; padding: 30px; }
    .card { background: #120b22; border: 1px solid #3b0764; border-radius: 16px; padding: 28px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { border-bottom: 1px solid #3b0764; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #c084fc; margin: 0; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: bold; font-size: 13px; font-family: monospace; }
    .badge-risk { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
    .badge-verified { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .field { background: #090611; border: 1px solid rgba(147, 51, 234, 0.3); padding: 14px 18px; border-radius: 12px; }
    .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; font-weight: bold; }
    .val { font-size: 15px; font-weight: 600; color: #f8fafc; margin-top: 4px; }
    .section-title { font-size: 16px; font-weight: bold; color: #e9d5ff; margin: 24px 0 12px 0; border-bottom: 1px solid #3b0764; padding-bottom: 6px; }
    ul { margin: 0; padding-left: 20px; color: #fca5a5; }
    .notes-box { background: #1e1035; border: 1px solid #6b21a8; padding: 18px; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #f8fafc; }
    @media print { body { background: #fff; color: #000; } .card { background: #fff; border: 1px solid #ccc; color: #000; } .val { color: #000; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="title">InvoiceShield AI Security Audit</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Case Record: ${invoice.id || invoice._uuid}</div>
      </div>
      <span class="badge ${invoice.riskScore >= 45 ? 'badge-risk' : 'badge-verified'}">
        Risk Score: ${invoice.riskScore} / 100 (${invoice.status})
      </span>
    </div>

    <div class="grid">
      <div class="field"><div class="label">Vendor Name</div><div class="val">${invoice.vendor}</div></div>
      <div class="field"><div class="label">GSTIN Identification</div><div class="val">${invoice.gstin || 'Not present'}</div></div>
      <div class="field"><div class="label">Total Amount</div><div class="val">${invoice.amountFormatted || '₹' + invoice.amount}</div></div>
      <div class="field"><div class="label">State Jurisdiction</div><div class="val">${invoice.state || 'Not present'}</div></div>
      <div class="field"><div class="label">Investigation Status</div><div class="val">${investigationStatus || invoice.investigationStatus || 'Needs Review'}</div></div>
      <div class="field"><div class="label">Auditor Signature</div><div class="val">${invoice.investigatedBy || 'Senior Compliance Auditor'}</div></div>
    </div>

    <div class="section-title">Flagged Risk & Anomaly Evidence</div>
    <ul>
      ${(invoice.flaggedReasons || []).length > 0
        ? (invoice.flaggedReasons || []).map(r => `<li style="margin-bottom:6px;">${r}</li>`).join('')
        : '<li style="color:#6ee7b7">No verified compliance anomalies detected.</li>'}
    </ul>

    <div class="section-title">Investigator Audit Review Notes</div>
    <div class="notes-box">
      ${investigatorNotes || invoice.investigatorNotes || 'No auditor notes recorded.'}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Security_Dossier_${invoice.id || invoice._uuid}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${investigationStatus === 'Verified'
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
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${investigationStatus === opt.id
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center space-x-1.5 ${saveSuccess
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
              <div className="relative">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/60 text-purple-200 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Export Report</span>
                </button>

                {exportMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-52 rounded-xl bg-[#090611] border border-purple-700/60 shadow-2xl p-1.5 z-50 flex flex-col space-y-1 font-mono text-xs">
                    <button
                      onClick={() => { handleDownloadPDF(); setExportMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-[#120b22] hover:bg-purple-600 text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>📄 PDF Audit Report</span>
                    </button>
                    <button
                      onClick={() => { handleDownloadCSV(); setExportMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-[#120b22] hover:bg-purple-600 text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>📊 CSV Data Export</span>
                    </button>
                    <button
                      onClick={() => { handleDownloadHTML(); setExportMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-[#120b22] hover:bg-purple-600 text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>🌐 HTML Security Dossier</span>
                    </button>
                  </div>
                )}
              </div>

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
