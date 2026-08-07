import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Sparkles, BrainCircuit, AlertCircle, FileCode } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onScanComplete }) {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'batch'
  const [files, setFiles] = useState([]);
  const [scanProgress, setScanProgress] = useState('');
  const [jsonText, setJsonText] = useState(`[
  {
    "id": "INV-2026-9012",
    "vendor": "Starlight Logistics Ltd",
    "gstin": "27AAACA123411Z5",
    "amount": 540000,
    "riskScore": 88,
    "status": "Blocked",
    "flaggedReasons": ["Duplicate billing across multiple subsidiaries"]
  }
]`);

  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  // Multi-File Upload Handler
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setErrorMsg('Please select or drop at least one invoice file (PDF or Image).');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);

    let lastProcessedInvoice = null;
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const curFile = files[i];
        setScanProgress(`Scanning invoice ${i + 1} of ${files.length}: ${curFile.name}...`);

        const formData = new FormData();
        formData.append('file', curFile);

        const response = await fetch('/api/analyze-invoice-pdf', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Failed to scan ${curFile.name}`);

        lastProcessedInvoice = data.invoice;
        successCount++;
      }

      setIsScanning(false);
      setScanProgress('');
      setFiles([]);
      onScanComplete(lastProcessedInvoice);
      onClose();
    } catch (err) {
      setIsScanning(false);
      setScanProgress('');
      setErrorMsg(err.message || 'Error processing invoice documents.');
    }
  };

  // Batch JSON Import Handler
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsScanning(true);

    try {
      const parsedJson = JSON.parse(jsonText);
      const response = await fetch('/api/import-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices: parsedJson })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to import batch');

      setIsScanning(false);
      onScanComplete(null); // Triggers re-fetch of all records
      onClose();
    } catch (err) {
      setIsScanning(false);
      setErrorMsg(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#05030a]/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#120b22] border border-purple-500/30 shadow-2xl shadow-purple-950/60 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Import Invoices into InvoiceShield AI</h3>
                <p className="text-xs text-slate-400">Upload multiple PDF/image invoices or import JSON dataset</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-[#090611] border border-purple-900/50 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex space-x-2 mt-4 p-1 rounded-xl bg-[#090611] border border-purple-900/40 text-xs">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors ${activeTab === 'pdf' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Upload PDF/Image Invoices</span>
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors ${activeTab === 'batch' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Batch JSON/CSV Import</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PDF Tab Form */}
          {activeTab === 'pdf' && (
            <form onSubmit={handleScanSubmit} className="space-y-4 mt-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-purple-900/40 hover:border-purple-500/50 rounded-2xl p-6 text-center bg-[#090611]/50 transition-colors relative cursor-pointer"
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-200">Drag & Drop multiple invoice files here</p>
                <p className="text-xs text-slate-500 mt-1">Select multiple PDF, PNG, JPG, or WEBP files at once</p>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  <div className="text-[11px] font-mono text-slate-400 font-bold uppercase flex justify-between">
                    <span>Selected Invoices ({files.length})</span>
                    <button type="button" onClick={() => setFiles([])} className="text-purple-400 hover:underline">Clear all</button>
                  </div>
                  {files.map((f, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#090611] border border-purple-900/40 flex items-center justify-between text-xs font-mono text-purple-300">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                        <span className="truncate">{f.name}</span>
                        <span className="text-slate-500 text-[10px]">({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveFile(idx)} className="text-slate-500 hover:text-red-400 p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isScanning || files.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 font-bold text-white text-sm hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <span className="flex items-center space-x-2 text-xs">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>{scanProgress || 'Processing invoices...'}</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze {files.length > 1 ? `${files.length} Invoices` : 'Invoice Document'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Batch JSON Import Form */}
          {activeTab === 'batch' && (
            <form onSubmit={handleBatchSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Paste JSON Records Array
                </label>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#090611] border border-purple-900/40 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 font-bold text-white text-sm hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isScanning ? (
                  <span>Importing Records...</span>
                ) : (
                  <>
                    <FileCode className="w-4 h-4" />
                    <span>Import Batch Dataset</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
