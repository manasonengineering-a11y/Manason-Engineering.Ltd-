/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserType, Job, JobStatus, Product, QuoteRequest, Message, ConsultancyRequest, ProgressUpdate, Brochure, HomepageSettings, Project, ClientRequest, JobPosting } from '../types';

export interface OutboundDispatch {
  id: string;
  type: 'WhatsApp' | 'SMS' | 'Email' | 'Platform';
  recipient: string;
  content: string;
  timestamp: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  jobs: Job[];
  jobPostings: JobPosting[];
  quotes: QuoteRequest[];
  messages: Message[];
  consultancies: ConsultancyRequest[];
  dispatches: OutboundDispatch[];
  brochures: Brochure[];
  homepage: HomepageSettings | null;
  projects: Project[];
  clientRequests: ClientRequest[];
  isLoading: boolean;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  register: (user: Omit<User, 'id' | 'registrationDate' | 'isVerified'>) => Promise<User>;
  logout: () => void;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (userId: string, fields: Partial<User>) => Promise<void>;
  deleteUserByAdmin: (userId: string) => Promise<void>;
  verifyUserByAdmin: (userId: string) => Promise<void>;
  addProductByAdmin: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProductByAdmin: (productId: string, fields: Partial<Product>) => Promise<void>;
  deleteProductByAdmin: (productId: string) => Promise<void>;
  addJob: (job: Omit<Job, 'id' | 'status' | 'createdAt' | 'commission' | 'progressUpdates'>) => Promise<Job>;
  addJobPosting: (fields: { title: string; description: string; category: string; location: string; budget: number }) => Promise<JobPosting>;
  submitJobOffer: (postingId: string, price: number, message: string) => Promise<void>;
  acceptJobOffer: (postingId: string, offerId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  addProgressUpdate: (jobId: string, comment: string, imageUrl?: string, videoUrl?: string) => Promise<void>;
  submitPaymentReceipt: (jobId: string, receiptUrl: string) => Promise<void>;
  submitReview: (jobId: string, rating: number, comment: string, isClientReview: boolean) => Promise<void>;
  addQuoteRequest: (productId: string, details: string) => Promise<void>;
  replyQuoteByAdmin: (quoteId: string, price: number) => Promise<void>;
  approveQuoteByClient: (quoteId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, channel?: 'chat' | 'whatsapp' | 'sms' | 'email') => Promise<void>;
  addConsultancy: (type: 'architecture' | 'engineering' | 'quantity_surveying', details: string, budget: string, phone: string, email: string) => Promise<void>;
  replyConsultancyByAdmin: (consultancyId: string, assignedExpert: string, reply: string) => Promise<void>;
  resolveDisputeByAdmin: (jobId: string, action: 'release' | 'refund') => Promise<void>;
  addBrochureByAdmin: (brochure: { name: string; category: string; size?: string; fileUrl?: string }) => Promise<void>;
  updateBrochureByAdmin: (brochureId: string, fields: { name?: string; category?: string; size?: string; fileUrl?: string }) => Promise<void>;
  deleteBrochureByAdmin: (brochureId: string) => Promise<void>;
  incrementBrochureDownload: (brochureId: string) => Promise<void>;
  updateHomepageByAdmin: (fields: Partial<HomepageSettings>) => Promise<void>;
  addProjectByAdmin: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProjectByAdmin: (projectId: string, fields: Partial<Project>) => Promise<void>;
  deleteProjectByAdmin: (projectId: string) => Promise<void>;
  clearDispatches: () => Promise<void>;
  askAiFeasibility: (projectType: string, details: string, budget: string, location: string) => Promise<string>;
  addClientRequest: (request: Omit<ClientRequest, 'id' | 'isRead' | 'createdAt'>) => Promise<void>;
  updateClientRequest: (id: string, fields: Partial<ClientRequest>) => Promise<void>;
  syncDatabase: (silent?: boolean) => Promise<void>;
  settings: any;
  updateSettings: (fields: any) => Promise<void>;
  advertisements: any[];
  addAdvertisement: (ad: any) => Promise<void>;
  updateAdvertisement: (adId: string, fields: any) => Promise<void>;
  deleteAdvertisement: (adId: string) => Promise<void>;
  auditLogs: any[];
  clearAuditLogs: () => Promise<void>;
  backups: any[];
  createBackup: () => Promise<void>;
  fetchBackups: () => Promise<void>;
  restoreBackup: (fileName: string) => Promise<void>;
  downloadDBJson: () => Promise<string>;
  uploadDBJson: (jsonString: string) => Promise<boolean>;
  uploadFile: (fileName: string, fileType: string, fileData: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('manason_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('manason_admin_token');
  });

  // Attaches the admin session token to protected requests automatically.
  const adminFetch = (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };
    if (adminToken) headers['x-admin-token'] = adminToken;
    return fetch(url, { ...options, headers });
  };

  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultancies, setConsultancies] = useState<ConsultancyRequest[]>([]);
  const [dispatches, setDispatches] = useState<OutboundDispatch[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [homepage, setHomepage] = useState<HomepageSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Synchronize state from database with automatic retries for resilient full-stack coordination
  const syncDatabase = async (silent = false, retriesRemaining = 3): Promise<void> => {
    if (!silent && retriesRemaining === 3) setIsLoading(true);
    try {
      const [
        usersRes, productsRes, jobsRes, quotesRes, messagesRes,
        consultanciesRes, brochuresRes, homepageRes,
        projectsRes, settingsRes, adsRes, jobPostingsRes
      ] = await Promise.all([
        fetch('/api/users').then(r => {
          if (!r.ok) throw new Error('Failed to fetch users');
          return r.json();
        }),
        fetch('/api/products').then(r => {
          if (!r.ok) throw new Error('Failed to fetch products');
          return r.json();
        }),
        fetch('/api/jobs').then(r => {
          if (!r.ok) throw new Error('Failed to fetch jobs');
          return r.json();
        }),
        fetch('/api/quotes').then(r => {
          if (!r.ok) throw new Error('Failed to fetch quotes');
          return r.json();
        }),
        fetch('/api/messages').then(r => {
          if (!r.ok) throw new Error('Failed to fetch messages');
          return r.json();
        }),
        fetch('/api/consultancy').then(r => {
          if (!r.ok) throw new Error('Failed to fetch consultancy');
          return r.json();
        }),
        fetch('/api/brochures').then(r => {
          if (!r.ok) throw new Error('Failed to fetch brochures');
          return r.json();
        }),
        fetch('/api/homepage').then(r => {
          if (!r.ok) throw new Error('Failed to fetch homepage');
          return r.json();
        }),
        fetch('/api/projects').then(r => {
          if (!r.ok) throw new Error('Failed to fetch projects');
          return r.json();
        }),
        fetch('/api/settings').then(r => {
          if (!r.ok) throw new Error('Failed to fetch settings');
          return r.json();
        }),
        fetch('/api/advertisements').then(r => {
          if (!r.ok) throw new Error('Failed to fetch advertisements');
          return r.json();
        }),
        fetch('/api/job-postings').then(r => {
          if (!r.ok) throw new Error('Failed to fetch job postings');
          return r.json();
        })
      ]);

      setUsers(usersRes);
      setProducts(productsRes);
      setJobs(jobsRes);
      setQuotes(quotesRes);
      setMessages(messagesRes);
      setConsultancies(consultanciesRes);
      setBrochures(brochuresRes);
      setHomepage(homepageRes);
      setProjects(projectsRes);
      setSettings(settingsRes);
      setAdvertisements(adsRes);
      setJobPostings(jobPostingsRes);

      // Admin-only data (dispatches, audit logs, client requests) is fetched
      // separately with the session token, and only when logged in as Admin.
      // A failure here never breaks the rest of the app for regular users.
      if (currentUser?.type === UserType.ADMIN && adminToken) {
        try {
          const [dispatchesRes, auditLogsRes, clientRequestsRes] = await Promise.all([
            adminFetch('/api/dispatches'),
            adminFetch('/api/audit-logs'),
            adminFetch('/api/client-requests')
          ]);
          if (dispatchesRes.status === 401 || auditLogsRes.status === 401 || clientRequestsRes.status === 401) {
            // The session token is no longer valid (server restarted, another
            // admin logged in, or it expired). Stop hammering the API and
            // force a clean logout so the person can log back in.
            setCurrentUserState(null);
            setAdminToken(null);
            localStorage.removeItem('manason_current_user');
            localStorage.removeItem('manason_admin_token');
            setDispatches([]);
            setAuditLogs([]);
            setClientRequests([]);
          } else {
            setDispatches(dispatchesRes.ok ? await dispatchesRes.json() : []);
            setAuditLogs(auditLogsRes.ok ? await auditLogsRes.json() : []);
            setClientRequests(clientRequestsRes.ok ? await clientRequestsRes.json() : []);
          }
        } catch {
          // ignore — admin-only panels will just show stale/empty data until next sync
        }
      } else {
        setDispatches([]);
        setAuditLogs([]);
        setClientRequests([]);
      }

      // Refresh currentUser profile state in case it got verified or updated on the backend
      if (currentUser) {
        const freshProfile = usersRes.find((u: User) => u.id === currentUser.id);
        if (freshProfile) {
          setCurrentUserState(freshProfile);
          localStorage.setItem('manason_current_user', JSON.stringify(freshProfile));
        }
      }
      if (!silent) setIsLoading(false);
    } catch (error) {
      console.warn(`Database sync failed (${retriesRemaining} retries left):`, error);
      if (retriesRemaining > 1) {
        // Wait 2 seconds and retry again
        await new Promise(resolve => setTimeout(resolve, 2000));
        return syncDatabase(silent, retriesRemaining - 1);
      } else {
        if (!silent) setIsLoading(false);
      }
    }
  };

  // Initial Sync (and re-sync whenever login state changes, so the interval
  // always uses the CURRENT user/token instead of a stale one captured at
  // mount time — this stale-closure bug was causing repeated 401 errors
  // after logging in/out).
  useEffect(() => {
    syncDatabase();

    // Set up rapid updates for messages and real-time dispatches log
    const interval = setInterval(() => {
      syncDatabase(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser?.id, adminToken]);

  // Admin-only: keep the session alive & detect if it was invalidated
  // (e.g. because the admin logged in from another device/browser),
  // and auto-close the dashboard when the browser tab/window is closed.
  useEffect(() => {
    if (currentUser?.type !== UserType.ADMIN || !adminToken) return;

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, token: adminToken })
        });
        if (!res.ok) {
          // Session is no longer valid — force logout locally.
          setCurrentUserState(null);
          setAdminToken(null);
          localStorage.removeItem('manason_current_user');
          localStorage.removeItem('manason_admin_token');
          alert('Wasohowe muri sisitemu kuko hari uwinjiye nka Admin ahandi, cyangwa igihe cyawe kirarangiye.');
        }
      } catch {
        // Network hiccup — ignore, will retry.
      }
    };

    const sessionInterval = setInterval(verify, 20000);

    const handleUnload = () => {
      try {
        navigator.sendBeacon(
          '/api/auth/logout',
          new Blob([JSON.stringify({ userId: currentUser.id })], { type: 'application/json' })
        );
      } catch {
        // ignore
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(sessionInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser?.id, adminToken]);

  const login = async (emailOrPhone: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserState(data.user);
        localStorage.setItem('manason_current_user', JSON.stringify(data.user));
        if (data.adminToken) {
          setAdminToken(data.adminToken);
          localStorage.setItem('manason_admin_token', data.adminToken);
        }
        await syncDatabase(true);
        return true;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Authentication failed');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      throw e;
    }
  };

  // Changes the logged-in admin's password. Requires the current password.
  const changeAdminPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const res = await adminFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Kuhindura password byanze.');
    }
    if (data.adminToken) {
      setAdminToken(data.adminToken);
      localStorage.setItem('manason_admin_token', data.adminToken);
    }
  };

  const register = async (fields: Omit<User, 'id' | 'registrationDate' | 'isVerified'>): Promise<User> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to register profile.');
    }
    const data = await res.json();
    setCurrentUserState(data.user);
    localStorage.setItem('manason_current_user', JSON.stringify(data.user));
    await syncDatabase(true);
    return data.user;
  };

  const logout = () => {
    if (currentUser?.type === UserType.ADMIN) {
      // Best-effort call to invalidate the session on the server too.
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      }).catch(() => {});
    }
    setCurrentUserState(null);
    setAdminToken(null);
    localStorage.removeItem('manason_current_user');
    localStorage.removeItem('manason_admin_token');
  };

  const verifyUserByAdmin = async (userId: string) => {
    const res = await adminFetch('/api/admin/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addJob = async (jobFields: Omit<Job, 'id' | 'status' | 'createdAt' | 'commission' | 'progressUpdates'>): Promise<Job> => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobFields)
    });
    if (!res.ok) {
      throw new Error('Failed to create contract.');
    }
    const data = await res.json();
    await syncDatabase(true);
    return data.job;
  };

  const addJobPosting = async (fields: { title: string; description: string; category: string; location: string; budget: number }): Promise<JobPosting> => {
    if (!currentUser) throw new Error('You must be logged in to post a job.');
    const res = await fetch('/api/job-postings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...fields,
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientPhone: currentUser.phone
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to publish job posting.');
    }
    const data = await res.json();
    await syncDatabase(true);
    return data.jobPosting;
  };

  const submitJobOffer = async (postingId: string, price: number, message: string): Promise<void> => {
    if (!currentUser) throw new Error('You must be logged in to submit an offer.');
    const res = await fetch(`/api/job-postings/${postingId}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: currentUser.id,
        workerName: currentUser.name,
        workerAvatar: currentUser.avatarUrl,
        workerType: currentUser.type,
        price,
        message
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit offer.');
    }
    await syncDatabase(true);
  };

  const acceptJobOffer = async (postingId: string, offerId: string): Promise<void> => {
    const res = await fetch(`/api/job-postings/${postingId}/accept-offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to accept offer.');
    }
    await syncDatabase(true);
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    const res = await fetch('/api/jobs/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const submitPaymentReceipt = async (jobId: string, receiptUrl: string) => {
    const res = await fetch(`/api/jobs/${jobId}/payment-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptUrl })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addProgressUpdate = async (jobId: string, comment: string, imageUrl?: string, videoUrl?: string) => {
    const res = await fetch('/api/jobs/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, comment, imageUrl, videoUrl })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const submitReview = async (jobId: string, rating: number, comment: string, isClientReview: boolean) => {
    const res = await fetch('/api/jobs/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, rating, comment, isClientReview })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addQuoteRequest = async (productId: string, details: string) => {
    if (!currentUser) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: currentUser.id,
        clientName: currentUser.name,
        productId: product.id,
        productName: product.name,
        supplierId: product.supplierId,
        supplierName: product.supplierName,
        details
      })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const replyQuoteByAdmin = async (quoteId: string, price: number) => {
    const res = await adminFetch('/api/admin/reply-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId, price })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const approveQuoteByClient = async (quoteId: string) => {
    const res = await fetch('/api/quotes/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const sendMessage = async (receiverId: string, content: string, channel: 'chat' | 'whatsapp' | 'sms' | 'email' = 'chat') => {
    if (!currentUser) return;
    const receiver = users.find(u => u.id === receiverId);
    if (!receiver) return;

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId,
        receiverName: receiver.name,
        content,
        channel
      })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addConsultancy = async (type: 'architecture' | 'engineering' | 'quantity_surveying', details: string, budget: string, phone: string, email: string) => {
    const res = await fetch('/api/consultancy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: currentUser?.id || 'guest',
        clientName: currentUser?.name || 'Guest Visitor',
        type,
        details,
        budget,
        phone,
        email
      })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const resolveDisputeByAdmin = async (jobId: string, action: 'release' | 'refund') => {
    const res = await adminFetch('/api/admin/resolve-dispute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, action })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateUserProfile = async (userId: string, fields: Partial<User>) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const deleteUserByAdmin = async (userId: string) => {
    const res = await adminFetch(`/api/users/${userId}`, { method: 'DELETE' });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addProductByAdmin = async (productFields: Omit<Product, 'id'>) => {
    const res = await adminFetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productFields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateProductByAdmin = async (productId: string, fields: Partial<Product>) => {
    const res = await adminFetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const deleteProductByAdmin = async (productId: string) => {
    const res = await adminFetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const replyConsultancyByAdmin = async (consultancyId: string, assignedExpert: string, reply: string) => {
    const res = await adminFetch(`/api/consultancy/${consultancyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedExpert, reply })
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addBrochureByAdmin = async (brochureFields: { name: string; category: string; size?: string; fileUrl?: string }) => {
    const res = await adminFetch('/api/brochures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brochureFields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateBrochureByAdmin = async (brochureId: string, fields: { name?: string; category?: string; size?: string; fileUrl?: string }) => {
    const res = await adminFetch(`/api/brochures/${brochureId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const deleteBrochureByAdmin = async (brochureId: string) => {
    const res = await adminFetch(`/api/brochures/${brochureId}`, { method: 'DELETE' });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const incrementBrochureDownload = async (brochureId: string) => {
    const res = await fetch(`/api/brochures/${brochureId}/download`, { method: 'POST' });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateHomepageByAdmin = async (fields: Partial<HomepageSettings>) => {
    const res = await adminFetch('/api/homepage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateSettings = async (fields: any) => {
    const res = await adminFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const addAdvertisement = async (ad: any) => {
    const res = await adminFetch('/api/advertisements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ad)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateAdvertisement = async (adId: string, fields: any) => {
    const res = await adminFetch(`/api/advertisements/${adId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const deleteAdvertisement = async (adId: string) => {
    const res = await adminFetch(`/api/advertisements/${adId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const clearAuditLogs = async () => {
    const res = await adminFetch('/api/admin/audit-logs/clear', {
      method: 'POST'
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const createBackup = async () => {
    const res = await adminFetch('/api/admin/backup/create', { method: 'POST' });
    if (res.ok) {
      await fetchBackups();
    }
  };

  const fetchBackups = async () => {
    const res = await adminFetch('/api/admin/backups');
    if (res.ok) {
      const data = await res.json();
      setBackups(data);
    }
  };

  const restoreBackup = async (fileName: string) => {
    const res = await adminFetch('/api/admin/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName })
    });
    if (res.ok) {
      await syncDatabase(false);
    }
  };

  const downloadDBJson = async () => {
    const res = await adminFetch('/api/admin/backup/download-json', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data.jsonString;
    }
    return '';
  };

  const uploadDBJson = async (jsonString: string) => {
    const res = await adminFetch('/api/admin/backup/upload-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonString })
    });
    if (res.ok) {
      await syncDatabase(false);
      return true;
    }
    return false;
  };

  const uploadFile = async (fileName: string, fileType: string, fileData: string): Promise<string> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType, fileData })
    });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
  };

  const addProjectByAdmin = async (projectFields: Omit<Project, 'id'>) => {
    const res = await adminFetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectFields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const updateProjectByAdmin = async (projectId: string, fields: Partial<Project>) => {
    const res = await adminFetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const deleteProjectByAdmin = async (projectId: string) => {
    const res = await adminFetch(`/api/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const clearDispatches = async () => {
    const res = await adminFetch('/api/dispatches/clear', { method: 'POST' });
    if (res.ok) {
      await syncDatabase(true);
    }
  };

  const askAiFeasibility = async (projectType: string, details: string, budget: string, location: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/feasibility-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectType, details, budget, location })
      });
      if (res.ok) {
        const data = await res.json();
        return data.aiAnalysis;
      }
    } catch (err) {
      console.error('Error asking AI:', err);
    }
    return 'Failed to analyze your project. Please verify your connection.';
  };

  const addClientRequest = async (request: Omit<ClientRequest, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/client-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (res.ok) {
        await syncDatabase(true);
      }
    } catch (err) {
      console.error('Failed to add client request:', err);
    }
  };

  const updateClientRequest = async (id: string, fields: Partial<ClientRequest>) => {
    try {
      const res = await adminFetch(`/api/client-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        await syncDatabase(true);
      }
    } catch (err) {
      console.error('Failed to update client request:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      products,
      jobs,
      jobPostings,
      quotes,
      messages,
      consultancies,
      dispatches,
      brochures,
      homepage,
      projects,
      clientRequests,
      isLoading,
      isAuthOpen,
      setIsAuthOpen,
      setCurrentUser: setCurrentUserState,
      login,
      register,
      logout,
      changeAdminPassword,
      updateUserProfile,
      deleteUserByAdmin,
      verifyUserByAdmin,
      addProductByAdmin,
      updateProductByAdmin,
      deleteProductByAdmin,
      addJob,
      addJobPosting,
      submitJobOffer,
      acceptJobOffer,
      updateJobStatus,
      addProgressUpdate,
      submitPaymentReceipt,
      submitReview,
      addQuoteRequest,
      replyQuoteByAdmin,
      approveQuoteByClient,
      sendMessage,
      addConsultancy,
      replyConsultancyByAdmin,
      resolveDisputeByAdmin,
      addBrochureByAdmin,
      updateBrochureByAdmin,
      deleteBrochureByAdmin,
      incrementBrochureDownload,
      updateHomepageByAdmin,
      addProjectByAdmin,
      updateProjectByAdmin,
      deleteProjectByAdmin,
      clearDispatches,
      askAiFeasibility,
      addClientRequest,
      updateClientRequest,
      syncDatabase,
      settings,
      updateSettings,
      advertisements,
      addAdvertisement,
      updateAdvertisement,
      deleteAdvertisement,
      auditLogs,
      clearAuditLogs,
      backups,
      createBackup,
      fetchBackups,
      restoreBackup,
      downloadDBJson,
      uploadDBJson,
      uploadFile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
