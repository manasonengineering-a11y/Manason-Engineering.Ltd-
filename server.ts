import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

// ==========================================
// ADMIN SESSION SECURITY
// ==========================================
// Only ONE active admin session is allowed at a time. Logging in again
// (from any device/browser) immediately invalidates the previous session.
const ADMIN_SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware: protects every admin-only route. Requires a valid,
// non-expired session token that matches the token currently stored
// on the Admin user's record (set at login time).
function requireAdminSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.header('x-admin-token');
  if (!token) {
    return res.status(401).json({ error: 'Ntabwo winjiye nka Admin. Ongera winjire.', code: 'NO_TOKEN' });
  }
  const db = readDB();
  const admin = db.users.find((u: any) => u.type === 'Admin' && u.sessionToken === token);
  if (!admin) {
    return res.status(401).json({ error: 'Umwanya wawe wo kwinjira ntukiri ho (wenda hari uwinjiye ahandi). Ongera winjire.', code: 'INVALID_SESSION' });
  }
  if (!admin.sessionExpiry || Date.now() > admin.sessionExpiry) {
    return res.status(401).json({ error: 'Igihe cyawe cyo kwinjira kirarangiye. Ongera winjire.', code: 'SESSION_EXPIRED' });
  }
  (req as any).adminUser = admin;
  next();
}

app.use(express.json({ limit: '70mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client successfully initialized.');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

// Initialize Local JSON Database Path
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Make sure src/data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Seed Initial Data if file doesn't exist
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_JOBS, INITIAL_QUOTES, INITIAL_MESSAGES, INITIAL_CONSULTANCY } from './src/data/mockData.js';

interface DatabaseSchema {
  users: any[];
  products: any[];
  jobs: any[];
  quotes: any[];
  messages: any[];
  consultancies: any[];
  dispatches: any[];
  brochures?: any[];
  homepage?: any;
  projects?: any[];
  clientRequests?: any[];
  settings?: any;
  advertisements?: any[];
  auditLogs?: any[];
  jobPostings?: any[];
}

const DEFAULT_SETTINGS = {
  companyName: 'Manason Engineering Ltd',
  contactEmail: 'manasonengineering@gmail.com',
  email: 'manasonengineering@gmail.com', // alias — the frontend reads settings.email
  whatsappNumber: '+250785647676',
  whatsapp: '+250785647676', // alias — the frontend reads settings.whatsapp
  phoneNumber: '+250785647676',
  phone: '+250785647676', // alias — the frontend reads settings.phone
  officeAddress: 'KN 4 Rd, Remera Sector, Gasabo District, Kigali, Rwanda',
  googleMapsLocation: 'https://maps.google.com/?q=-1.9547,30.0824',
  isMaintenanceMode: false,
  maintenanceMessage: 'Manason Engineering platform is currently undergoing scheduled upgrade. Please check back shortly.',
  supportedCurrencies: ['RWF', 'USD', 'EUR'],
  activeCurrency: 'RWF',
  logoUrl: '',
};

const DEFAULT_ADVERTISEMENTS = [
  {
    id: 'ad-1',
    companyName: 'Ruliba Clays Ltd',
    title: '15% Off Eco-Friendly Roof Tiles',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400',
    contactInfo: 'https://wa.me/250788000000',
    status: 'approved',
    isMadeInRwanda: true,
    createdAt: '2026-07-01T12:00:00Z'
  },
  {
    id: 'ad-2',
    companyName: 'Ameki Paints',
    title: 'Exterior Shield WeatherGuard Promo',
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400',
    contactInfo: 'https://wa.me/250788311222',
    status: 'approved',
    isMadeInRwanda: true,
    createdAt: '2026-07-02T10:30:00Z'
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'audit-1',
    userId: 'u-admin',
    userName: 'Manason Admin',
    action: 'System Boot',
    timestamp: '2026-07-07T00:00:00Z',
    details: 'Manason Engineering Version 2 Platform initialized successfully.'
  }
];

const DEFAULT_BROCHURES = [
  { id: 'b-1', name: 'Ruliba Clays Sustainable Clay Products.pdf', category: 'Bricks & Tiles', size: '2.4 MB', downloadCount: 142, updatedAt: '2026-06-15' },
  { id: 'b-2', name: 'Cimerwa Cement Structural Strength Guide.pdf', category: 'Cement', size: '1.8 MB', downloadCount: 389, updatedAt: '2026-05-10' },
  { id: 'b-3', name: 'Ameki Color Paints Exterior Shield Catalog.pdf', category: 'Paints & Finishes', size: '3.1 MB', downloadCount: 255, updatedAt: '2026-06-20' }
];

const DEFAULT_HOMEPAGE = {
  announcement: 'Rwandan Builders Trade Audit is Live! All Technical specialists can now submit certifications for free Admin review.',
  bannerTitle: "Rwanda's Direct Construction Hub",
  bannerSubtitle: 'Hire vetted Rwandan construction technicians, purchase factory-direct materials, and manage projects in a single secure escrow ledger.',
  promotions: [
    { id: 'p1', title: 'Cimerwa Bulk Promo', text: '10% off on orders above 50 bags of 42.5R Cement!' },
    { id: 'p2', title: 'Ruliba Clay Tiles Special', text: 'Free delivery in Kigali on Ruliba roof tile orders this month!' }
  ]
};

const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    title: "Kigali Corporate Tower Cladding",
    category: "COMMERCIAL",
    contractor: "Kigali Builders Ltd",
    description: "Structural facade reinforcement and high-performance safety glazing matching international building codes.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
  },
  {
    id: "proj-2",
    title: "Modern Villa Retaining Stone Facade",
    category: "RESIDENTIAL",
    contractor: "Stone masonry by Musanze Co-op",
    description: "Engineered volcanic facing retaining walls in hilly terrains providing premium security, erosion management, and aesthetic values.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069"
  },
  {
    id: "proj-3",
    title: "Bugarama Drainage Framework",
    category: "CIVIL/INFRASTRUCTURE",
    contractor: "Cement from CIMERWA Plc",
    description: "Heavy-duty, high-strength structural concrete canals providing clean storm water management in Rusizi District.",
    imageUrl: "https://images.unsplash.com/photo-1503387762-592dedb8ee31?q=80&w=2070"
  }
];

const DEFAULT_CLIENT_REQUESTS = [
  {
    id: 'req-1',
    type: 'contact',
    clientName: 'Jean Bosco',
    clientEmail: 'bosco@gmail.com',
    clientPhone: '+250 788 456 123',
    title: 'Escrow Dispute Help',
    details: 'Need administrative assistance regarding job contract completion validation for j-123.',
    isRead: false,
    createdAt: '2026-07-05T14:30:00Z'
  },
  {
    id: 'req-2',
    type: 'quote',
    clientName: 'Alice Mutoni',
    clientEmail: 'alice@gmail.com',
    clientPhone: '+250 783 111 222',
    title: 'Cimerwa Cement Bulk Quotation',
    details: 'Please quote delivery cost for 120 bags to Gisenyi warehouse.',
    isRead: false,
    createdAt: '2026-07-05T16:45:00Z'
  }
];

function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDB: DatabaseSchema = {
        users: INITIAL_USERS,
        products: INITIAL_PRODUCTS,
        jobs: INITIAL_JOBS,
        quotes: INITIAL_QUOTES,
        messages: INITIAL_MESSAGES,
        consultancies: INITIAL_CONSULTANCY,
        dispatches: [],
        brochures: DEFAULT_BROCHURES,
        homepage: DEFAULT_HOMEPAGE,
        projects: DEFAULT_PROJECTS,
        clientRequests: DEFAULT_CLIENT_REQUESTS,
        settings: DEFAULT_SETTINGS,
        advertisements: DEFAULT_ADVERTISEMENTS,
        auditLogs: DEFAULT_AUDIT_LOGS,
        jobPostings: []
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
      return initialDB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    let modified = false;
    if (!db.brochures) {
      db.brochures = DEFAULT_BROCHURES;
      modified = true;
    }
    if (!db.homepage) {
      db.homepage = DEFAULT_HOMEPAGE;
      modified = true;
    }
    if (!db.projects) {
      db.projects = DEFAULT_PROJECTS;
      modified = true;
    }
    if (!db.clientRequests) {
      db.clientRequests = DEFAULT_CLIENT_REQUESTS;
      modified = true;
    }
    if (!db.settings) {
      db.settings = DEFAULT_SETTINGS;
      modified = true;
    } else {
      // Migration: older saved settings may be missing the phone/whatsapp/email
      // aliases the frontend reads. Fill in anything missing without
      // overwriting values the Admin has already customized.
      const merged = { ...DEFAULT_SETTINGS, ...db.settings };
      if (JSON.stringify(merged) !== JSON.stringify(db.settings)) {
        db.settings = merged;
        modified = true;
      }
    }
    if (!db.advertisements) {
      db.advertisements = DEFAULT_ADVERTISEMENTS;
      modified = true;
    }
    if (!db.auditLogs) {
      db.auditLogs = DEFAULT_AUDIT_LOGS;
      modified = true;
    }
    if (!db.jobPostings) {
      db.jobPostings = [];
      modified = true;
    }
    // Security migration: any Admin account that has no password set
    // (from the old insecure version) gets the default password so the
    // owner is not locked out. They should change it immediately from
    // Dashboard > Security.
    (db.users || []).forEach((u: any) => {
      if (u.type === 'Admin' && !u.password) {
        u.password = 'Manason@2026!';
        modified = true;
      }
    });
    if (modified) {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (error) {
    console.error('Error reading local db.json', error);
    return { 
      users: [], products: [], jobs: [], quotes: [], messages: [], 
      consultancies: [], dispatches: [], brochures: [], homepage: {}, 
      projects: [], clientRequests: [], settings: DEFAULT_SETTINGS, 
      advertisements: DEFAULT_ADVERTISEMENTS, auditLogs: DEFAULT_AUDIT_LOGS,
      jobPostings: []
    };
  }
}

function logAction(userId: string, userName: string, action: string, details: string) {
  try {
    const db = readDB();
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId,
      userName,
      action,
      timestamp: new Date().toISOString(),
      details
    });
    writeDB(db);
  } catch (err) {
    console.error('Failed to log action:', err);
  }
}

function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to local db.json', error);
  }
  // Fire-and-forget backup to Supabase, so data survives Render restarts
  // (Render's free-tier disk is ephemeral and resets on every restart).
  backupDBToSupabase(data).catch(err =>
    console.warn('Supabase DB backup failed (data is still safe locally for now):', err?.message || err)
  );
}

// ==========================================
// PERSISTENT STORAGE ACROSS RESTARTS (Supabase)
// ==========================================
// Render's free tier wipes the local disk on every restart/redeploy. To
// avoid losing all users, jobs, products, etc., the full database is backed
// up to a Supabase table on every write, and restored from there the moment
// the server boots — BEFORE it starts accepting any requests.
//
// Requires this one-time SQL run in the Supabase SQL Editor:
//   create table if not exists app_state (
//     id text primary key,
//     data jsonb not null,
//     updated_at timestamptz default now()
//   );
async function backupDBToSupabase(data: DatabaseSchema) {
  if (!supabase) return;
  await supabase
    .from('app_state')
    .upsert({ id: 'main', data, updated_at: new Date().toISOString() });
}

async function restoreDBFromSupabase() {
  if (!supabase) {
    console.log('[STARTUP] Supabase not configured — using local disk only (data will NOT survive restarts).');
    return;
  }
  try {
    const { data: row, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('id', 'main')
      .single();

    if (error || !row?.data) {
      console.log('[STARTUP] No prior backup found in Supabase yet — starting fresh.');
      return;
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(row.data, null, 2), 'utf-8');
    console.log('[STARTUP] Restored database from Supabase backup — all previous data recovered.');
  } catch (err: any) {
    console.warn('[STARTUP] Could not restore from Supabase, using local disk/defaults:', err?.message || err);
  }
}

// Resilient double-save and sync helpers for Supabase database integration
async function saveToSupabase(request: any) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('client_requests')
      .upsert({
        id: request.id,
        type: request.type,
        client_name: request.clientName,
        client_email: request.clientEmail,
        client_phone: request.clientPhone,
        title: request.title,
        details: request.details,
        budget: request.budget || null,
        additional_info: request.additionalInfo || {},
        is_read: request.isRead,
        admin_reply: request.adminReply || null,
        replied_at: request.repliedAt || null,
        created_at: request.createdAt
      });
    if (error) {
      console.warn('Supabase DB save warning (ignoring and proceeding with local DB):', error);
    } else {
      console.log('Successfully saved to Supabase:', request.id);
    }
  } catch (err) {
    console.warn('Failed to save to Supabase (ignoring and proceeding with local DB):', err);
  }
}

async function syncSupabaseRequests(db: DatabaseSchema) {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      const synced = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        clientName: item.client_name,
        clientEmail: item.client_email,
        clientPhone: item.client_phone,
        title: item.title,
        details: item.details,
        budget: item.budget,
        additionalInfo: item.additional_info,
        isRead: item.is_read,
        adminReply: item.admin_reply,
        repliedAt: item.replied_at,
        createdAt: item.created_at
      }));

      // Merge local with Supabase (prioritizing Supabase)
      const mergedMap = new Map();
      (db.clientRequests || []).forEach(r => mergedMap.set(r.id, r));
      synced.forEach(r => mergedMap.set(r.id, r));
      db.clientRequests = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.warn('Failed to sync requests from Supabase (ignoring and using local DB):', err);
  }
}

// Initialize Gemini Client
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (aiApiKey) {
  aiClient = new GoogleGenAI({ apiKey: aiApiKey });
}

// Utility to create/save notifications/alerts
function triggerServerDispatch(db: DatabaseSchema, type: 'WhatsApp' | 'SMS' | 'Email' | 'Platform', recipient: string, content: string) {
  const newDispatch = {
    id: `disp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    recipient,
    content,
    timestamp: new Date().toLocaleTimeString()
  };
  db.dispatches = [newDispatch, ...(db.dispatches || [])];

  // Fire real messages in the background when credentials are configured.
  // This never blocks the request or crashes it if the send fails —
  // failures are just logged, and the in-app dispatch log above still works
  // as a record either way.
  if (type === 'Email' && recipient.includes('@')) {
    sendRealEmail(recipient, 'MANASON ENGINEERING', content).catch(err =>
      console.warn('Resend email send failed:', err?.message || err)
    );
  } else if (type === 'WhatsApp') {
    sendRealWhatsApp(recipient, content).catch(err =>
      console.warn('WhatsApp send failed:', err?.message || err)
    );
  }

  return db;
}

// ==========================================
// REAL EMAIL (Resend)
// ==========================================
// Set RESEND_API_KEY (and optionally RESEND_FROM_EMAIL) in Render's
// environment variables to activate real email sending. Without a key,
// emails are simply recorded in the in-app dispatch log (simulation mode)
// and nothing breaks.
async function sendRealEmail(to: string, subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Simulation mode — no key configured yet.
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'MANASON ENGINEERING <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html: `<div style="font-family: sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6;">
        <p>${body.replace(/\n/g, '<br/>')}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">MANASON ENGINEERING — Rwanda's Complete Construction Marketplace</p>
      </div>`
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errText}`);
  }
}

// ==========================================
// REAL WHATSAPP (Meta WhatsApp Cloud API)
// ==========================================
// Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Render's
// environment variables once your Meta Business/WhatsApp verification is
// approved, to activate real WhatsApp sending. Without these, messages
// are simply recorded in the in-app dispatch log (simulation mode).
async function sendRealWhatsApp(toPhoneRaw: string, message: string) {
  // Accept either env var name — some hosting dashboards (e.g. Render onboarding flows)
  // may have this saved as WHATSAPP_KEY instead of WHATSAPP_ACCESS_TOKEN.
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return; // Simulation mode — not verified with Meta yet.

  // WhatsApp Cloud API requires E.164 format without the leading '+'.
  const toPhone = toPhoneRaw.replace(/[^\d]/g, '');
  if (!toPhone) return;

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'text',
      text: { body: message }
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp Cloud API error (${res.status}): ${errText}`);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Authentication: Login
app.post('/api/auth/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const db = readDB();
  const user = db.users.find(
    u => u.email?.toLowerCase() === emailOrPhone.trim().toLowerCase() || u.phone === emailOrPhone.trim()
  );

  if (user) {
    // STRICT PASSWORD ENFORCEMENT — no backdoors, no bypasses.
    if (user.type === 'Admin') {
      if (!user.password) {
        return res.status(401).json({ error: 'Konti ya Admin ntabwo ifite password yashyizweho. Vugana n\'uwayishinze sisitemu.' });
      }
      if (!password || password !== user.password) {
        return res.status(401).json({ error: 'Password ya Admin siyo.' });
      }
    } else if (user.password && (!password || user.password !== password)) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    let sessionToken: string | undefined;
    if (user.type === 'Admin') {
      // Issue a brand-new session token. Any session token issued earlier
      // (e.g. to another device/browser) is immediately invalidated,
      // since only ONE token is stored per admin at a time.
      sessionToken = generateSessionToken();
      user.sessionToken = sessionToken;
      user.sessionExpiry = Date.now() + ADMIN_SESSION_DURATION_MS;
      logAction(user.id, user.name, 'Admin Login', 'Admin session started. Any previous session was invalidated.');
    } else {
      triggerServerDispatch(db, 'Platform', user.name, `Welcome back! Logged in as ${user.type}.`);
      logAction(user.id, user.name, 'Login', `User logged in as ${user.type}.`);
    }
    writeDB(db);

    // Never send the password hash/value back to the client.
    const { password: _pw, ...safeUser } = user;
    return res.json({ success: true, user: safeUser, adminToken: sessionToken });
  }

  return res.status(401).json({ error: 'Profile not found. Please register.' });
});

// Authentication: Logout (clears the admin's active session token)
app.post('/api/auth/logout', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.json({ success: true });
  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId);
  if (user && user.type === 'Admin') {
    user.sessionToken = null;
    user.sessionExpiry = null;
    writeDB(db);
    logAction(user.id, user.name, 'Admin Logout', 'Admin session ended.');
  }
  res.json({ success: true });
});

// Authentication: Verify an admin session is still the active one
// (used by the client to detect if it was logged out because someone
// else logged in elsewhere, or because the session expired).
app.post('/api/auth/verify-session', (req, res) => {
  const { userId, token } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId && u.type === 'Admin');
  if (!user || user.sessionToken !== token || !user.sessionExpiry || Date.now() > user.sessionExpiry) {
    return res.status(401).json({ valid: false });
  }
  res.json({ valid: true });
});

// Authentication: Admin changes their own password
app.post('/api/auth/change-password', requireAdminSession, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Ushyiremo password ya kera n\'iyishya.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password nshya igomba kuba nibura inyuguti 8.' });
  }
  const db = readDB();
  const admin = db.users.find((u: any) => u.id === (req as any).adminUser.id);
  if (!admin || admin.password !== currentPassword) {
    return res.status(401).json({ error: 'Password ya kera siyo.' });
  }
  admin.password = newPassword;
  // Force re-login everywhere after a password change, for safety.
  admin.sessionToken = generateSessionToken();
  admin.sessionExpiry = Date.now() + ADMIN_SESSION_DURATION_MS;
  writeDB(db);
  logAction(admin.id, admin.name, 'Change Password', 'Admin changed their password.');
  res.json({ success: true, adminToken: admin.sessionToken });
});

// Authentication: Register
app.post('/api/auth/register', (req, res) => {
  const fields = req.body;
  if (!fields.name || !fields.email || !fields.phone || !fields.type) {
    return res.status(400).json({ error: 'Required fields missing: name, email, phone, type.' });
  }
  if (fields.type === 'Admin') {
    return res.status(403).json({ error: 'Ntushobora kwiyandikisha nka Admin.' });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.email?.toLowerCase() === fields.email.toLowerCase() || u.phone === fields.phone);
  if (existingUser) {
    return res.status(400).json({ error: 'A profile with this email or phone already exists.' });
  }

  const newUser = {
    ...fields,
    id: `u-${Date.now()}`,
    registrationDate: new Date().toISOString().split('T')[0],
    isVerified: fields.type === 'Client' ? true : false, // Clients auto-verified, others verified by admin
    avatarUrl: fields.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  db.users.push(newUser);
  triggerServerDispatch(db, 'Platform', newUser.name, `Welcome to Manason Engineering! Profile registered.`);
  triggerServerDispatch(db, 'Email', newUser.email, `Hello ${newUser.name}, welcome to MANASON ENGINEERING, Rwanda's Complete Construction Marketplace.`);
  triggerServerDispatch(db, 'SMS', newUser.phone, `Welcome to Manason Engineering! Login anytime with your credentials.`);

  writeDB(db);
  logAction(newUser.id, newUser.name, 'Register', `User registered as ${newUser.type}.`);
  const { password: _pw, ...safeNewUser } = newUser;
  res.status(210).json({ success: true, user: safeNewUser });
});

// Users List
app.get('/api/users', (req, res) => {
  const db = readDB();
  // Never expose password fields in the public users list.
  const safeUsers = (db.users || []).map((u: any) => {
    const { password, sessionToken, sessionExpiry, ...safe } = u;
    return safe;
  });
  res.json(safeUsers);
});

// Verify Professional (Admin-only)
app.post('/api/admin/verify-user', requireAdminSession, (req, res) => {
  const { userId } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    db.users[userIndex].isVerified = true;
    triggerServerDispatch(db, 'Platform', db.users[userIndex].name, `Your technical credentials have been verified by Manason Admin.`);
    triggerServerDispatch(db, 'SMS', db.users[userIndex].phone, `CONGRATULATIONS: Manason Admin reviewed and verified your license and profile.`);
    writeDB(db);
    return res.json({ success: true, user: db.users[userIndex] });
  }
  return res.status(404).json({ error: 'User not found.' });
});

// Products List
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// Submit Quote Request
app.post('/api/quotes', (req, res) => {
  const { clientId, clientName, productId, productName, supplierId, supplierName, details } = req.body;
  if (!clientId || !productId || !details) {
    return res.status(400).json({ error: 'Missing parameters.' });
  }

  const db = readDB();
  const newQuote = {
    id: `q-${Date.now()}`,
    clientId,
    clientName,
    productId,
    productName,
    supplierId,
    supplierName,
    details,
    isRepliedByAdmin: false,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.quotes.push(newQuote);
  triggerServerDispatch(db, 'Platform', 'Admin', `New product quotation request submitted by ${clientName} for ${productName}.`);
  triggerServerDispatch(db, 'Email', 'manasonengineering@gmail.com', `QUOTATION REQUEST: User ${clientName} requested pricing on ${productName}: "${details}".`);
  // Notify Admin's own phone directly so they see it even if not logged into the dashboard.
  const adminUser = db.users.find((u: any) => u.type === 'Admin');
  if (adminUser?.phone) {
    triggerServerDispatch(db, 'WhatsApp', adminUser.phone, `Ubwo bushya bwo kubaza ikiguzi: ${clientName} arashaka igiciro cya "${productName}". Injira muri Dashboard umusubize.`);
  }
  
  // Log as a unified client request
  const clientUser = db.users.find(u => u.id === clientId);
  const clientEmail = clientUser ? clientUser.email : 'guest@manason.engineering';
  const clientPhone = clientUser ? clientUser.phone : '+250 788 000 000';
  createAndSaveClientRequest(
    db,
    'quote',
    clientName,
    clientEmail,
    clientPhone,
    `Quotation Request: ${productName}`,
    details,
    '',
    { quoteId: newQuote.id, productId, productName }
  );

  writeDB(db);
  res.json({ success: true, quote: newQuote });
});

// Reply Quote (Admin-only)
app.post('/api/admin/reply-quote', requireAdminSession, (req, res) => {
  const { quoteId, price } = req.body;
  if (!quoteId || !price) {
    return res.status(400).json({ error: 'Quote ID and price required.' });
  }

  const db = readDB();
  const quoteIndex = db.quotes.findIndex(q => q.id === quoteId);
  if (quoteIndex !== -1) {
    const q = db.quotes[quoteIndex];
    q.priceOfferedByAdmin = Number(price);
    q.isRepliedByAdmin = true;
    q.status = 'replied';

    triggerServerDispatch(db, 'Platform', q.clientName, `Admin replied to your quote request on ${q.productName}. Custom Price: ${price.toLocaleString()} RWF.`);
    
    const client = db.users.find(u => u.id === q.clientId);
    if (client) {
      triggerServerDispatch(db, 'SMS', client.phone, `MANASON QUOTE: Your request for "${q.productName}" was answered with custom rate: ${price.toLocaleString()} RWF.`);
    }

    writeDB(db);
    return res.json({ success: true, quote: q });
  }
  return res.status(404).json({ error: 'Quotation request not found.' });
});

// Approve Quote by Client
app.post('/api/quotes/approve', (req, res) => {
  const { quoteId } = req.body;
  const db = readDB();
  const quoteIndex = db.quotes.findIndex(q => q.id === quoteId);
  if (quoteIndex !== -1) {
    db.quotes[quoteIndex].status = 'approved';
    triggerServerDispatch(db, 'Platform', 'System', `Client approved pricing on ${db.quotes[quoteIndex].productName}. Awaiting final payment.`);
    writeDB(db);
    return res.json({ success: true, quote: db.quotes[quoteIndex] });
  }
  return res.status(404).json({ error: 'Quotation not found.' });
});

// Get Quotes
app.get('/api/quotes', (req, res) => {
  const db = readDB();
  res.json(db.quotes);
});

// Get Jobs
app.get('/api/jobs', (req, res) => {
  const db = readDB();
  res.json(db.jobs);
});

// Create Job Contract (Hire Worker)
app.post('/api/jobs', (req, res) => {
  const jobFields = req.body;
  if (!jobFields.clientId || !jobFields.workerId || !jobFields.price || !jobFields.title) {
    return res.status(400).json({ error: 'Missing contract fields.' });
  }

  const db = readDB();
  const newJob = {
    ...jobFields,
    id: `j-${Date.now()}`,
    status: 'pending',
    commission: Math.round(Number(jobFields.price) * 0.1),
    progressUpdates: [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.jobs.push(newJob);

  const worker = db.users.find(u => u.id === jobFields.workerId);
  if (worker) {
    triggerServerDispatch(db, 'Platform', worker.name, `New job contract request received from client ${jobFields.clientName}. Budget: ${Number(jobFields.price).toLocaleString()} RWF.`);
    triggerServerDispatch(db, 'WhatsApp', worker.phone, `MANASON ALERT: Client ${jobFields.clientName} has requested you for a contract: "${jobFields.title}". Budget: ${Number(jobFields.price).toLocaleString()} RWF.`);
  }

  // Log as a unified client request
  const clientUser = db.users.find(u => u.id === jobFields.clientId);
  const clientEmail = clientUser ? clientUser.email : 'guest@manason.engineering';
  const clientPhone = clientUser ? clientUser.phone : '+250 788 000 000';
  createAndSaveClientRequest(
    db,
    'hire',
    jobFields.clientName,
    clientEmail,
    clientPhone,
    `Hiring Contract: ${jobFields.title}`,
    `Hiring contract created for worker: ${jobFields.workerName}. Budget Offered: ${Number(jobFields.price).toLocaleString()} RWF. Description: ${jobFields.description}`,
    `${jobFields.price} RWF`,
    { jobId: newJob.id, workerId: jobFields.workerId, workerName: jobFields.workerName }
  );

  writeDB(db);
  res.json({ success: true, job: newJob });
});

// Update Job Status / Escrow Flow
app.post('/api/jobs/update-status', (req, res) => {
  const { jobId, status } = req.body;
  if (!jobId || !status) {
    return res.status(400).json({ error: 'Job ID and status required.' });
  }

  const db = readDB();
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Contract not found.' });
  }

  const job = db.jobs[jobIndex];
  job.status = status;

  const worker = db.users.find(u => u.id === job.workerId);
  const client = db.users.find(u => u.id === job.clientId);

  if (status === 'escrow_deposited') {
    triggerServerDispatch(db, 'Platform', 'System', `Client ${job.clientName} deposited ${job.price.toLocaleString()} RWF into Escrow. Funds are secured by Manason Engineering.`);
    if (worker) {
      const trackingLink = `${req.protocol}://${req.get('host')}/?trackJob=${job.id}`;
      triggerServerDispatch(db, 'WhatsApp', worker.phone, `ESCROW SECURED: Client ${job.clientName} deposited funds for "${job.title}". You are authorized to begin travelling/working now! Open this link on your phone to share your live GPS location with the client and admin: ${trackingLink}`);
      triggerServerDispatch(db, 'SMS', worker.phone, `MANASON: Escrow secured for "${job.title}". Share your live location: ${trackingLink}`);
    }
  } else if (status === 'travelling') {
    triggerServerDispatch(db, 'Platform', job.clientName, `Worker ${job.workerName} is travelling to your site.`);
    if (client) {
      triggerServerDispatch(db, 'SMS', client.phone, `MANASON TRACKING: Specialist ${job.workerName} is now traveling to your location.`);
    }
  } else if (status === 'arrived') {
    triggerServerDispatch(db, 'Platform', job.clientName, `Worker ${job.workerName} has arrived at the site.`);
    if (client) {
      triggerServerDispatch(db, 'WhatsApp', client.phone, `MANASON ALERT: ${job.workerName} arrived at site: ${job.location.address}.`);
    }
  } else if (status === 'working') {
    triggerServerDispatch(db, 'Platform', job.clientName, `Worker ${job.workerName} started active work.`);
  } else if (status === 'completed') {
    triggerServerDispatch(db, 'Platform', 'Admin', `Worker ${job.workerName} completed job "${job.title}". Awaiting client approval.`);
    if (client) {
      triggerServerDispatch(db, 'Email', client.email, `Dear ${client.name}, the specialist ${job.workerName} marked your project "${job.title}" as completed. Please inspect and approve to release payment.`);
      triggerServerDispatch(db, 'SMS', client.phone, `MANASON COMPLETED: "${job.title}" marked done. Please login to review work and approve release.`);
    }
  } else if (status === 'client_approved') {
    triggerServerDispatch(db, 'Platform', 'Admin', `ACTION NEEDED: Client ${job.clientName} confirmed "${job.title}" is complete. Please review the worker's photo/video reports in the Escrow Ledger before releasing payment.`);
  } else if (status === 'approved') {
    triggerServerDispatch(db, 'Platform', 'Admin', `Client approved job "${job.title}". Autoreleasing ${Math.round(job.price * 0.9).toLocaleString()} RWF to worker (10% platform commission retained).`);
    if (worker) {
      triggerServerDispatch(db, 'SMS', worker.phone, `PAYMENT RELEASED: Admin released ${Math.round(job.price * 0.9).toLocaleString()} RWF to your wallet for "${job.title}". Thank you for working with Manason.`);
    }
  } else if (status === 'disputed') {
    triggerServerDispatch(db, 'Platform', 'Admin', `CRITICAL: Client filed a dispute regarding job "${job.title}". Dispute investigation opened.`);
    if (worker) {
      triggerServerDispatch(db, 'Email', worker.email, `NOTIFICATION: A dispute was raised on "${job.title}". Manason administrators will review files and contact you shortly.`);
    }
  }

  writeDB(db);
  res.json({ success: true, job });
});

// Live GPS Tracking: worker's phone posts their position after opening the
// tracking link sent via WhatsApp/SMS when escrow is deposited. No admin
// auth is required here since the worker doesn't have a login token system —
// this is a "magic link" tied to a specific job ID, matching the app's
// existing pattern for worker actions.
app.post('/api/jobs/:id/live-location', (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Valid lat/lng required.' });
  }
  const db = readDB();
  const job = db.jobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Contract not found.' });
  }
  // Only accept live location updates while the job is actively in progress.
  const activeStatuses = ['escrow_deposited', 'travelling', 'arrived', 'working'];
  if (!activeStatuses.includes(job.status)) {
    return res.status(400).json({ error: 'This contract is not currently active for tracking.' });
  }
  job.liveLocation = { lat, lng, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json({ success: true });
});

// Client submits proof of an out-of-system MoMo/PayPal payment (PDF or
// screenshot) for Admin to manually review before confirming the deposit.
app.post('/api/jobs/:id/payment-receipt', (req, res) => {
  const { id } = req.params;
  const { receiptUrl } = req.body;
  if (!receiptUrl) {
    return res.status(400).json({ error: 'Receipt file URL required.' });
  }
  const db = readDB();
  const job = db.jobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Contract not found.' });
  }
  job.paymentReceiptUrl = receiptUrl;
  job.paymentReceiptUploadedAt = new Date().toISOString();

  const adminUser = db.users.find((u: any) => u.type === 'Admin');
  if (adminUser?.phone) {
    triggerServerDispatch(db, 'WhatsApp', adminUser.phone, `Inyemezabuguzi (receipt) yoherejwe na ${job.clientName} ku masezerano "${job.title}" (${job.price.toLocaleString()} RWF). Injira muri Dashboard uyigenzure.`);
  }
  triggerServerDispatch(db, 'Platform', 'Admin', `Payment receipt uploaded for contract "${job.title}" by ${job.clientName}. Pending manual verification.`);

  writeDB(db);
  res.json({ success: true, job });
});

// Add Progress Update
app.post('/api/jobs/progress', (req, res) => {
  const { jobId, comment, imageUrl, videoUrl } = req.body;
  if (!jobId || !comment) {
    return res.status(400).json({ error: 'Job ID and comment required.' });
  }

  const db = readDB();
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Contract not found.' });
  }

  const job = db.jobs[jobIndex];
  const newUpdate = {
    id: `pu-${Date.now()}`,
    timestamp: new Date().toISOString(),
    comment,
    imageUrl: imageUrl || (videoUrl ? undefined : 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80'),
    videoUrl: videoUrl || undefined
  };

  job.progressUpdates.push(newUpdate);

  const client = db.users.find(u => u.id === job.clientId);
  if (client) {
    const mediaNote = videoUrl ? 'a video report' : 'a photo/status';
    triggerServerDispatch(db, 'Platform', client.name, `New progress report submitted by ${job.workerName}: "${comment}"`);
    triggerServerDispatch(db, 'WhatsApp', client.phone, `PROGRESS UPDATE: ${job.workerName} uploaded ${mediaNote} on "${job.title}": "${comment}"`);
  }

  writeDB(db);
  res.json({ success: true, job });
});

// Submit Review
app.post('/api/jobs/review', (req, res) => {
  const { jobId, rating, comment, isClientReview } = req.body;
  const db = readDB();
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    const job = db.jobs[jobIndex];
    if (isClientReview) {
      job.clientRating = Number(rating);
      job.clientReviewComment = comment;
    } else {
      job.workerRating = Number(rating);
      job.workerReviewComment = comment;
    }

    triggerServerDispatch(db, 'Platform', 'System', `New review logged: ${rating} stars. Verified review recorded.`);
    writeDB(db);
    return res.json({ success: true, job });
  }
  return res.status(404).json({ error: 'Contract not found.' });
});

// ==========================================
// JOB POSTING BOARD
// ==========================================
// Clients post an open job listing; multiple workers submit priced offers;
// the client reviews and accepts one, which creates a real Job (escrow
// contract) using the same logic as the direct-hire flow above.

// Get all job postings
app.get('/api/job-postings', (req, res) => {
  const db = readDB();
  res.json(db.jobPostings || []);
});

// Create a new job posting (Client)
app.post('/api/job-postings', (req, res) => {
  const { clientId, clientName, clientPhone, title, description, category, location, budget } = req.body;
  if (!clientId || !title || !description || !budget) {
    return res.status(400).json({ error: 'Missing job posting fields.' });
  }

  const db = readDB();
  db.jobPostings = db.jobPostings || [];

  const newPosting = {
    id: `jp-${Date.now()}`,
    clientId,
    clientName,
    clientPhone: clientPhone || '',
    title,
    description,
    category: category || 'General Construction',
    location: location || '',
    budget: Number(budget),
    status: 'open',
    offers: [],
    createdAt: new Date().toISOString()
  };

  db.jobPostings.unshift(newPosting);
  triggerServerDispatch(db, 'Platform', 'System', `New job posting published: "${title}" by ${clientName}. Budget: ${Number(budget).toLocaleString()} RWF.`);

  writeDB(db);
  res.json({ success: true, jobPosting: newPosting });
});

// Submit an offer on a job posting (Worker)
app.post('/api/job-postings/:id/offer', (req, res) => {
  const { id } = req.params;
  const { workerId, workerName, workerAvatar, workerType, price, message } = req.body;
  if (!workerId || !price || !message) {
    return res.status(400).json({ error: 'Missing offer fields.' });
  }

  const db = readDB();
  db.jobPostings = db.jobPostings || [];
  const posting = db.jobPostings.find((jp: any) => jp.id === id);
  if (!posting) {
    return res.status(404).json({ error: 'Job posting not found.' });
  }
  if (posting.status !== 'open') {
    return res.status(400).json({ error: 'This job posting is no longer accepting offers.' });
  }
  if ((posting.offers || []).some((o: any) => o.workerId === workerId)) {
    return res.status(400).json({ error: 'You have already submitted an offer for this job.' });
  }

  const newOffer = {
    id: `jpo-${Date.now()}`,
    workerId,
    workerName,
    workerAvatar: workerAvatar || '',
    workerType: workerType || 'Technical',
    price: Number(price),
    message,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  posting.offers = posting.offers || [];
  posting.offers.push(newOffer);

  const client = db.users.find((u: any) => u.id === posting.clientId);
  if (client) {
    triggerServerDispatch(db, 'Platform', client.name, `New offer received on "${posting.title}": ${workerName} offered ${Number(price).toLocaleString()} RWF.`);
    triggerServerDispatch(db, 'WhatsApp', client.phone, `MANASON ALERT: ${workerName} submitted an offer of ${Number(price).toLocaleString()} RWF on your job posting "${posting.title}".`);
  }

  writeDB(db);
  res.json({ success: true, jobPosting: posting });
});

// Accept an offer (Client) — creates a real Job/escrow contract from it
app.post('/api/job-postings/:id/accept-offer', (req, res) => {
  const { id } = req.params;
  const { offerId } = req.body;
  if (!offerId) {
    return res.status(400).json({ error: 'Offer ID required.' });
  }

  const db = readDB();
  db.jobPostings = db.jobPostings || [];
  const posting = db.jobPostings.find((jp: any) => jp.id === id);
  if (!posting) {
    return res.status(404).json({ error: 'Job posting not found.' });
  }
  if (posting.status !== 'open') {
    return res.status(400).json({ error: 'This job posting has already been awarded or closed.' });
  }
  const offer = (posting.offers || []).find((o: any) => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found.' });
  }

  // Create the real escrow contract, mirroring POST /api/jobs
  const newJob = {
    id: `j-${Date.now()}`,
    clientId: posting.clientId,
    clientName: posting.clientName,
    workerId: offer.workerId,
    workerName: offer.workerName,
    workerType: offer.workerType,
    title: posting.title,
    description: posting.description,
    price: offer.price,
    status: 'pending',
    location: { lat: -1.9547, lng: 30.0824, address: posting.location },
    commission: Math.round(Number(offer.price) * 0.1),
    progressUpdates: [],
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.jobs.push(newJob);

  // Mark the posting awarded, and resolve every offer's status
  posting.status = 'awarded';
  posting.awardedJobId = newJob.id;
  posting.offers = (posting.offers || []).map((o: any) => ({
    ...o,
    status: o.id === offerId ? 'accepted' : 'rejected'
  }));

  // Notify the winning worker and everyone else who offered
  (posting.offers || []).forEach((o: any) => {
    const worker = db.users.find((u: any) => u.id === o.workerId);
    if (!worker) return;
    if (o.status === 'accepted') {
      triggerServerDispatch(db, 'Platform', worker.name, `Congratulations! Your offer on "${posting.title}" was accepted. A contract has been created — check your Dashboard.`);
      triggerServerDispatch(db, 'WhatsApp', worker.phone, `MANASON ALERT: Your offer on "${posting.title}" was ACCEPTED by ${posting.clientName}! Contract: ${Number(o.price).toLocaleString()} RWF. Open your Dashboard to proceed.`);
    } else {
      triggerServerDispatch(db, 'Platform', worker.name, `Your offer on "${posting.title}" was not selected this time.`);
    }
  });

  writeDB(db);
  res.json({ success: true, jobPosting: posting, job: newJob });
});


// Admin Resolve Dispute
app.post('/api/admin/resolve-dispute', requireAdminSession, (req, res) => {
  const { jobId, action } = req.body; // 'release' or 'refund'
  const db = readDB();
  const jobIndex = db.jobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    const job = db.jobs[jobIndex];
    const nextStatus = action === 'release' ? 'approved' : 'pending';
    
    job.status = nextStatus;
    job.clientReviewComment = action === 'refund' ? 'Refund Processed by Admin due to dispute.' : job.clientReviewComment;

    const client = db.users.find(u => u.id === job.clientId);
    const worker = db.users.find(u => u.id === job.workerId);

    if (action === 'release') {
      triggerServerDispatch(db, 'Platform', 'System', `ADMIN RESOLUTION: Admin approved full payment release for "${job.title}" after investigation.`);
      if (worker) {
        triggerServerDispatch(db, 'SMS', worker.phone, `MANASON DISPUTE RESOLVED: Admin completed escrow audit and released payment of ${Math.round(job.price * 0.9).toLocaleString()} RWF to your wallet.`);
      }
    } else {
      triggerServerDispatch(db, 'Platform', 'System', `ADMIN RESOLUTION: Admin authorized full escrow refund of ${job.price.toLocaleString()} RWF back to client ${job.clientName}.`);
      if (client) {
        triggerServerDispatch(db, 'SMS', client.phone, `MANASON DISPUTE RESOLVED: Admin completed escrow audit and refunded your ${job.price.toLocaleString()} RWF fully.`);
      }
    }

    writeDB(db);
    return res.json({ success: true, job });
  }
  return res.status(404).json({ error: 'Contract not found.' });
});

// Chat Messages: Send
app.post('/api/messages', (req, res) => {
  const { senderId, senderName, receiverId, receiverName, content, channel } = req.body;
  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Missing message parameters.' });
  }

  const db = readDB();
  const newMsg = {
    id: `m-${Date.now()}`,
    senderId,
    senderName,
    receiverId,
    receiverName,
    content,
    timestamp: new Date().toISOString(),
    channel: channel || 'chat'
  };

  db.messages.push(newMsg);

  const receiver = db.users.find(u => u.id === receiverId);
  if (receiver) {
    triggerServerDispatch(db, 'Platform', receiver.name, `${senderName} sent you a secure chat message.`);
    triggerServerDispatch(db, 'WhatsApp', receiver.phone, `MANASON INBOX: ${senderName} sent: "${content.substring(0, 45)}...".`);
  }

  writeDB(db);
  res.json({ success: true, message: newMsg });
});

// Chat Messages: Get history
app.get('/api/messages', (req, res) => {
  const db = readDB();
  res.json(db.messages);
});

// Consultancy Request
app.post('/api/consultancy', (req, res) => {
  const { clientId, clientName, type, details, budget, phone, email } = req.body;
  if (!type || !details) {
    return res.status(400).json({ error: 'Missing consultancy parameters.' });
  }

  const db = readDB();
  const newReq = {
    id: `c-${Date.now()}`,
    clientId: clientId || 'guest',
    clientName: clientName || 'Guest Visitor',
    type,
    details,
    budget,
    phone,
    email,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.consultancies.push(newReq);
  triggerServerDispatch(db, 'Platform', 'Admin', `New professional advisory/consultancy request logged for: ${type.toUpperCase()}. Budget: ${budget}.`);
  triggerServerDispatch(db, 'Email', 'manasonengineering@gmail.com', `CONSULTANCY REQUEST: Advisory requested for ${type}. Details: ${details}. Phone: ${phone}.`);
  
  // Log as a unified client request
  createAndSaveClientRequest(
    db,
    'consultancy',
    newReq.clientName,
    email || 'guest@manason.engineering',
    phone || '+250 788 000 000',
    `Consultancy Advisory: ${type.toUpperCase()}`,
    details,
    budget,
    { consultancyId: newReq.id }
  );

  writeDB(db);
  res.json({ success: true, consultancy: newReq });
});

// List Consultancies
app.get('/api/consultancy', (req, res) => {
  const db = readDB();
  res.json(db.consultancies || []);
});

// ==========================================
// CLIENT REQUESTS & UNIFIED NOTIFICATION LOGS
// ==========================================

async function createAndSaveClientRequest(
  db: DatabaseSchema,
  type: 'contact' | 'consultancy' | 'hire' | 'quote',
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  title: string,
  details: string,
  budget?: string,
  additionalInfo?: any
) {
  const newReq = {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    clientName: clientName || 'Guest Visitor',
    clientEmail: clientEmail || 'guest@manason.engineering',
    clientPhone: clientPhone || '+250 788 000 000',
    title,
    details,
    budget: budget || '',
    additionalInfo: additionalInfo || {},
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.clientRequests = [newReq, ...(db.clientRequests || [])];

  const fullMessageBody = `NEW ${type.toUpperCase()} REQUEST RECEIVED:
------------------------------------------
Client: ${newReq.clientName}
Email: ${newReq.clientEmail}
Phone: ${newReq.clientPhone}
Subject/Title: ${title}
Details: ${details}
${budget ? `Budget: ${budget}` : ''}
------------------------------------------
Please review this request on the Admin Dashboard immediately.`;

  // 3. Send the complete request to the company email
  triggerServerDispatch(db, 'Email', 'manasonengineering@gmail.com', fullMessageBody);

  // 4. Send the complete request to the company's WhatsApp Business number
  triggerServerDispatch(db, 'WhatsApp', '+250788123456', `MANASON NOTIFICATION:\n${fullMessageBody}`);

  // 9. Notify the admin immediately whenever a new request is received
  triggerServerDispatch(db, 'Platform', 'Admin', `🚨 IMMEDIATE ALERT: A new ${type} request ("${title}") was received from ${newReq.clientName}. Mark as unread.`);

  // 1. Save all information in the Supabase database (async, non-blocking)
  saveToSupabase(newReq);

  return newReq;
}

// Get Client Requests
app.get('/api/client-requests', requireAdminSession, async (req, res) => {
  const db = readDB();
  await syncSupabaseRequests(db);
  writeDB(db);
  res.json(db.clientRequests || []);
});

// Submit New Client Request (e.g. from Contact Form)
app.post('/api/client-requests', async (req, res) => {
  const { type, clientName, clientEmail, clientPhone, title, details, budget, additionalInfo } = req.body;
  if (!type || !title || !details) {
    return res.status(400).json({ error: 'Type, title, and details are required.' });
  }

  const db = readDB();
  const newReq = await createAndSaveClientRequest(
    db,
    type,
    clientName,
    clientEmail,
    clientPhone,
    title,
    details,
    budget,
    additionalInfo
  );

  writeDB(db);
  res.json({ success: true, request: newReq });
});

// Update Client Request (Reply, Mark as Read)
app.put('/api/client-requests/:id', requireAdminSession, async (req, res) => {
  const { id } = req.params;
  const { isRead, adminReply } = req.body;

  const db = readDB();
  const reqIndex = (db.clientRequests || []).findIndex(r => r.id === id);
  if (reqIndex !== -1) {
    const r = db.clientRequests![reqIndex];
    if (typeof isRead === 'boolean') {
      r.isRead = isRead;
    }
    if (typeof adminReply === 'string') {
      r.adminReply = adminReply;
      r.repliedAt = new Date().toISOString();
      // Also send the reply back to user via simulated SMS/WhatsApp
      triggerServerDispatch(db, 'WhatsApp', r.clientPhone, `MANASON HELP DESK REPLY:\nDear ${r.clientName}, regarding your request "${r.title}":\n"${adminReply}"`);
    }

    // Save back to local DB and Supabase
    writeDB(db);
    await saveToSupabase(r);
    return res.json({ success: true, request: r });
  }

  res.status(404).json({ error: 'Client request not found.' });
});

// Outbound Alerts/Dispatches
app.get('/api/dispatches', requireAdminSession, (req, res) => {
  const db = readDB();
  res.json(db.dispatches || []);
});

// Clear Outbound Alerts
app.post('/api/dispatches/clear', requireAdminSession, (req, res) => {
  const db = readDB();
  db.dispatches = [];
  writeDB(db);
  res.json({ success: true });
});

// ==========================================
// USER PROFILE & ACCOUNT MANAGEMENT (ADMIN & WORKER)
// ==========================================

// Update User Profile (Self or Admin)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedFields: any = { ...req.body };
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Determine if the caller has a valid admin session.
  const adminToken = req.header('x-admin-token');
  const callerIsAdmin = !!adminToken && db.users.some(
    (u: any) => u.type === 'Admin' && u.sessionToken === adminToken && u.sessionExpiry && Date.now() <= u.sessionExpiry
  );

  // Never allow these fields to be changed through this general-purpose route,
  // regardless of caller — they have dedicated, protected endpoints.
  delete updatedFields.id;
  delete updatedFields.password;
  delete updatedFields.sessionToken;
  delete updatedFields.sessionExpiry;
  delete updatedFields.registrationDate;
  // Escalating to Admin is never allowed via this route, even for admins —
  // creating new admins is intentionally not supported to avoid abuse.
  if (updatedFields.type === 'Admin') delete updatedFields.type;

  if (!callerIsAdmin) {
    // Non-admin callers may only edit their own descriptive profile fields —
    // never verification status or account type.
    delete updatedFields.type;
    delete updatedFields.isVerified;
  }

  db.users[index] = { ...db.users[index], ...updatedFields };
  writeDB(db);
  const { password: _pw, sessionToken: _st, sessionExpiry: _se, ...safeUser } = db.users[index];
  return res.json({ success: true, user: safeUser });
});

// Delete User (Admin only)
app.delete('/api/users/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (id === (req as any).adminUser.id) {
    return res.status(400).json({ error: 'Ntushobora gusiba konti yawe ubwawe.' });
  }
  const index = db.users.findIndex(u => u.id === id);
  if (index !== -1) {
    const deletedUser = db.users.splice(index, 1)[0];
    writeDB(db);
    logAction((req as any).adminUser.id, (req as any).adminUser.name, 'Delete User', `Deleted user: ${deletedUser.name}`);
    const { password: _pw, ...safeDeleted } = deletedUser;
    return res.json({ success: true, user: safeDeleted });
  }
  return res.status(404).json({ error: 'User not found' });
});

// ==========================================
// CONSTRUCTION PRODUCTS (ADMIN)
// ==========================================

// Add Product
app.post('/api/products', requireAdminSession, (req, res) => {
  const productFields = req.body;
  if (!productFields.name || !productFields.price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }
  const db = readDB();
  const newProduct = {
    ...productFields,
    id: `prod-${Date.now()}`,
    isMadeInRwanda: productFields.isMadeInRwanda ?? true,
    isPromotion: productFields.isPromotion ?? false,
    imageUrl: productFields.imageUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80'
  };
  db.products.push(newProduct);
  writeDB(db);
  res.json({ success: true, product: newProduct });
});

// Edit Product
app.put('/api/products/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  const db = readDB();
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...updatedFields };
    writeDB(db);
    return res.json({ success: true, product: db.products[index] });
  }
  return res.status(404).json({ error: 'Product not found' });
});

// Delete Product
app.delete('/api/products/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.products.findIndex(p => p.id === id);
  if (index !== -1) {
    const deletedProduct = db.products.splice(index, 1)[0];
    writeDB(db);
    return res.json({ success: true, product: deletedProduct });
  }
  return res.status(404).json({ error: 'Product not found' });
});

// ==========================================
// PDF BROCHURE SYSTEM (ADMIN & CLIENTS)
// ==========================================

// Get Brochures List
app.get('/api/brochures', (req, res) => {
  const db = readDB();
  res.json(db.brochures || []);
});

// Add/Upload Brochure (Admin)
app.post('/api/brochures', requireAdminSession, (req, res) => {
  const { name, category, size, fileUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Brochure name is required.' });
  }
  const db = readDB();
  const newBrochure = {
    id: `broch-${Date.now()}`,
    name,
    category: category || 'General',
    size: size || '1.5 MB',
    downloadCount: 0,
    updatedAt: new Date().toISOString().split('T')[0],
    fileUrl: fileUrl || ''
  };
  db.brochures = db.brochures || [];
  db.brochures.push(newBrochure);
  writeDB(db);
  res.json({ success: true, brochure: newBrochure });
});

// Replace Brochure (Admin)
app.put('/api/brochures/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const { name, category, size, fileUrl } = req.body;
  const db = readDB();
  db.brochures = db.brochures || [];
  const index = db.brochures.findIndex(b => b.id === id);
  if (index !== -1) {
    db.brochures[index] = {
      ...db.brochures[index],
      name: name || db.brochures[index].name,
      category: category || db.brochures[index].category,
      size: size || db.brochures[index].size,
      updatedAt: new Date().toISOString().split('T')[0],
      fileUrl: fileUrl !== undefined ? fileUrl : db.brochures[index].fileUrl
    };
    writeDB(db);
    return res.json({ success: true, brochure: db.brochures[index] });
  }
  return res.status(404).json({ error: 'Brochure not found' });
});

// Delete Brochure (Admin)
app.delete('/api/brochures/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.brochures = db.brochures || [];
  const index = db.brochures.findIndex(b => b.id === id);
  if (index !== -1) {
    const deletedBrochure = db.brochures.splice(index, 1)[0];
    writeDB(db);
    return res.json({ success: true, brochure: deletedBrochure });
  }
  return res.status(404).json({ error: 'Brochure not found' });
});

// Increment Brochure Download Count
app.post('/api/brochures/:id/download', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.brochures = db.brochures || [];
  const index = db.brochures.findIndex(b => b.id === id);
  if (index !== -1) {
    db.brochures[index].downloadCount = (db.brochures[index].downloadCount || 0) + 1;
    writeDB(db);
    return res.json({ success: true, brochure: db.brochures[index] });
  }
  return res.status(404).json({ error: 'Brochure not found' });
});

// ==========================================
// HOMEPAGE MANAGEMENT (ADMIN)
// ==========================================

// Get Homepage Settings
app.get('/api/homepage', (req, res) => {
  const db = readDB();
  res.json(db.homepage || {});
});

// Update Homepage Settings (Admin)
app.put('/api/homepage', requireAdminSession, (req, res) => {
  const fields = req.body;
  const db = readDB();
  db.homepage = { ...(db.homepage || {}), ...fields };
  writeDB(db);
  res.json({ success: true, homepage: db.homepage });
});

// ==========================================
// SYSTEM SETTINGS & ADVERTISEMENTS & AUDIT LOGS & DISASTER RECOVERY & UPLOADS
// ==========================================

// Get System Settings
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings || DEFAULT_SETTINGS);
});

// Update System Settings (Admin)
app.put('/api/settings', requireAdminSession, (req, res) => {
  const fields = req.body;
  const db = readDB();
  db.settings = { ...(db.settings || DEFAULT_SETTINGS), ...fields };
  writeDB(db);
  logAction('admin', 'Admin', 'Update Settings', `Updated system configuration keys: ${Object.keys(fields).join(', ')}`);
  res.json({ success: true, settings: db.settings });
});

// Get Advertisements
app.get('/api/advertisements', (req, res) => {
  const db = readDB();
  res.json(db.advertisements || []);
});

// Add Advertisement
app.post('/api/advertisements', requireAdminSession, (req, res) => {
  const { companyName, title, imageUrl, contactInfo, isMadeInRwanda } = req.body;
  if (!companyName || !title) {
    return res.status(400).json({ error: 'Company Name and Title are required.' });
  }
  const db = readDB();
  const newAd = {
    id: `ad-${Date.now()}`,
    companyName,
    title,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400',
    contactInfo: contactInfo || '+250785647676',
    status: 'pending',
    isMadeInRwanda: !!isMadeInRwanda,
    createdAt: new Date().toISOString()
  };
  db.advertisements = db.advertisements || [];
  db.advertisements.push(newAd);
  writeDB(db);
  logAction('guest', companyName, 'Request Ad', `Created advertisement request: "${title}"`);
  res.json({ success: true, advertisement: newAd });
});

// Edit/Approve Advertisement (Admin)
app.put('/api/advertisements/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const { companyName, title, imageUrl, contactInfo, status, isMadeInRwanda } = req.body;
  const db = readDB();
  db.advertisements = db.advertisements || [];
  const index = db.advertisements.findIndex(ad => ad.id === id);
  if (index !== -1) {
    db.advertisements[index] = {
      ...db.advertisements[index],
      companyName: companyName || db.advertisements[index].companyName,
      title: title || db.advertisements[index].title,
      imageUrl: imageUrl || db.advertisements[index].imageUrl,
      contactInfo: contactInfo || db.advertisements[index].contactInfo,
      status: status || db.advertisements[index].status,
      isMadeInRwanda: isMadeInRwanda !== undefined ? !!isMadeInRwanda : db.advertisements[index].isMadeInRwanda
    };
    writeDB(db);
    logAction('admin', 'Admin', 'Update Ad', `Updated advertisement ${id} status: ${status || 'edited'}`);
    return res.json({ success: true, advertisement: db.advertisements[index] });
  }
  return res.status(404).json({ error: 'Advertisement not found' });
});

// Delete Advertisement (Admin)
app.delete('/api/advertisements/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.advertisements = db.advertisements || [];
  const index = db.advertisements.findIndex(ad => ad.id === id);
  if (index !== -1) {
    const deleted = db.advertisements.splice(index, 1)[0];
    writeDB(db);
    logAction('admin', 'Admin', 'Delete Ad', `Deleted advertisement: "${deleted.title}"`);
    return res.json({ success: true, advertisement: deleted });
  }
  return res.status(404).json({ error: 'Advertisement not found' });
});

// Get Audit Logs (Admin)
app.get('/api/audit-logs', requireAdminSession, (req, res) => {
  const db = readDB();
  res.json(db.auditLogs || []);
});

// Clear Audit Logs (Admin)
app.post('/api/admin/audit-logs/clear', requireAdminSession, (req, res) => {
  const db = readDB();
  db.auditLogs = [
    {
      id: `audit-${Date.now()}`,
      userId: 'u-admin',
      userName: 'Manason Admin',
      action: 'Clear Logs',
      timestamp: new Date().toISOString(),
      details: 'Admin cleared previous system logs.'
    }
  ];
  writeDB(db);
  res.json({ success: true, auditLogs: db.auditLogs });
});

// File Upload Handler (PDF, JPEG, PNG)
app.post('/api/upload', async (req, res) => {
  const { fileName, fileType, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Missing file name or data.' });
  }

  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.mp4', '.mov', '.webm'];
  const videoExtensions = ['.mp4', '.mov', '.webm'];
  const ext = path.extname(fileName).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ error: 'Invalid file type. Only PDF, PNG, JPG, JPEG, MP4, MOV, and WEBM are allowed.' });
  }

  try {
    const base64Data = fileData.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const maxSize = videoExtensions.includes(ext) ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      const maxSizeLabel = videoExtensions.includes(ext) ? '50MB' : '10MB';
      return res.status(400).json({ error: `File size exceeds the ${maxSizeLabel} security limit.` });
    }

    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Prefer Supabase Storage when configured — this is REQUIRED for
    // uploads (worker IDs, certificates, etc.) to survive server restarts,
    // since Render's free-tier disk is ephemeral and wipes on every restart.
    if (supabase) {
      const { error: uploadError } = await supabase
        .storage
        .from('manason-uploads')
        .upload(safeFileName, buffer, {
          contentType: fileType || 'application/octet-stream',
          upsert: false
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase
          .storage
          .from('manason-uploads')
          .getPublicUrl(safeFileName);
        return res.json({
          success: true,
          url: publicUrlData.publicUrl,
          size: `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`
        });
      }
      console.warn('Supabase Storage upload failed, falling back to local disk (NOT persistent on restarts):', uploadError);
    }

    // Fallback: local disk. Only used when Supabase Storage isn't configured
    // or its upload failed — files here are lost on the next server restart.
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${safeFileName}`;
    res.json({ success: true, url: fileUrl, size: `${(buffer.length / (1024 * 1024)).toFixed(1)} MB` });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload.' });
  }
});

// Disaster Recovery (Backup & Restore)
app.post('/api/admin/backup/create', requireAdminSession, (req, res) => {
  try {
    const db = readDB();
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFile = `db-backup-${Date.now()}.json`;
    fs.writeFileSync(path.join(backupDir, backupFile), JSON.stringify(db, null, 2), 'utf-8');
    logAction('admin', 'Admin', 'Create Backup', `Created backup point: ${backupFile}`);
    res.json({ success: true, file: backupFile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create backup.', details: err.message });
  }
});

app.get('/api/admin/backups', requireAdminSession, (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('db-backup-') && f.endsWith('.json'))
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return {
          fileName: f,
          size: `${(stats.size / 1024).toFixed(1)} KB`,
          createdAt: stats.mtime.toISOString()
        };
      });
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list backups.' });
  }
});

app.post('/api/admin/backup/restore', requireAdminSession, (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: 'Backup file name required.' });
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found.' });
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Simple verification
    if (!parsed.users || !parsed.products) {
      return res.status(400).json({ error: 'Invalid backup database schema.' });
    }
    
    writeDB(parsed);
    logAction('admin', 'Admin', 'Restore Backup', `Restored system from backup: ${fileName}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to restore database.' });
  }
});

app.post('/api/admin/backup/download-json', requireAdminSession, (req, res) => {
  const db = readDB();
  res.json({ jsonString: JSON.stringify(db, null, 2) });
});

app.post('/api/admin/backup/upload-json', requireAdminSession, (req, res) => {
  const { jsonString } = req.body;
  if (!jsonString) return res.status(400).json({ error: 'JSON content required.' });
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.users || !parsed.products) {
      return res.status(400).json({ error: 'Invalid database JSON file.' });
    }
    writeDB(parsed);
    logAction('admin', 'Admin', 'Upload DB JSON', 'Overwrote database via JSON file upload.');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid JSON syntax.' });
  }
});

// ==========================================
// PROJECTS MANAGEMENT (ADMIN & CLIENTS)
// ==========================================

// Get Projects List
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects || []);
});

// Add Project (Admin)
app.post('/api/projects', requireAdminSession, (req, res) => {
  const { title, category, contractor, description, imageUrl } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required.' });
  }
  const db = readDB();
  const newProject = {
    id: `proj-${Date.now()}`,
    title,
    category: category || 'GENERAL',
    contractor: contractor || 'Manason Contractor',
    description: description || 'No details provided.',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80'
  };
  db.projects = db.projects || [];
  db.projects.push(newProject);
  writeDB(db);
  res.json({ success: true, project: newProject });
});

// Edit Project (Admin)
app.put('/api/projects/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const { title, category, contractor, description, imageUrl } = req.body;
  const db = readDB();
  db.projects = db.projects || [];
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    db.projects[index] = {
      ...db.projects[index],
      title: title || db.projects[index].title,
      category: category || db.projects[index].category,
      contractor: contractor || db.projects[index].contractor,
      description: description || db.projects[index].description,
      imageUrl: imageUrl || db.projects[index].imageUrl
    };
    writeDB(db);
    return res.json({ success: true, project: db.projects[index] });
  }
  return res.status(404).json({ error: 'Project not found' });
});

// Delete Project (Admin)
app.delete('/api/projects/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.projects = db.projects || [];
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    const deletedProject = db.projects.splice(index, 1)[0];
    writeDB(db);
    return res.json({ success: true, project: deletedProject });
  }
  return res.status(404).json({ error: 'Project not found' });
});

// ==========================================
// CONSULTANCY UPDATES (ADMIN & EXPERTS)
// ==========================================

// Update / Reply to Consultancy
app.put('/api/consultancy/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const { status, assignedExpert, reply } = req.body;
  const db = readDB();
  const index = db.consultancies.findIndex(c => c.id === id);
  if (index !== -1) {
    const con = db.consultancies[index];
    if (status) con.status = status;
    if (assignedExpert) con.assignedExpert = assignedExpert;
    if (reply) {
      con.reply = reply;
      con.status = 'assigned';
      triggerServerDispatch(db, 'Email', con.email, `MANASON ADVISORY REPLY: Our assigned expert, ${assignedExpert || 'Chief Engineer'}, responded to your brief: "${reply}".`);
      triggerServerDispatch(db, 'SMS', con.phone, `MANASON ADVISORY: Vetted expert assigned. Reply details sent to your registered email/phone.`);
    }
    writeDB(db);
    return res.json({ success: true, consultancy: con });
  }
  return res.status(404).json({ error: 'Consultancy request not found' });
});

// ==========================================
// AI CONSULTANT (GEMINI INTEGRATION)
// ==========================================
app.post('/api/ai/feasibility-analysis', async (req, res) => {
  const { projectType, details, budget, location } = req.body;
  if (!projectType || !details) {
    return res.status(400).json({ error: 'Project type and details are required for AI analysis.' });
  }

  if (!aiClient) {
    return res.json({
      aiAnalysis: `### **Manason AI Feasibility Report (Offline Sandbox)**\n\n*Note: To enable live Gemini AI-powered analysis, please configure the 'GEMINI_API_KEY' environment variable.*\n\n#### **1. Structural Feasibility**\nThe described project **"${projectType}"** located at **"${location || 'Kigali Area'}"** appears structurally standard. For hilly Rwandan terrain, a reinforced masonry or volcanic stone retaining wall is highly recommended to protect foundations against storm runoff erosion.\n\n#### **2. Construction Permitting (Rwanda Building Code)**\nUnder the Rwanda Building Code, any new construction or significant renovation requires a permit from the local District One-Stop Centre (e.g., Gasabo, Kicukiro, Nyarugenge). You will need:\n- Valid Land Title (Ubutaka)\n- Feasibility / Topographic Survey\n- Architectural and Structural Drawings certified by an ERB (Institution of Engineers Rwanda) member.\n\n#### **3. Cost & Material Estimates**\nBased on your specified budget of **${budget || 'flexible'} RWF**, we recommend using:\n- **CIMERWA 32.5N / 42.5R Cement** for masonry and concrete works respectively.\n- **Ruliba Clays** for high-quality sustainable brickwork and roof tiles.\n- **Ameki Color Paints** for exterior weather-guard coatings.\n\n#### **4. Local Specialist Recommendations**\nWe suggest browsing the Workers Directory for a **Technical** Masonry specialist or a registered **Construction Company** like *Kigali Builders Ltd* to submit a complete Bill of Quantities (BoQ).`
    });
  }

  try {
    const prompt = `You are the chief engineering advisory AI for "Manason Engineering Ltd", a premiere construction platform in Rwanda.
Generate a structured, professional, and thorough feasibility report based on the client's project proposal. 

Project Parameters:
- Project Type: ${projectType}
- Description: ${details}
- Client Budget: ${budget || 'Flexible'}
- Proposed Location in Rwanda: ${location || 'Kigali, Rwanda'}

Provide the response in beautiful, structured Markdown. Include these exact sections:
1. **Introduction & Summary**: Briefly restate and assess the client's proposal.
2. **Structural Feasibility**: Discuss foundation details, slope and terrain safety (especially relevant to Rwanda's hilly landscape, terracing, retaining walls), and structural recommendations.
3. **Rwandan Building Code & Permitting**: Explain the regulatory steps (One-Stop Centre permissions, Land Titles/Ubutaka, and certified ERB engineer signature requirements).
4. **Local Materials & Manufacturer Recommendations**: Explicitly suggest specific local brands like CIMERWA Cement, Ruliba Clays, or Ameki Color Paints to match their scope.
5. **Contractor & Next Step Recommendations**: Give advice on hiring from our verified professionals, drawing up a Bill of Quantities (BoQ), and depositing funds into the Manason secure Escrow ledger before commencing works.

Write in a highly authoritative, helpful, and professional engineering consultant tone. Keep it concise but dense with practical local building advice.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ aiAnalysis: response.text });
  } catch (error: any) {
    console.error('Gemini AI API Call failed:', error);
    res.status(500).json({ error: 'Failed to generate AI advisory. Please try again.', details: error.message });
  }
});


// ==========================================
// VITE OR STATIC FILE SERVING FOR FULL-STACK
// ==========================================
async function startViteServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULL-STACK] Manason Server running at http://0.0.0.0:${PORT}`);
  });
}

restoreDBFromSupabase().then(() => startViteServer());
