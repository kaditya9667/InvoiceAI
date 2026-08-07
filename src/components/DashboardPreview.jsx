import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  ShieldCheck, AlertOctagon, IndianRupee, Search, Eye, CheckCircle,
  Upload, Download, SearchCode, Building2, Ban, FileText, ExternalLink,
  Sparkles, CheckCircle2, RefreshCw, Layers, Shield, FileCheck,
  Filter, Calendar, MapPin, SlidersHorizontal, RotateCcw, X, ChevronDown, ChevronUp, Tag, ArrowUpDown, Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import UploadModal from './UploadModal';
import InvoiceInspectionDrawer from './InvoiceInspectionDrawer';

export default function DashboardPreview({ onSelectInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState({
    totalInvoices: 0,
    safeCount: 0,
    reviewCount: 0,
    blockedCount: 0,
    lossPreventedFormatted: "₹0.00",
    accuracy: "100%"
  });
  const [riskDistribution, setRiskDistribution] = useState([
    { name: "Safe (0-30)", value: 0, color: "#10B981" },
    { name: "Review (31-70)", value: 0, color: "#F59E0B" },
    { name: "High Risk (71-100)", value: 0, color: "#EF4444" }
  ]);
  const [trendData, setTrendData] = useState([]);

  // Search & Filter State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDatePreset, setFilterDatePreset] = useState('All'); // 'All', 'ThisMonth', 'LastMonth', 'Custom'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterVendor, setFilterVendor] = useState('All');
  const [filterAmountPreset, setFilterAmountPreset] = useState('All'); // 'All', 'Under1L', '1Lto5L', 'Above5L', 'Custom'
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterRiskLevel, setFilterRiskLevel] = useState('All'); // 'All', 'Low', 'Medium', 'High'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Safe', 'Review', 'Blocked'
  const [sortBy, setSortBy] = useState('date-desc');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedInspectInvoice, setSelectedInspectInvoice] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Live GSTIN Lookup Widget State
  const [gstinInput, setGstinInput] = useState('27AAACA123411Z5');
  const [gstLookupResult, setGstLookupResult] = useState(null);
  const [isGstLoading, setIsGstLoading] = useState(false);

  // Active Forensic Incident Dossier Modal State
  const [activeDossierInvoice, setActiveDossierInvoice] = useState(null);

  // Fetch REAL Metrics from Backend
  const fetchRealData = async () => {
    try {
      const response = await fetch('/api/real-metrics');
      const data = await response.json();
      setInvoices(data.invoices);
      setMetrics(data.stats);
      setRiskDistribution(data.riskDistribution);
      if (data.trendData) setTrendData(data.trendData);
    } catch (err) {
      console.error("Error fetching real metrics:", err);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Live GSTIN Verification Handler
  const handleVerifyGstin = async (gstToVerify) => {
    const targetGst = (gstToVerify || gstinInput).trim();
    if (!targetGst) return;
    setGstinInput(targetGst);
    setIsGstLoading(true);
    try {
      const res = await fetch(`/api/verify-gstin/${targetGst}`);
      const data = await res.json();
      setIsGstLoading(false);
      setGstLookupResult(data);
    } catch (err) {
      setIsGstLoading(false);
      setGstLookupResult({
        verified: false,
        gstin: targetGst,
        legalName: "Unknown Entity",
        state: "Unknown",
        status: "Error querying registry",
        riskFactor: "Unverified GSTIN"
      });
    }
  };

  // CSV Data Export Handler
  const handleExportCsv = () => {
    if (!invoices.length) return;
    const headers = ["Invoice ID", "Vendor Name", "GSTIN", "Amount (INR)", "Risk Score", "Status", "Date", "Flagged Reasons"];
    const rows = invoices.map(inv => [
      inv.id,
      `"${inv.vendor.replace(/"/g, '""')}"`,
      inv.gstin || "",
      inv.amount,
      inv.riskScore,
      inv.status,
      inv.date || "",
      `"${(inv.flaggedReasons || []).join('; ').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `InvoiceShield_Audit_Dataset_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScanComplete = (newInvoice) => {
    fetchRealData();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await fetch('/api/update-invoice-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newStatus })
      });
      fetchRealData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInvoice = async (targetId) => {
    // Optimistic UI update
    setInvoices(prev => prev.filter(inv => inv._uuid !== targetId && inv.id !== targetId));
    setSelectedInvoiceIds(prev => prev.filter(i => i !== targetId));

    try {
      await fetch(`/api/delete-invoice/${encodeURIComponent(targetId)}`, {
        method: 'DELETE'
      });
      fetchRealData();
    } catch (e) {
      console.error("Delete error:", e);
      fetchRealData();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvoiceIds.length === 0) return;
    const idsToRemove = new Set(selectedInvoiceIds);

    // Optimistic UI update
    setInvoices(prev => prev.filter(inv => !idsToRemove.has(inv._uuid) && !idsToRemove.has(inv.id)));
    setSelectedInvoiceIds([]);

    try {
      await fetch('/api/delete-invoices-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(idsToRemove) })
      });
      fetchRealData();
    } catch (e) {
      console.error("Bulk Delete error:", e);
      fetchRealData();
    }
  };

  const handleClearAllDatabase = async () => {
    // Optimistic UI update
    setInvoices([]);
    setSelectedInvoiceIds([]);

    try {
      await fetch('/api/clear-all-invoices', { method: 'POST' });
      fetchRealData();
    } catch (e) {
      console.error("Clear database error:", e);
      fetchRealData();
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredInvoices.map(inv => inv.id);
      setSelectedInvoiceIds(Array.from(new Set([...selectedInvoiceIds, ...allFilteredIds])));
    } else {
      const filteredSet = new Set(filteredInvoices.map(inv => inv.id));
      setSelectedInvoiceIds(selectedInvoiceIds.filter(id => !filteredSet.has(id)));
    }
  };

  const handleToggleSelectInvoice = (id, e) => {
    e.stopPropagation();
    setSelectedInvoiceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDownloadPdf = (inv) => {
    const targetInv = inv || activeDossierInvoice;
    if (!targetInv) return;

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
    doc.text(`Incident Invoice ID: ${targetInv.id}`, 14, 55);
    doc.text(`Target Vendor: ${targetInv.vendor}`, 14, 63);
    doc.text(`Billing Amount: ${targetInv.amountFormatted}`, 14, 71);
    doc.text(`AI Threat Severity Score: ${targetInv.riskScore} / 100`, 14, 79);
    doc.text(`Action Taken: ${targetInv.status}`, 14, 87);

    doc.text("Cryptographic Forensic Findings:", 14, 102);
    (targetInv.flaggedReasons || []).forEach((reason, idx) => {
      doc.text(`• ${reason}`, 20, 112 + (idx * 8));
    });

    doc.save(`Incident_Investigation_${targetInv.id}.pdf`);
  };

  // Unique options extracted dynamically from current dataset
  const uniqueVendors = Array.from(new Set(invoices.map(inv => inv.vendor).filter(Boolean))).sort();
  const uniqueStates = [
    "Jammu & Kashmir", "Himachal Pradesh", "Punjab", "Chandigarh", "Uttarakhand",
    "Haryana", "Delhi", "Rajasthan", "Uttar Pradesh", "Bihar", "Sikkim",
    "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya",
    "Assam", "West Bengal", "Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh",
    "Gujarat", "Daman & Diu", "Dadra & Nagar Haveli & Daman & Diu", "Maharashtra",
    "Andhra Pradesh (Old)", "Karnataka", "Goa", "Lakshadweep", "Kerala", "Tamil Nadu",
    "Puducherry", "Andaman & Nicobar Islands", "Telangana", "Andhra Pradesh", "Ladakh", "Other Territory"
  ].sort();

  const filteredInvoices = invoices.filter(item => {
    // 0. Search term (Invoice ID, Vendor, GSTIN, State)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        (item.id && item.id.toLowerCase().includes(term)) ||
        (item.vendor && item.vendor.toLowerCase().includes(term)) ||
        (item.gstin && item.gstin.toLowerCase().includes(term)) ||
        (item.state && item.state.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }

    // 1. Date Filter
    if (filterDatePreset === 'ThisMonth') {
      if (!item.date || !item.date.startsWith('2026-08')) return false;
    } else if (filterDatePreset === 'LastMonth') {
      if (!item.date || !item.date.startsWith('2026-07')) return false;
    } else if (filterDatePreset === 'Custom') {
      if (fromDate && item.date && item.date < fromDate) return false;
      if (toDate && item.date && item.date > toDate) return false;
    }

    // 2. Vendor Filter
    if (filterVendor !== 'All' && item.vendor !== filterVendor) {
      return false;
    }

    // 3. Amount Filter
    if (filterAmountPreset === 'Under1L' && item.amount >= 100000) return false;
    if (filterAmountPreset === '1Lto5L' && (item.amount < 100000 || item.amount > 500000)) return false;
    if (filterAmountPreset === 'Above5L' && item.amount <= 500000) return false;
    if (filterAmountPreset === 'Custom') {
      if (minAmount !== '' && item.amount < Number(minAmount)) return false;
      if (maxAmount !== '' && item.amount > Number(maxAmount)) return false;
    }

    // 4. State Filter
    const itemState = item.state || 'Maharashtra';
    if (filterState !== 'All' && itemState !== filterState) {
      return false;
    }

    // 5. Risk Level Filter
    if (filterRiskLevel === 'Low' && item.riskScore > 30) return false;
    if (filterRiskLevel === 'Medium' && (item.riskScore <= 30 || item.riskScore > 70)) return false;
    if (filterRiskLevel === 'High' && item.riskScore <= 70) return false;

    // 6. GST Status Filter
    if (filterStatus !== 'All' && item.status !== filterStatus) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
    if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
    if (sortBy === 'risk-desc') return (b.riskScore || 0) - (a.riskScore || 0);
    if (sortBy === 'vendor-asc') return (a.vendor || '').localeCompare(b.vendor || '');
    return 0;
  });

  const hasActiveFilters =
    searchTerm !== '' ||
    filterDatePreset !== 'All' ||
    fromDate !== '' ||
    toDate !== '' ||
    filterVendor !== 'All' ||
    filterAmountPreset !== 'All' ||
    minAmount !== '' ||
    maxAmount !== '' ||
    filterState !== 'All' ||
    filterRiskLevel !== 'All' ||
    filterStatus !== 'All';

  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterDatePreset('All');
    setFromDate('');
    setToDate('');
    setFilterVendor('All');
    setFilterAmountPreset('All');
    setMinAmount('');
    setMaxAmount('');
    setFilterState('All');
    setFilterRiskLevel('All');
    setFilterStatus('All');
    setSortBy('date-desc');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Safe':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Blocked':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskScoreBadge = (score) => {
    if (score >= 75) return 'text-red-300 font-extrabold bg-red-950/80 border-red-500/60 shadow-sm shadow-red-950';
    if (score >= 40) return 'text-amber-300 font-extrabold bg-amber-950/80 border-amber-500/60 shadow-sm shadow-amber-950';
    return 'text-emerald-300 font-extrabold bg-emerald-950/80 border-emerald-500/60 shadow-sm shadow-emerald-950';
  };

  return (
    <section id="dashboard" className="relative py-6 bg-[#090611]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Dashboard Title & Top Command Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>REAL-TIME AUDIT CONSOLE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Fraud Intelligence Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-[#120b22] border border-purple-900/50 hover:border-purple-500/50 font-semibold text-slate-200 text-xs sm:text-sm hover:text-white transition-all flex items-center space-x-2 cursor-pointer shadow-lg"
              title="Export Dataset to CSV"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 font-bold text-white text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload & Scan Invoice</span>
            </button>
          </div>
        </div>

        {/* Government GST Taxpayer Registry Lookup Widget */}
        <div className="p-6 rounded-2xl bg-[#120b22]/90 border border-purple-900/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Government GST Taxpayer Registry Lookup
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300">GST API VERIFIED</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleVerifyGstin(gstinInput); }} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <SearchCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gstinInput}
                onChange={(e) => setGstinInput(e.target.value)}
                placeholder="Enter 15-digit GSTIN (e.g. 27AAACA123411Z5)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090611] border border-purple-900/50 text-slate-100 text-xs font-mono focus:outline-none focus:border-purple-400"
              />
            </div>
            <button
              type="submit"
              disabled={isGstLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              {isGstLoading ? <span>Verifying...</span> : <span>Verify Taxpayer Status</span>}
            </button>
          </form>

          {gstLookupResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#090611] border border-purple-900/40 text-xs font-mono grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block uppercase">Legal Entity Name</span>
                <span className="text-white font-bold">{gstLookupResult.legalName}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Tax Jurisdiction</span>
                <span className="text-purple-300 font-bold">{gstLookupResult.state}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">Filing Status</span>
                <span className={`font-bold ${gstLookupResult.verified ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gstLookupResult.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase">AI Risk Classification</span>
                <span className="text-amber-400 font-bold">{gstLookupResult.riskFactor}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Real Live Database Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#120b22]/90 border border-purple-900/40 hover:border-purple-500/40 transition-colors shadow-xl">
            <div className="flex items-center justify-between text-white text-sm font-mono uppercase font-black tracking-wider mb-3">
              <span>Total Database Invoices</span>
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">{metrics.totalInvoices}</div>
            <div className="text-sm text-slate-400 mt-2 font-medium">Live DB Records</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#120b22]/90 border border-purple-900/40 hover:border-emerald-500/40 transition-colors shadow-xl">
            <div className="flex items-center justify-between text-white text-sm font-mono uppercase font-black tracking-wider mb-3">
              <span>Safe Verified Invoices</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-400 tracking-tight">{metrics.safeCount}</div>
            <div className="text-sm text-emerald-400/90 mt-2 font-semibold">Accuracy: {metrics.accuracy}</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#120b22]/90 border border-purple-900/40 hover:border-red-500/40 transition-colors shadow-xl">
            <div className="flex items-center justify-between text-white text-sm font-mono uppercase font-black tracking-wider mb-3">
              <span>High-Risk Intercepted</span>
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-red-400 tracking-tight">{metrics.blockedCount}</div>
            <div className="text-sm text-red-400/90 mt-2 font-semibold">Requires Compliance Hold</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#120b22]/90 border border-purple-900/40 hover:border-fuchsia-500/40 transition-colors shadow-xl">
            <div className="flex items-center justify-between text-white text-sm font-mono uppercase font-black tracking-wider mb-3">
              <span>Actual Value Protected</span>
              <IndianRupee className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-fuchsia-400 tracking-tight">{metrics.lossPreventedFormatted}</div>
            <div className="text-sm text-fuchsia-400/90 mt-2 font-semibold">Real Blocked Payout Total</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#120b22]/70 border border-purple-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Fraud Interception Trend</h3>
                <p className="text-xs text-slate-400">Real monthly breakdown calculated live from database records</p>
              </div>
              <span className="text-xs font-mono text-purple-400">2026 YTD</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1535" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#090611', borderColor: '#342258', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="safe" name="Safe Invoices" stroke="#10B981" fillOpacity={1} fill="url(#colorSafe)" />
                  <Area type="monotone" dataKey="blocked" name="Blocked Invoices" stroke="#EF4444" fillOpacity={1} fill="url(#colorBlocked)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#120b22]/70 border border-purple-900/40 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Real Risk Breakdown</h3>
              <p className="text-xs text-slate-400">Live distribution across risk tiers</p>
            </div>

            <div className="h-48 w-full relative flex items-center justify-center my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090611', borderColor: '#342258', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono text-white">{metrics.totalInvoices}</span>
                <span className="text-[10px] text-slate-400 uppercase">Records</span>
              </div>
            </div>

            <div className="space-y-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-white font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Invoice Records Table & Multi-Filter Intelligence Panel */}
        <div className="p-6 rounded-2xl bg-[#120b22]/80 border border-purple-900/40 space-y-6">

          {/* Header Row: Title & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="dashboard-title">Live Invoice Records</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                  {filteredInvoices.length} of {invoices.length} items
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multi-criteria audit query across Date, Vendor, Amount, State, Risk Level & GST Status</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {invoices.length > 0 && (
                <button
                  onClick={handleClearAllDatabase}
                  className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-600 border border-red-800/60 text-red-300 hover:text-white text-xs font-bold font-sans flex items-center space-x-2 transition-all cursor-pointer shadow-lg"
                  title="Clear all stored invoice records"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Clear All Records ({invoices.length})</span>
                </button>
              )}

              {selectedInvoiceIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-sans flex items-center space-x-2 transition-all cursor-pointer shadow-lg animate-in fade-in"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedInvoiceIds.length})</span>
                </button>
              )}

              {/* Search Bar */}
              <div className="relative min-w-[240px] flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID, Vendor, GSTIN, State..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#090611] border border-purple-900/40 text-slate-200 text-xs focus:outline-none focus:border-purple-400 placeholder:text-slate-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#090611] border border-purple-900/40 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="date-desc" className="bg-[#120b22] text-white">Date (Newest First)</option>
                  <option value="date-asc" className="bg-[#120b22] text-white">Date (Oldest First)</option>
                  <option value="amount-desc" className="bg-[#120b22] text-white">Amount (High to Low)</option>
                  <option value="amount-asc" className="bg-[#120b22] text-white">Amount (Low to High)</option>
                  <option value="risk-desc" className="bg-[#120b22] text-white">Risk Score (Highest First)</option>
                  <option value="vendor-asc" className="bg-[#120b22] text-white">Vendor (A-Z)</option>
                </select>
              </div>

              {/* Toggle Filter Panel Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${isFilterOpen || hasActiveFilters
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                    : 'bg-[#090611] border-purple-900/40 text-slate-400 hover:text-white'
                  }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                )}
                {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expandable Multi-Filter Control Grid */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-purple-900/40 pb-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                  {/* 1. Date Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>Date Filter</span>
                    </label>
                    <select
                      value={filterDatePreset}
                      onChange={(e) => setFilterDatePreset(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090611] border border-purple-900/50 text-slate-200 text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="All" className="bg-[#120b22]">All Dates</option>
                      <option value="ThisMonth" className="bg-[#120b22]">This Month (Aug 2026)</option>
                      <option value="LastMonth" className="bg-[#120b22]">Last Month (Jul 2026)</option>
                      <option value="Custom" className="bg-[#120b22]">Custom Date Range</option>
                    </select>

                    {filterDatePreset === 'Custom' && (
                      <div className="pt-2 space-y-1">
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#090611] border border-purple-900/50 text-slate-300 text-[11px]"
                        />
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#090611] border border-purple-900/50 text-slate-300 text-[11px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Vendor Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-purple-400" />
                      <span>Vendor</span>
                    </label>
                    <select
                      value={filterVendor}
                      onChange={(e) => setFilterVendor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090611] border border-purple-900/50 text-slate-200 text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="All" className="bg-[#120b22]">All Vendors</option>
                      {uniqueVendors.map((vendor) => (
                        <option key={vendor} value={vendor} className="bg-[#120b22]">
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Amount Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <IndianRupee className="w-3 h-3 text-purple-400" />
                      <span>Amount Filter</span>
                    </label>
                    <select
                      value={filterAmountPreset}
                      onChange={(e) => setFilterAmountPreset(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090611] border border-purple-900/50 text-slate-200 text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="All" className="bg-[#120b22]">All Amounts</option>
                      <option value="Under1L" className="bg-[#120b22]">Under ₹1,00,000</option>
                      <option value="1Lto5L" className="bg-[#120b22]">₹1,00,000 - ₹5,00,000</option>
                      <option value="Above5L" className="bg-[#120b22]">Above ₹5,00,000</option>
                      <option value="Custom" className="bg-[#120b22]">Custom Min / Max</option>
                    </select>

                    {filterAmountPreset === 'Custom' && (
                      <div className="pt-2 flex items-center space-x-1">
                        <input
                          type="number"
                          placeholder="Min ₹"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          className="w-1/2 px-2 py-1 rounded-lg bg-[#090611] border border-purple-900/50 text-slate-300 text-[11px]"
                        />
                        <input
                          type="number"
                          placeholder="Max ₹"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          className="w-1/2 px-2 py-1 rounded-lg bg-[#090611] border border-purple-900/50 text-slate-300 text-[11px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. State Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-purple-400" />
                      <span>State / Jurisdiction</span>
                    </label>
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090611] border border-purple-900/50 text-slate-200 text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="All" className="bg-[#120b22]">All States</option>
                      {uniqueStates.map((st) => (
                        <option key={st} value={st} className="bg-[#120b22]">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Risk Level Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <AlertOctagon className="w-3 h-3 text-purple-400" />
                      <span>Risk Level</span>
                    </label>
                    <select
                      value={filterRiskLevel}
                      onChange={(e) => setFilterRiskLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090611] border border-purple-900/50 text-slate-200 text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="All" className="bg-[#120b22]">All Risk Levels</option>
                      <option value="Low" className="bg-[#120b22]">Low Risk (0 - 30)</option>
                      <option value="Medium" className="bg-[#120b22]">Medium Risk (31 - 70)</option>
                      <option value="High" className="bg-[#120b22]">High Risk (71 - 100)</option>
                    </select>
                  </div>

                  {/* 6. GST Status Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-purple-400" />
                      <span>GST Status</span>
                    </label>
                    <div className="flex items-center space-x-1 bg-[#090611] p-1 rounded-xl border border-purple-900/50">
                      {['All', 'Safe', 'Review', 'Blocked'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${filterStatus === status
                              ? status === 'Safe' ? 'bg-emerald-500 text-slate-950 font-bold'
                                : status === 'Review' ? 'bg-amber-500 text-slate-950 font-bold'
                                  : status === 'Blocked' ? 'bg-red-500 text-white font-bold'
                                    : 'bg-purple-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Tag Pills & Reset Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#090611] border border-purple-900/40 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 flex items-center space-x-1 text-[11px] uppercase tracking-wider">
                  <Tag className="w-3 h-3 text-purple-400" />
                  <span>Active Filters:</span>
                </span>

                {searchTerm && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>Search: "{searchTerm}"</span>
                    <button onClick={() => setSearchTerm('')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterDatePreset !== 'All' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>Date: {filterDatePreset}</span>
                    <button onClick={() => setFilterDatePreset('All')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterVendor !== 'All' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>Vendor: {filterVendor}</span>
                    <button onClick={() => setFilterVendor('All')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterAmountPreset !== 'All' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>Amount: {filterAmountPreset}</span>
                    <button onClick={() => setFilterAmountPreset('All')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterState !== 'All' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>State: {filterState}</span>
                    <button onClick={() => setFilterState('All')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterRiskLevel !== 'All' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>Risk: {filterRiskLevel}</span>
                    <button onClick={() => setFilterRiskLevel('All')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterStatus !== 'All' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-700/50 text-purple-200 flex items-center space-x-1">
                    <span>Status: {filterStatus}</span>
                    <button onClick={() => setFilterStatus('All')} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>

              <button
                onClick={resetAllFilters}
                className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-sans font-bold flex items-center space-x-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* Table Area */}
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base text-slate-200">
                <thead className="bg-[#090611] text-slate-300 font-mono text-sm uppercase border-b border-purple-900/40">
                  <tr>
                    <th className="py-4 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          filteredInvoices.length > 0 &&
                          filteredInvoices.every(inv => selectedInvoiceIds.includes(inv.id))
                        }
                        className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4 font-extrabold text-white">Invoice ID</th>
                    <th className="py-4 px-4 font-extrabold text-white">Date</th>
                    <th className="py-4 px-4 font-extrabold text-white">Vendor Name</th>
                    <th className="py-4 px-4 font-extrabold text-white">State</th>
                    <th className="py-4 px-4 text-right font-extrabold text-white">Amount</th>
                    <th className="py-4 px-4 text-center font-extrabold text-white">Risk Score</th>
                    <th className="py-4 px-4 text-center font-extrabold text-white">GST Status</th>
                    <th className="py-4 px-4 text-right font-extrabold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 font-mono text-sm sm:text-base">
                  {filteredInvoices.map((inv, idx) => {
                    const rowKey = inv._uuid || `${inv.id}_${idx}`;
                    const isSelected = selectedInvoiceIds.includes(rowKey);
                    return (
                      <tr
                        key={rowKey}
                        onClick={() => {
                          setSelectedInspectInvoice(inv);
                          setIsDrawerOpen(true);
                        }}
                        className={`transition-colors group cursor-pointer ${
                          isSelected ? 'bg-purple-900/30' : 'hover:bg-purple-950/40'
                        }`}
                      >
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectInvoice(rowKey, e)}
                            className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 font-bold text-purple-300 text-base">{inv.id}</td>
                      <td className="py-4 px-4 text-slate-300 text-sm">{inv.date || '2026-08-04'}</td>
                      <td className="py-4 px-4 text-white font-sans font-bold text-base">{inv.vendor}</td>
                      <td className="py-4 px-4 font-sans">
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-900/30 text-purple-200 border border-purple-800/40 text-xs sm:text-sm font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <span>{inv.state || 'Maharashtra'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-white font-bold text-base">{inv.amountFormatted}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold font-mono tracking-wide ${getRiskScoreBadge(inv.riskScore)}`}>
                          {inv.riskScore} / 100
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-sans">
                        <span className={`inline-block px-3.5 py-1 rounded-full border text-xs sm:text-sm font-bold ${getStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInspectInvoice(inv);
                              setIsDrawerOpen(true);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Inspect</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInvoice(inv._uuid || inv.id);
                            }}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-md"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Clean Empty State when filters yield 0 results */
            <div className="py-12 px-4 text-center space-y-4 bg-[#090611]/60 rounded-xl border border-purple-900/30">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Matching Invoices Found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  No invoice records match your current filter parameters for Date, Vendor, Amount, State, Risk Level, or GST Status.
                </p>
              </div>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters & Show All Records</span>
              </button>
            </div>
          )}

        </div>

      </div>



      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onScanComplete={handleScanComplete}
      />

      <InvoiceInspectionDrawer
        isOpen={isDrawerOpen}
        invoice={selectedInspectInvoice}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </section>
  );
}
