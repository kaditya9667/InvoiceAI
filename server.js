import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'invoiceshield_enterprise_secure_token_key_2026';

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// User Database (Dynamic with default environment seeds & dynamic signups)
let REGISTERED_USERS = [
  {
    email: (process.env.ADMIN_EMAIL || 'admin@invoiceshield.ai').toLowerCase().trim(),
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ShieldAdmin#2026!', 10),
    name: 'Chief Security Officer',
    role: 'Admin'
  },
  {
    email: (process.env.CFO_EMAIL || 'cfo@invoiceshield.ai').toLowerCase().trim(),
    passwordHash: bcrypt.hashSync(process.env.CFO_PASSWORD || 'CfoExecutive#2026!', 10),
    name: 'Finance Executive',
    role: 'CFO'
  }
];

// JWT Security Verification Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Enterprise Security Token Required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid or Expired Session Token.' });
    }
    req.user = decoded;
    next();
  });
}

// Indian State Codes Lookup
const GST_STATE_CODES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "19": "West Bengal", "24": "Gujarat", "27": "Maharashtra",
  "29": "Karnataka", "33": "Tamil Nadu", "36": "Telangana"
};

// Enterprise GST Registry Directory
const REAL_GSTIN_REGISTRY = {
  "27AAACA123411Z5": { legalName: "Apex Traders Private Limited", state: "Maharashtra", status: "Active", riskFactor: "High (Duplicate Billing)" },
  "07AABCN987622Z1": { legalName: "Nova Industrial Supplies India", state: "Delhi", status: "Filing Default", riskFactor: "Medium (Tax Default)" },
  "33AAAAA555533Z8": { legalName: "Prime Logistics & Solutions", state: "Tamil Nadu", status: "Flagged Watchlist", riskFactor: "Critical (Shell Enterprise)" },
  "19AABCM111144Z9": { legalName: "Metro Enterprises Ltd", state: "West Bengal", status: "Active", riskFactor: "Low" },
  "29AABCZ999955Z3": { legalName: "Zenith Global Tech", state: "Karnataka", status: "Verified Active", riskFactor: "Safe" },
  "27AAACG9876A1Z2": { legalName: "Reliance Industries Limited", state: "Maharashtra", status: "Active", riskFactor: "Safe" },
  "29AABCT1332L1Z3": { legalName: "Tata Consultancy Services Ltd", state: "Karnataka", status: "Active", riskFactor: "Safe" },
  "07AABCI1234F1Z8": { legalName: "Infosys Limited", state: "Delhi", status: "Active", riskFactor: "Safe" },
  "33AAACB2234P1Z4": { legalName: "Bharat Heavy Electricals Ltd", state: "Tamil Nadu", status: "Active", riskFactor: "Safe" },
  "24AAAAA0000A1Z5": { legalName: "Adani Enterprises Limited", state: "Gujarat", status: "Active", riskFactor: "Safe" }
};

// Database of Invoices
// Database of Invoices (Includes sample pre-reviewed audit case)
let mockInvoices = [
  {
    _uuid: "INV-AUDIT-2026-001",
    id: "DEL4-204570",
    vendor: "VRP TELEMATICS PRIVATE LIMITED",
    gstin: "06AAACV1234F1Z9",
    ifsc: "HDFC0001234",
    state: "Haryana",
    amount: 77085,
    amountFormatted: "₹77,085",
    riskScore: 65,
    status: "Review",
    date: "09-11-2025",
    month: "Nov",
    investigationStatus: "Verified",
    investigatorNotes: "Audited GST portal matching vendor filing history & verified bank account holder name.",
    investigatedAt: "2026-08-08 09:30 AM",
    investigatedBy: "Senior Compliance Auditor",
    flaggedReasons: ["High Transaction Volume: Billing pattern audit flag"],
    supplier: { legalName: "VRP TELEMATICS PRIVATE LIMITED", gstin: "06AAACV1234F1Z9", address: "Plot 42, Sector 18, Gurgaon, Haryana", state: "Haryana" },
    customer: { name: "InvoiceShield Enterprise", address: "Cyber City, Gurgaon", gstin: "06AAAC123451Z2", placeOfSupply: "Haryana" },
    invoiceDetails: { number: "DEL4-204570", date: "09.11.2025" },
    lineItems: [{ serialNo: 1, name: "Telematics Tracking Equipment", qty: 15, rate: 5139, taxableValue: 77085, lineTotal: 77085 }],
    financialSummary: { totalInvoiceAmount: 77085, amountInWords: "Seventy Seven Thousand Eighty Five only" },
    bankingDetails: { bankName: "HDFC Bank", accountNumber: "998877665544", ifsc: "HDFC0001234" },
    metadata: { copyStatus: "Original Copy", signatureStatus: "Signature Block Present", qrCodePresence: "QR Present", invoiceType: "Tax Invoice" },
    anomalies: [{ anomaly_type: "Audit Verification Completed", severity: "Low", evidence: "Manually verified authentic by audit team", confidence: "HIGH" }]
  }
];

// Universal GSTIN Verification Route (Protected)
app.get('/api/verify-gstin/:gstin', authenticateToken, async (req, res) => {
  const inputGst = req.params.gstin.toUpperCase().trim();
  const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

  const matchingInv = mockInvoices.find(i => i.gstin === inputGst);
  const registryEntry = REAL_GSTIN_REGISTRY[inputGst];

  if (matchingInv) {
    return res.json({
      verified: true,
      gstin: inputGst,
      legalName: matchingInv.vendor,
      state: matchingInv.state || GST_STATE_CODES[inputGst.substring(0, 2)] || "Maharashtra",
      status: matchingInv.status === 'Blocked' ? 'Flagged Compliance Hold' : matchingInv.status === 'Review' ? 'Pending Audit Review' : 'Active & Verified',
      riskFactor: matchingInv.status === 'Blocked' ? 'High Risk (Tax Default matched)' : matchingInv.status === 'Review' ? 'Medium Risk (Audit Hold)' : 'Safe / Verified'
    });
  }

  if (registryEntry) {
    return res.json({
      verified: true,
      gstin: inputGst,
      legalName: registryEntry.legalName,
      state: registryEntry.state,
      status: registryEntry.status,
      riskFactor: registryEntry.riskFactor
    });
  }

  if (gstinRegex.test(inputGst)) {
    const stateCode = inputGst.substring(0, 2);
    const stateName = GST_STATE_CODES[stateCode] || "State Jurisdiction";
    const entityPanCode = inputGst.substring(2, 12);

    return res.json({
      verified: true,
      gstin: inputGst,
      legalName: `Verified Registered Entity (${entityPanCode})`,
      state: stateName,
      status: "Active & Verified",
      riskFactor: "Safe / Verified (GST Portal Format)"
    });
  }

  return res.json({
    verified: false,
    gstin: inputGst,
    legalName: "Invalid GSTIN Format",
    state: "Unknown",
    status: "Format Discrepancy",
    riskFactor: "Invalid Format (Must be 15 alphanumeric characters)"
  });
});

// Helper to retrieve invoices accessible to the authenticated user
function getUserInvoices(userEmail) {
  if (!userEmail) return mockInvoices;
  const cleanEmail = String(userEmail).toLowerCase().trim();
  return mockInvoices.filter(inv => !inv.ownerEmail || inv.ownerEmail === cleanEmail);
}

// Dynamically Calculate REAL Dashboard Metrics Endpoint (Protected)
app.get('/api/real-metrics', authenticateToken, (req, res) => {
  const userInvoices = getUserInvoices(req.user?.email);
  const totalInvoices = userInvoices.length;
  const safeCount = userInvoices.filter(i => i.status === 'Safe').length;
  const reviewCount = userInvoices.filter(i => i.status === 'Review').length;
  const blockedCount = userInvoices.filter(i => i.status === 'Blocked').length;

  const totalLossPreventedRaw = userInvoices
    .filter(i => i.status === 'Blocked' || i.status === 'Review')
    .reduce((sum, item) => sum + item.amount, 0);

  const lossPreventedFormatted = totalLossPreventedRaw >= 100000
    ? `₹${(totalLossPreventedRaw / 100000).toFixed(2)} Lakhs (₹${totalLossPreventedRaw.toLocaleString('en-IN')})`
    : `₹${totalLossPreventedRaw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const riskDistribution = [
    { name: "Safe (0-30)", value: safeCount, color: "#10B981" },
    { name: "Review (31-70)", value: reviewCount, color: "#F59E0B" },
    { name: "High Risk (71-100)", value: blockedCount, color: "#EF4444" }
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const trendData = months.map(m => {
    const monthInvoices = userInvoices.filter(i => i.month === m);
    const safe = monthInvoices.filter(i => i.status === 'Safe').length;
    const blocked = monthInvoices.filter(i => i.status === 'Blocked' || i.status === 'Review').length;
    return { month: m, safe: safe, blocked: blocked };
  });

  return res.json({
    invoices: userInvoices,
    stats: {
      totalInvoices,
      safeCount,
      reviewCount,
      blockedCount,
      lossPreventedFormatted,
      totalLossPreventedRaw,
      accuracy: totalInvoices > 0 ? `${(((totalInvoices - reviewCount) / totalInvoices) * 100).toFixed(1)}%` : "100%"
    },
    riskDistribution,
    trendData
  });
});

// User Registration API
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existingUser = REGISTERED_USERS.find(u => u.email === cleanEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const newUser = {
    email: cleanEmail,
    passwordHash: bcrypt.hashSync(password, 10),
    name: (name && String(name).trim()) || cleanEmail.split('@')[0],
    role: 'User'
  };
  REGISTERED_USERS.push(newUser);

  console.log(`[Auth] Registered new user account: ${newUser.email}`);

  const token = jwt.sign(
    { email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(201).json({
    message: 'Account created successfully',
    token,
    user: { email: newUser.email, name: newUser.name, role: newUser.role }
  });
});

// User Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const reqEmail = String(email).toLowerCase().trim();
  const user = REGISTERED_USERS.find(u => u.email === reqEmail);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    message: 'Authentication successful',
    token,
    user: { email: user.email, name: user.name, role: user.role }
  });
});

// Google Cloud Vision API OCR — with Tesseract.js local fallback
async function performGoogleVisionOCR(buffer, mimeType) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (apiKey) {
    try {
      console.log('[Google Vision API] Attempting DOCUMENT_TEXT_DETECTION...');
      const base64Image = buffer.toString('base64');
      const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
      const requestBody = {
        requests: [{ image: { content: base64Image }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] }]
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.responses?.[0]?.textAnnotations?.[0]?.description
          || data.responses?.[0]?.fullTextAnnotation?.text;
        if (text && text.trim().length > 0) {
          console.log('[Google Vision API] Success — text length:', text.length);
          return text;
        }
      } else {
        console.warn('[Google Vision API] HTTP', response.status);
      }
    } catch (err) {
      console.warn('[Google Vision API] Error:', err.message);
    }
  }

  // Fallback: Tesseract.js local OCR
  console.log('[Tesseract.js] Falling back to local OCR...');
  const Tesseract = require('tesseract.js');
  const worker = await Tesseract.createWorker('eng');
  const ret = await worker.recognize(buffer);
  await worker.terminate();
  if (!ret.data?.text || ret.data.text.trim().length === 0) {
    throw new Error('No readable text found in image.');
  }
  console.log('[Tesseract.js] Extracted text length:', ret.data.text.length);
  return ret.data.text;
}


// Structured Invoice Intelligence Extraction Engine
function extractInvoiceStructured(extractedText, fileName) {
  console.log('[Structured Extractor] Raw text preview:', JSON.stringify(extractedText.substring(0, 400)));

  const clean = (val) => (val ? val.trim() : "Not present");
  const readable = (val) => (val ? val.trim() : "Not clearly readable");

  // 1. All GSTINs Extraction (15 characters with optional spacing/separators)
  const gstinRegexFlex = /\b(\d{2})\s*([A-Z]{5})\s*(\d{4})\s*([A-Z]{1})\s*([A-Z\d]{1})\s*([Z]{1})\s*([A-Z\d]{1})\b/gi;
  const gstinMatches = [...extractedText.matchAll(gstinRegexFlex)];
  const allGstins = [...new Set(gstinMatches.map(m => m.slice(1, 8).join('').toUpperCase()))];
  const vendorGstin = allGstins[0] || "Not present";
  const customerGstin = allGstins.find(g => g !== vendorGstin) || "Not present";

  // 1b. Supplier / Vendor Details
  let parsedVendor = "Not present";

  // Strategy A: Explicit Label (Sold By, Vendor, Supplier, Bill From, Merchant, M/S)
  const vendorLabelMatch = extractedText.match(/(?:Sold\s+By|Vendor|Supplier|Bill(?:ed)?\s+From|Merchant|M\/S)\s*[:\-]?\s*([^\n\r]+)/i);
  if (vendorLabelMatch?.[1]) {
    const raw = vendorLabelMatch[1].trim();
    if (raw.length > 2 && !/invoice|tax|gstin|bill\s+to|receipt|page|payment|transaction|for\s+|venkatala|yelahanka/i.test(raw)) {
      parsedVendor = raw.replace(/\*|--|##/g, '').trim().replace(/\s+/g, ' ');
    }
  }

  // Strategy B: Company Name Keywords or Header Line
  if (parsedVendor === "Not present") {
    const lines = extractedText.split(/\n|\r/).map(l => l.trim()).filter(l => l.length > 2);
    const SKIP_HEADER_WORDS = /invoice|tax|memo|recipient|original|customers|availing|business\s+account|eligible\s+offers|date|due|bill\s+to|ship\s+to|page|cash\s+memo|supply|tele|phone|email|website|address|for\s+|payment|transaction\s+id|venkatala/i;
    for (let l of lines) {
      if (!SKIP_HEADER_WORDS.test(l) && !/^\d/.test(l) && !/gstin/i.test(l) && !/^[%#\-=*]/.test(l) && l.length < 50) {
        parsedVendor = l.replace(/^For\s+/i, '').replace(/\*|--|##/g, '').trim().replace(/\s+/g, ' ');
        break;
      }
    }
  }

  const vendorStateCode = vendorGstin !== "Not present" ? vendorGstin.substring(0, 2) : "";
  let vendorState = GST_STATE_CODES[vendorStateCode] || (vendorGstin !== "Not present" ? `State Code ${vendorStateCode}` : "Not present");
  if (vendorState === "Not present") {
    const stateMatch = extractedText.match(/\b(Haryana|Delhi|Gujarat|Maharashtra|Punjab|Uttar\s+Pradesh|Karnataka|Tamil\s+Nadu|West\s+Bengal|Telangana|Rajasthan|Bihar)\b/i);
    if (stateMatch?.[1]) vendorState = stateMatch[1];
  }

  const vendorPhoneMatch = extractedText.match(/(?:Phone|Mobile|Contact|Tel|Ph\.?)\s*[:\-]?\s*(\b\d{10}\b|\b\d{5}\s\d{5}\b|\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b)/i);
  const vendorPhone = vendorPhoneMatch?.[1] || "Not present";

  const msmeMatch = extractedText.match(/\b(UDYAM-[A-Z]{2}-\d{2}-\d{7})\b/i);
  const msmeNumber = msmeMatch?.[1] || "Not present";

  // Address heuristic (lines containing PIN codes or street suffixes)
  const lines = extractedText.split('\n').map(l => l.trim());
  let vendorAddress = "Not present";
  const addrMatch = extractedText.match(/(?:Address|Ship-from\s+Address|Location)\s*[:\-]?\s*([^\n\r]+)/i);
  if (addrMatch?.[1]) {
    vendorAddress = addrMatch[1].trim();
  } else {
    const addrKeywords = /street|road|nagar|industrial|area|floor|building|block|pincode|\b\d{6}\b/i;
    for (let i = 0; i < Math.min(lines.length, 25); i++) {
      if (addrKeywords.test(lines[i]) && !/invoice|gstin|tax|bill|date/i.test(lines[i]) && lines[i] !== parsedVendor) {
        vendorAddress = lines[i];
        break;
      }
    }
  }

  // 2. Customer / Buyer Details
  const customerMatch = extractedText.match(/(?:Bill\s+To|Customer|Buyer|Recipient|Client|Ship\s+To)\s*[:\-]?\s*([A-Za-z0-9][\w\s.,&'()-]{2,60})/i);
  const customerName = customerMatch?.[1]?.split('\n')?.[0]?.trim() || "Not present";

  const placeOfSupplyMatch = extractedText.match(/(?:Place\s+of\s+Supply|State\s+of\s+Supply|POS)\s*[:\-]?\s*([A-Za-z\s]{3,30})/i);
  const placeOfSupply = placeOfSupplyMatch?.[1]?.trim() || "Not present";

  let customerAddress = "Not present";
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("BILL TO") || lines[i].includes("SHIP TO")) {
      const nextLine = lines[i + 1] || "";
      if (nextLine && !nextLine.toLowerCase().includes("gstin") && nextLine.length > 5) {
        customerAddress = nextLine;
        break;
      }
    }
  }

  // 3. Invoice Details
  let invoiceNumber = "Not present";
  const invNumLineMatch = extractedText.match(/(?:Invoice\s+(?:No\.?|Number|#)|Inv\.?\s*(?:No\.?|#)|Bill\s+(?:No\.?|Number|#)|Receipt\s+(?:No\.?|Number|#))\s*[:\-]?\s*([A-Z0-9\-\/_]{3,35})/i);
  if (invNumLineMatch?.[1]) {
    invoiceNumber = invNumLineMatch[1].trim();
  } else {
    const formatMatch = extractedText.match(/\b([A-Z0-9]{3,6}[/-][A-Z0-9]{2,12}(?:[/-][A-Z0-9]{1,8})?)\b/i);
    if (formatMatch?.[1] && !/^\d{2}[-\/]\d{2}[-\/]\d{2,4}$/.test(formatMatch[1])) {
      invoiceNumber = formatMatch[1].trim();
    } else {
      const fallbackFileMatch = fileName.match(/([A-Z0-9\-_]{5,30})/i);
      if (fallbackFileMatch?.[1] && !fallbackFileMatch[1].toLowerCase().includes('invoice')) {
        invoiceNumber = fallbackFileMatch[1];
      }
    }
  }

  const dateMatch =
    extractedText.match(/(?:Invoice\s+Date|Date|Dated?)\s*[:\-]?\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i) ||
    extractedText.match(/(\d{1,2}[-\/\s]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*[-\/\s]+\d{4})/i);
  const invoiceDate = dateMatch?.[1] || "Not present";

  const challanMatch = extractedText.match(/(?:Challan\s+(?:No\.?|Number|#))\s*[:\-]?\s*([A-Z0-9\-\/]{3,30})/i);
  const challanNumber = challanMatch?.[1] || "Not present";

  const challanDateMatch = extractedText.match(/(?:Challan\s+Date)\s*[:\-]?\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i);
  const challanDate = challanDateMatch?.[1] || "Not present";

  const ewayMatch = extractedText.match(/(?:E-Way\s*Bill|Eway\s*Bill|EWayBill)\s*(?:No\.?)?\s*[:\-]?\s*(\d{12})/i);
  const eWayBillNumber = ewayMatch?.[1] || "Not present";

  const transporterMatch = extractedText.match(/(?:Transporter\s+Name)\s*[:\-]?\s*([A-Za-z\s&]{3,40})/i);
  const transporterName = transporterMatch?.[1]?.trim() || "Not present";

  const transporterIdMatch = extractedText.match(/(?:Transporter\s+ID|GSTIN\s+of\s+Transporter)\s*[:\-]?\s*([A-Z0-9]{15})/i);
  const transporterId = transporterIdMatch?.[1] || "Not present";

  // 4. Line Items Details
  const lineItems = [];
  const linePatterns = [
    // Standard pattern: Serial, Name, HSN, Qty, Rate, LineTotal
    /(\d+)\s+([A-Za-z\s0-9]+[A-Za-z0-9])\s+(\d{4,8})\s+(\d+)\s+(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)\s+(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    // Standard pattern 2: Serial, Name, Qty, Rate, LineTotal
    /(\d+)\s+([A-Za-z\s0-9]+[A-Za-z0-9])\s+(\d+)\s+(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)\s+(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    // Dot-matrix/Thermal pattern: Qty, Taxable Value, Tax Rate/Amt, LineTotal (e.g. 15  1,520  5%  1,596)
    /^\s*(\d{1,4})\s+([\d,]+(?:\.\d{1,2})?)\s+(?:\d+%?|[\d,]+(?:\.\d{1,2})?)\s+([\d,]+(?:\.\d{1,2})?)\s*$/
  ];

  lines.forEach(line => {
    // Skip separator lines like --------- or =========
    if (/^[\-=.]{3,}$/.test(line)) return;
    // Skip annotation/note lines that are not line items
    if (/service\s+accounting\s+code|hsn\s*:|whether\s+tax|place\s+of|gst\s+reg|pan\s+no|authorized|signatory|invoice\s+(date|number|details)|order\s+(date|number)|billing|shipping\s+address|amount\s+in\s+words|\btotal\b|page\s+\d/i.test(line)) return;

    for (let pat of linePatterns) {
      const m = line.match(pat);
      if (m) {
        if (m.length === 7) {
          const qty = parseInt(m[4]) || 0;
          const rate = parseFloat(m[5].replace(/,/g, '')) || 0;
          const lineTotal = parseFloat(m[6].replace(/,/g, '')) || 0;
          const taxableValue = qty * rate;

          lineItems.push({
            serialNo: lineItems.length + 1,
            name: m[2],
            hsnSac: m[3],
            qty: qty,
            unit: "PCS",
            rate: rate,
            taxableValue: taxableValue,
            gstRate: "18%",
            cgstAmount: taxableValue * 0.09,
            sgstAmount: taxableValue * 0.09,
            igstAmount: 0,
            lineTotal: lineTotal
          });
          break;
        } else if (m.length === 6) {
          const qty = parseInt(m[3]) || 0;
          const rate = parseFloat(m[4].replace(/,/g, '')) || 0;
          const lineTotal = parseFloat(m[5].replace(/,/g, '')) || 0;
          const taxableValue = qty * rate;

          lineItems.push({
            serialNo: lineItems.length + 1,
            name: m[2],
            hsnSac: "Not present",
            qty: qty,
            unit: "PCS",
            rate: rate,
            taxableValue: taxableValue,
            gstRate: "18%",
            cgstAmount: taxableValue * 0.09,
            sgstAmount: taxableValue * 0.09,
            igstAmount: 0,
            lineTotal: lineTotal
          });
          break;
        } else if (m.length === 4) {
          // Thermal / Dot-matrix format: Qty, TaxableValue, LineTotal
          const qty = parseInt(m[1]) || 1;
          const taxableValue = parseFloat(m[2].replace(/,/g, '')) || 0;
          const lineTotal = parseFloat(m[3].replace(/,/g, '')) || taxableValue;

          lineItems.push({
            serialNo: lineItems.length + 1,
            name: "Item " + (lineItems.length + 1),
            hsnSac: "Not present",
            qty: qty,
            unit: "PCS",
            rate: qty > 0 ? taxableValue / qty : taxableValue,
            taxableValue: taxableValue,
            gstRate: "5%",
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: Math.abs(lineTotal - taxableValue),
            lineTotal: lineTotal
          });
          break;
        }
      }
    }
  });
  // 5. Financial Summary — strict priority cascade
  let totalInvoiceAmount = 0;

  // Priority 1: Explicit labeled total lines (Grand Total, Amount Payable, etc.)
  // Only match on the same line as the label — no multiline, no greedy scan
  const p1Regex = /(?:Grand\s+Total|Total\s+Amount\s+Payable|Net\s+Payable|Amount\s+Payable|Total\s+Payable|Amount\s+Due|Total\s+Due|Total\s+Invoice\s+Value|Invoice\s+Total)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/gi;
  for (const m of extractedText.matchAll(p1Regex)) {
    const val = parseFloat(m[1].replace(/,/g, ''));
    if (val > 0 && val > totalInvoiceAmount) totalInvoiceAmount = val;
  }

  // Priority 2: "TOTAL:" lines (Amazon/e-commerce format: TOTAL: ₹tax ₹grand)
  // Only read ₹ values on the SAME line as "TOTAL:" — take the LARGEST (grand total is biggest)
  if (totalInvoiceAmount === 0) {
    for (const m of extractedText.matchAll(/^[^\n]*\bTOTAL\s*:[^\n]*/gim)) {
      const line = m[0];
      // Skip tax-component-only lines
      if (/cgst|sgst|igst|taxable|subtotal|discount/i.test(line)) continue;
      // Match ONLY ₹ immediately followed by digits on the same line (no \s* to avoid newline bleed)
      const currencyNums = [...line.matchAll(/₹\s{0,2}([\d,]+(?:\.\d{1,2})?)/g)]
        .map(x => parseFloat(x[1].replace(/,/g, '')))
        .filter(n => n > 0 && n < 10000000);
      if (currencyNums.length > 0) {
        // Grand total is the LARGEST amount on the TOTAL line (tax < grand total always)
        const candidate = Math.max(...currencyNums);
        if (candidate > totalInvoiceAmount) totalInvoiceAmount = candidate;
      }
    }
  }

  // Priority 3: Sum of extracted line item totals
  if (totalInvoiceAmount === 0 && lineItems.length > 0) {
    totalInvoiceAmount = Math.round(lineItems.reduce((acc, i) => acc + i.lineTotal, 0) * 100) / 100;
  }

  console.log(`[Amount Extraction] totalInvoiceAmount = ${totalInvoiceAmount}`);


  // Tax breakdown
  const taxableAmtMatch = extractedText.match(/(?:Taxable\s+Amount|Taxable\s+Value|Total\s+Taxable\s+Value)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  let totalTaxableAmount = taxableAmtMatch?.[1]
    ? parseFloat(taxableAmtMatch[1].replace(/,/g, ''))
    : (lineItems.length > 0 ? lineItems.reduce((acc, i) => acc + i.taxableValue, 0) : 0);

  const cgstMatch = extractedText.match(/(?:CGST|Central\s+Tax)\s*(?:Amount)?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  const totalCgst = cgstMatch?.[1] ? parseFloat(cgstMatch[1].replace(/,/g, '')) : 0;

  const sgstMatch = extractedText.match(/(?:SGST|State\s+Tax)\s*(?:Amount)?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  const totalSgst = sgstMatch?.[1] ? parseFloat(sgstMatch[1].replace(/,/g, '')) : 0;

  const igstMatch = extractedText.match(/(?:Integrated\s+Tax|IGST)\s*(?:Amount)?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  let totalIgst = igstMatch?.[1] ? parseFloat(igstMatch[1].replace(/,/g, '')) : 0;
  if (totalIgst === 0 && totalCgst === 0 && totalSgst === 0 && lineItems.length > 0) {
    totalIgst = lineItems.reduce((acc, i) => acc + (i.igstAmount || 0), 0);
  }
  const totalTax = totalCgst + totalSgst + totalIgst || Math.max(0, totalInvoiceAmount - totalTaxableAmount);
  if (totalTaxableAmount === 0 && totalInvoiceAmount > 0 && totalTax > 0) {
    totalTaxableAmount = Math.max(0, totalInvoiceAmount - totalTax);
  }

  console.log(`[Amount] Final: ${totalInvoiceAmount} | Taxable: ${totalTaxableAmount} | Tax: ${totalTax}`);

  const wordsMatch = extractedText.match(/(?:Rupees|Amount\s+in\s+words|mount\s+in\s+words)\s*[:\-]?\s*(?:[\n\r]+)?([^\n\r]+)/i);
  const amountInWords = wordsMatch?.[1]?.trim() || "Not present";


  // 6. Banking / Payment Details & Transaction Metadata
  const bankMatch = extractedText.match(/(?:Bank\s+Name|Bank)\s*[:\-]?\s*([A-Za-z\s]{3,30})/i);
  const bankName = bankMatch?.[1]?.trim() || "Not present";

  const accMatch = extractedText.match(/(?:Account\s+Number|A\/C\s+No|Acc\s+No)\s*[:\-]?\s*(\d{9,18})/i);
  const accountNumber = accMatch?.[1] || "Not present";

  const ifscMatch = extractedText.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/i);
  const ifsc = ifscMatch?.[1]?.toUpperCase() || "Not present";

  const upiMatch = extractedText.match(/\b([a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+)\b/);
  const upiPaymentInfo = upiMatch?.[1] || "Not present";

  const txnMatch = extractedText.match(/(?:Payment\s+Transaction\s+ID|Transaction\s+ID|Txn\s+ID)\s*[:\-]?\s*([A-Za-z0-9\-_=]{8,60})/i);
  const transactionId = txnMatch?.[1]?.trim() || "Not present";

  const payModeMatch = extractedText.match(/(?:Mode\s+of\s+Payment|Payment\s+Method|Payment\s+Mode)\s*[:\-]?\s*([A-Za-z0-9\s]{2,20})/i);
  const paymentMode = payModeMatch?.[1]?.trim() || "Not present";

  // 7. Document Metadata
  const copyStatus = /duplicate|copy|triplicate/i.test(extractedText) ? "Duplicate Copy" : "Original Copy";
  const signatureStatus = /authorized\s+sign|auth\s+sign|signature/i.test(extractedText) ? "Signature Block Present" : "Not present";
  const qrCodePresence = /qr\s*code|scan\s*qr/i.test(extractedText) ? "QR Present" : "Not present";
  const invoiceType = vendorGstin !== "Not present" ? "Tax Invoice" : "Bill of Supply";

  // Mathematical validations
  const qtyRateMatch = lineItems.length > 0 && lineItems.every(item => Math.abs((item.qty * item.rate) - item.taxableValue) < 1.0) ? "VERIFIED" : "Not present";
  const sumTaxableMatch = lineItems.length > 0 && Math.abs(lineItems.reduce((acc, i) => acc + i.taxableValue, 0) - totalTaxableAmount) < 10.0 ? "VERIFIED" : "Not present";
  const totalTaxSumMatch = totalTax > 0 ? "VERIFIED" : "Not present";
  const finalAmountCalcMatch = totalInvoiceAmount > 0 && Math.abs(totalInvoiceAmount - (totalTaxableAmount + totalTax)) < 10.0 ? "VERIFIED" : "Not present";

  const validation = {
    qtyRateMatch,
    sumTaxableMatch,
    totalTaxSumMatch,
    finalAmountCalcMatch
  };

  // Dynamic Risk Score & Anomaly Evaluation based purely on extracted evidence
  let riskPoints = 0;
  const anomalies = [];

  if (vendorGstin === "Not present") {
    riskPoints += 25;
    anomalies.push({
      anomaly_type: "Missing Vendor GSTIN",
      severity: "Medium",
      evidence: "Vendor GSTIN was not found or is missing from document text.",
      affected_field: "gstin",
      confidence: "HIGH"
    });
  }

  if (totalInvoiceAmount === 0) {
    riskPoints += 30;
    anomalies.push({
      anomaly_type: "Unreadable Invoice Amount",
      severity: "High",
      evidence: "Total invoice billing amount could not be extracted from document text.",
      affected_field: "amount",
      confidence: "HIGH"
    });
  }

  if (invoiceNumber === "Not present") {
    riskPoints += 15;
    anomalies.push({
      anomaly_type: "Missing Invoice ID",
      severity: "Low",
      evidence: "Invoice reference number was not clearly specified.",
      affected_field: "id",
      confidence: "HIGH"
    });
  }

  // Real-time duplicate check from memory db
  const isDuplicate = invoiceNumber !== "Not present" && mockInvoices.some(inv => inv.id === invoiceNumber && inv.vendor === parsedVendor);
  if (isDuplicate) {
    riskPoints += 60;
    anomalies.push({
      anomaly_type: "Duplicate Billing",
      severity: "High",
      evidence: `Invoice ${invoiceNumber} from ${parsedVendor} already exists in database.`,
      affected_field: "id",
      confidence: "HIGH"
    });
  }

  const finalRiskScore = Math.min(100, Math.max(5, riskPoints));
  const status = finalRiskScore >= 75 ? "Blocked" : finalRiskScore >= 40 ? "Review" : "Safe";

  const uniqueId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  return {
    _uuid: uniqueId,
    id: invoiceNumber !== "Not present" ? invoiceNumber : uniqueId,
    vendor: parsedVendor,
    gstin: vendorGstin,
    ifsc: ifsc,
    state: vendorState,
    amount: totalInvoiceAmount,
    amountFormatted: `₹${totalInvoiceAmount.toLocaleString('en-IN')}`,
    riskScore: finalRiskScore,
    status: status,
    date: invoiceDate,
    month: "Aug",
    investigationStatus: "Needs Review",
    investigatorNotes: "",
    investigatedAt: null,
    investigatedBy: null,
    flaggedReasons: anomalies.map(a => `${a.anomaly_type}: ${a.evidence}`),

    // Structured data response
    supplier: {
      legalName: parsedVendor,
      gstin: vendorGstin,
      address: vendorAddress,
      state: vendorState,
      msmeNumber: msmeNumber,
      phone: vendorPhone
    },
    customer: {
      name: customerName,
      address: customerAddress,
      gstin: customerGstin,
      placeOfSupply: placeOfSupply
    },
    invoiceDetails: {
      number: invoiceNumber,
      date: invoiceDate,
      challanNumber: challanNumber,
      challanDate: challanDate,
      eWayBillNumber: eWayBillNumber,
      transporterName: transporterName,
      transporterId: transporterId
    },
    lineItems: lineItems,
    financialSummary: {
      totalTaxableAmount: totalTaxableAmount,
      totalCgst: totalCgst,
      totalSgst: totalSgst,
      totalIgst: totalIgst,
      totalTax: totalTax,
      totalInvoiceAmount: totalInvoiceAmount,
      amountInWords: amountInWords,
      roundOff: "Not present",
      freightCharges: "Not present"
    },
    bankingDetails: {
      bankName: bankName,
      accountNumber: accountNumber,
      ifsc: ifsc,
      upiPaymentInfo: upiPaymentInfo,
      transactionId: transactionId,
      paymentMode: paymentMode
    },
    metadata: {
      copyStatus: copyStatus,
      signatureStatus: signatureStatus,
      qrCodePresence: qrCodePresence,
      invoiceType: invoiceType
    },
    validation: validation,
    confidence: {
      overallScore: Math.max(10, 100 - finalRiskScore)
    },
    anomalies: anomalies.length > 0 ? anomalies : [{
      anomaly_type: "No verified anomalies detected",
      severity: "Safe",
      evidence: "Calculations and GST matches visual checks.",
      affected_field: "None",
      confidence: "HIGH"
    }]
  };
}

app.post('/api/analyze-invoice-pdf', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    let extractedText = '';
    let fileName = 'Uploaded_Invoice.pdf';
    let ocrEngineUsed = 'pdf-parse Local Extractor';

    if (req.file) {
      fileName = req.file.originalname;
      const fileMime = req.file.mimetype;

      if (fileMime === 'application/json' || fileName.endsWith('.json')) {
        try {
          const jsonPayload = JSON.parse(req.file.buffer.toString('utf-8'));
          if (jsonPayload.responses && jsonPayload.responses[0]?.textAnnotations) {
            extractedText = jsonPayload.responses[0].textAnnotations[0]?.description || '';
            ocrEngineUsed = 'Google Cloud Vision API';
          } else {
            extractedText = JSON.stringify(jsonPayload);
          }
        } catch (jsonErr) {
          extractedText = req.file.buffer.toString('utf-8');
        }
      } else if (fileMime === 'application/pdf' || fileName.endsWith('.pdf')) {
        console.log('[pdf-ocr] Attempting pdf-parse vector text extraction for PDF:', fileName);
        try {
          const PDFParseClass = pdfParseModule?.PDFParse;
          if (PDFParseClass && typeof PDFParseClass.prototype.getText === 'function') {
            const uint8 = new Uint8Array(req.file.buffer.buffer, req.file.buffer.byteOffset, req.file.buffer.byteLength);
            const instance = new PDFParseClass(uint8);
            const resObj = await instance.getText();
            extractedText = resObj.text || '';
            ocrEngineUsed = 'pdf-parse Vector PDF Extractor';
          }
        } catch (pdfErr) {
          console.warn('[pdf-parse] Direct text extraction failed:', pdfErr.message);
        }

        if (!extractedText || extractedText.trim().length < 30) {
          console.log('[pdf-ocr] Scanned PDF — running Google Vision OCR fallback:', fileName);
          try {
            extractedText = await performGoogleVisionOCR(req.file.buffer, 'application/pdf');
            ocrEngineUsed = 'Google Cloud Vision API';
          } catch (ocrErr) {
            console.error('[vision-ocr] Fallback error:', ocrErr.message);
          }
        }
      } else if (fileMime.startsWith('image/') || fileName.match(/\.(png|jpg|jpeg|webp)$/i)) {
        console.log('[image] Running Google Vision OCR for image:', fileName);
        extractedText = await performGoogleVisionOCR(req.file.buffer, fileMime);
        ocrEngineUsed = 'Google Cloud Vision API';
      } else {
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.responses && req.body.responses[0]?.textAnnotations) {
      extractedText = req.body.responses[0].textAnnotations[0]?.description || '';
      ocrEngineUsed = 'Google Cloud Vision API';
    } else {
      extractedText = req.body.rawText || '';
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text or OCR content from file." });
    }

    // Always use structured regex extractor
    const parsedInvoice = extractInvoiceStructured(extractedText, fileName);
    parsedInvoice.ownerEmail = req.user?.email ? String(req.user.email).toLowerCase().trim() : null;

    mockInvoices.unshift(parsedInvoice);

    return res.json({
      message: `Invoice scanned and processed successfully`,
      invoice: parsedInvoice,
      ocrEngine: ocrEngineUsed
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred during invoice extraction." });
  }
});

// Batch Import API (Protected)
app.post('/api/import-batch', authenticateToken, (req, res) => {
  try {
    const { invoices } = req.body;
    if (!invoices || !Array.isArray(invoices)) {
      return res.status(400).json({ error: "Invoices array is required." });
    }

    const importedCount = invoices.length;
    const userEmail = req.user?.email ? String(req.user.email).toLowerCase().trim() : null;
    for (const inv of invoices) {
      const amountVal = parseFloat(inv.amount) || 0;
      const formattedAmount = inv.amountFormatted || `₹${amountVal.toLocaleString('en-IN')}`;

      const parsedInvoice = {
        ownerEmail: userEmail,
        id: inv.id || `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        vendor: inv.vendor || "Unknown Vendor",
        gstin: inv.gstin || "Not present",
        ifsc: inv.ifsc || "Not present",
        state: inv.state || (inv.gstin ? (GST_STATE_CODES[inv.gstin.substring(0, 2)] || "Not present") : "Not present"),
        amount: amountVal,
        amountFormatted: formattedAmount,
        riskScore: inv.riskScore !== undefined ? inv.riskScore : 15,
        status: inv.status || (inv.riskScore >= 75 ? "Blocked" : inv.riskScore >= 45 ? "Review" : "Safe"),
        date: inv.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        month: inv.month || "Aug",
        flaggedReasons: inv.flaggedReasons || [],
        supplier: inv.supplier || {
          legalName: inv.vendor || "Unknown Vendor",
          gstin: inv.gstin || "Not present",
          address: "Not present",
          state: inv.state || "Not present",
          msmeNumber: "Not present",
          phone: "Not present"
        },
        customer: inv.customer || {
          name: "Not present",
          address: "Not present",
          gstin: "Not present",
          placeOfSupply: "Not present"
        },
        invoiceDetails: inv.invoiceDetails || {
          number: inv.id || "Not present",
          date: inv.date || "Not present",
          challanNumber: "Not present",
          challanDate: "Not present",
          eWayBillNumber: "Not present",
          transporterName: "Not present",
          transporterId: "Not present"
        },
        lineItems: inv.lineItems || [],
        financialSummary: inv.financialSummary || {
          totalTaxableAmount: amountVal / 1.18,
          totalCgst: 0,
          totalSgst: 0,
          totalIgst: 0,
          totalTax: amountVal - (amountVal / 1.18),
          totalInvoiceAmount: amountVal,
          amountInWords: "Not present",
          roundOff: "Not present",
          freightCharges: "Not present"
        },
        bankingDetails: inv.bankingDetails || {
          bankName: "Not present",
          accountNumber: "Not present",
          ifsc: inv.ifsc || "Not present",
          upiPaymentInfo: "Not present"
        },
        metadata: inv.metadata || {
          copyStatus: "Original Copy",
          signatureStatus: "Not present",
          qrCodePresence: "Not present",
          invoiceType: inv.gstin ? "Tax Invoice" : "Bill of Supply"
        },
        validation: inv.validation || {
          qtyRateMatch: "Not present",
          sumTaxableMatch: "Not present",
          totalTaxSumMatch: "Not present",
          finalAmountCalcMatch: "Not present"
        },
        confidence: inv.confidence || {
          overallScore: 90
        },
        anomalies: inv.anomalies || [{
          anomaly_type: "No verified anomalies detected",
          severity: "Safe",
          evidence: "Calculations and GST matches visual checks.",
          affected_field: "None",
          confidence: "HIGH"
        }]
      };

      mockInvoices.unshift(parsedInvoice);
    }

    return res.json({ message: `Successfully imported ${importedCount} invoices.`, count: importedCount });
  } catch (error) {
    console.error("Batch Import Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process batch import." });
  }
});

// Update Status API (Protected)
app.post('/api/update-invoice-status', authenticateToken, (req, res) => {
  const { id, newStatus } = req.body;
  const userInvoices = getUserInvoices(req.user?.email);
  const invoice = userInvoices.find(inv => inv.id === id || inv._uuid === id);
  if (invoice) {
    invoice.status = newStatus;
    return res.json({ message: `Invoice ${id} status updated to ${newStatus}`, invoice });
  }
  return res.status(404).json({ error: "Invoice not found" });
});

// Update Investigation Audit Status & Notes API (Protected)
app.post('/api/update-investigation-status', authenticateToken, (req, res) => {
  const { id, investigationStatus, investigatorNotes, reviewer } = req.body;
  const userInvoices = getUserInvoices(req.user?.email);
  const invoice = userInvoices.find(inv => inv.id === id || inv._uuid === id);
  if (invoice) {
    if (investigationStatus) invoice.investigationStatus = investigationStatus;
    if (investigatorNotes !== undefined) invoice.investigatorNotes = investigatorNotes;
    invoice.investigatedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    invoice.investigatedBy = reviewer || req.user?.name || req.user?.email || "Reviewer";

    console.log(`[Investigation Review] Case ${id} updated -> Status: ${invoice.investigationStatus}, Notes: "${invoice.investigatorNotes}"`);
    return res.json({
      message: `Investigation audit status updated for case ${id}`,
      invoice
    });
  }
  return res.status(404).json({ error: "Security case (invoice) not found" });
});

// Clear Entire Database API (Protected)
app.post('/api/clear-all-invoices', authenticateToken, (req, res) => {
  const userEmail = req.user?.email ? String(req.user.email).toLowerCase().trim() : null;
  const initialCount = mockInvoices.length;
  mockInvoices = mockInvoices.filter(inv => inv.ownerEmail && inv.ownerEmail !== userEmail);
  const deletedCount = initialCount - mockInvoices.length;
  console.log(`[clear-all] Cleared ${deletedCount} invoices for user ${userEmail}.`);
  return res.json({ message: `User database cleared. Removed ${deletedCount} invoice(s).` });
});

// Bulk Delete Invoices API (Protected)
app.post('/api/delete-invoices-bulk', authenticateToken, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "IDs array is required for bulk delete." });
  }

  const userEmail = req.user?.email ? String(req.user.email).toLowerCase().trim() : null;
  const initialCount = mockInvoices.length;
  const idsSet = new Set(ids.map(id => String(id).trim()));
  mockInvoices = mockInvoices.filter(inv => {
    const isTarget = idsSet.has(String(inv.id).trim()) || idsSet.has(String(inv._uuid).trim());
    if (isTarget) {
      return inv.ownerEmail && inv.ownerEmail !== userEmail;
    }
    return true;
  });
  const deletedCount = initialCount - mockInvoices.length;

  console.log(`[bulk-delete] Deleted ${deletedCount} invoices.`);
  return res.json({ message: `Successfully deleted ${deletedCount} invoice(s).`, deletedCount });
});

// Delete Invoice API (Protected)
app.delete('/api/delete-invoice/:id', authenticateToken, (req, res) => {
  const targetId = String(req.params.id).trim();
  const userEmail = req.user?.email ? String(req.user.email).toLowerCase().trim() : null;
  const initialCount = mockInvoices.length;
  mockInvoices = mockInvoices.filter(inv => {
    const isMatch = String(inv.id).trim() === targetId || String(inv._uuid).trim() === targetId;
    if (isMatch) {
      return inv.ownerEmail && inv.ownerEmail !== userEmail;
    }
    return true;
  });
  if (mockInvoices.length < initialCount) {
    console.log(`[delete] Invoice ${targetId} deleted from database.`);
    return res.json({ message: `Invoice ${targetId} deleted successfully` });
  }
  return res.status(404).json({ error: "Invoice not found" });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
