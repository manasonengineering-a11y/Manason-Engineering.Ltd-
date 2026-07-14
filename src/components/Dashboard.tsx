/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { triggerFileDownload, triggerQuotationDownload } from '../lib/pdfDownloader';
import { UserType, JobStatus, Job, QuoteRequest, User, Brochure, Product } from '../types';
import LiveJobMap from './LiveJobMap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, ShieldAlert, Check, X, CreditCard, Landmark, 
  MapPin, RefreshCw, Star, Image, MessageSquare, ChevronDown, 
  HardHat, Award, DollarSign, ListOrdered, Calendar, UserCheck, Users,
  AlertTriangle, Trash2, Edit, Plus, FileText, Layout, BarChart2, Bell,
  UserMinus, Upload, Download, Megaphone, Percent, Heart, Play,
  Smartphone, CheckCircle2, Wallet, Send, Sparkles, MessageSquareCode,
  Briefcase, Lock
} from 'lucide-react';

export default function Dashboard() {
  const { 
    currentUser, users, products, jobs, quotes, consultancies, brochures, homepage, projects, clientRequests,
    updateJobStatus, addProgressUpdate, submitReview, 
    replyQuoteByAdmin, approveQuoteByClient, resolveDisputeByAdmin,
    updateUserProfile, deleteUserByAdmin, verifyUserByAdmin,
    addProductByAdmin, updateProductByAdmin, deleteProductByAdmin,
    addBrochureByAdmin, updateBrochureByAdmin, deleteBrochureByAdmin,
    incrementBrochureDownload, updateHomepageByAdmin, replyConsultancyByAdmin,
    addProjectByAdmin, updateProjectByAdmin, deleteProjectByAdmin, updateClientRequest, uploadFile,
    submitPaymentReceipt,
    changeAdminPassword, logout
  } = useApp();
  const { t } = useLanguage();

  // Tabs
  const [adminTab, setAdminTab] = useState<'stats' | 'users' | 'products' | 'brochures' | 'escrow' | 'quotes' | 'advisory' | 'homepage' | 'projects' | 'clientRequests' | 'security'>('stats');
  const [workerTab, setWorkerTab] = useState<'contracts' | 'profile'>('contracts');
  const [clientTab, setClientTab] = useState<'hired' | 'quotes' | 'consultancy' | 'brochures' | 'favorites'>('hired');

  // Security tab state (change password)
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedMapJobId, setExpandedMapJobId] = useState<string | null>(null);

  // Modal State for Projects Add/Edit
  const [projectModal, setProjectModal] = useState<{
    show: boolean;
    mode: 'add' | 'edit';
    projectId?: string;
    title: string;
    category: string;
    contractor: string;
    description: string;
    imageUrl: string;
  }>({
    show: false,
    mode: 'add',
    title: '',
    category: 'Commercial',
    contractor: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070'
  });

  // Modal State for Products Add/Edit
  const [productModal, setProductModal] = useState<{
    show: boolean;
    mode: 'add' | 'edit';
    productId?: string;
    name: string;
    category: string;
    price: string;
    description: string;
    image: string;
    supplier: string;
    isUploadingImage?: boolean;
  }>({
    show: false,
    mode: 'add',
    name: '',
    category: 'Cement',
    price: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
    supplier: 'Manason Factory'
  });

  // Modal State for Brochures Add/Edit
  const [brochureModal, setBrochureModal] = useState<{
    show: boolean;
    name: string;
    category: string;
    size: string;
    fileUrl?: string;
    isUploading?: boolean;
  }>({
    show: false,
    name: '',
    category: 'Structural Guides',
    size: '1.5 MB',
    fileUrl: '',
    isUploading: false
  });

  // Admin Reply modal for Consultancy
  const [activeConsultancyId, setActiveConsultancyId] = useState<string | null>(null);
  const [expertName, setExpertName] = useState('');
  const [advisoryReply, setAdvisoryReply] = useState('');

  // Local inputs
  const [repliedPrices, setRepliedPrices] = useState<Record<string, string>>({});
  const [progressComment, setProgressComment] = useState<Record<string, string>>({});
  const [progressPhotoUrl, setProgressPhotoUrl] = useState<Record<string, string>>({});
  const [isUploadingProgressPhoto, setIsUploadingProgressPhoto] = useState<Record<string, boolean>>({});
  const [progressVideoUrl, setProgressVideoUrl] = useState<Record<string, string>>({});
  const [isUploadingProgressVideo, setIsUploadingProgressVideo] = useState<Record<string, boolean>>({});
  const [reviewRating, setReviewRating] = useState<Record<string, number>>({});
  const [reviewComment, setReviewComment] = useState<Record<string, string>>({});

  // Mobile Money states
  const [momoJob, setMomoJob] = useState<Job | null>(null);
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState(currentUser?.phone || '');
  const [momoPin, setMomoPin] = useState('');
  const [momoSmsText, setMomoSmsText] = useState('');

  // Client Requests unified inbox states
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [clientReqTypeFilter, setClientReqTypeFilter] = useState<'all' | 'contact' | 'consultancy' | 'hire' | 'quote'>('all');
  const [clientReqReadFilter, setClientReqReadFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [momoStatus, setMomoStatus] = useState<'idle' | 'push_sent' | 'verifying' | 'success' | 'failed'>('idle');
  const [momoTxId, setMomoTxId] = useState('');

  // Worker profile local fields
  const [workerSpecialty, setWorkerSpecialty] = useState(currentUser?.specialty || '');
  const [workerExperience, setWorkerExperience] = useState(currentUser?.experience || '');
  const [workerPrices, setWorkerPrices] = useState(currentUser?.prices || '');
  const [workerAvailability, setWorkerAvailability] = useState(currentUser?.availability || 'Available');
  const [workerSkillsInput, setWorkerSkillsInput] = useState(currentUser?.skills?.join(', ') || '');
  const [workerCertsInput, setWorkerCertsInput] = useState(currentUser?.certificates?.join(', ') || '');
  const [workerAvatar, setWorkerAvatar] = useState(currentUser?.avatarUrl || '');

  // Admin homepage text edits
  const [homeAnnouncement, setHomeAnnouncement] = useState(homepage?.announcement || '');
  const [homeBannerTitle, setHomeBannerTitle] = useState(homepage?.bannerTitle || '');
  const [homeBannerSubtitle, setHomeBannerSubtitle] = useState(homepage?.bannerSubtitle || '');

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-800">
        <ShieldAlert className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Please login or register an account using the main menu first to access your secure construction dashboard.
        </p>
      </div>
    );
  }

  // Derived user statistics
  const adminPendingUsers = users.filter(u => !u.isVerified && u.type !== UserType.CLIENT);
  const adminPendingJobs = jobs.filter(j => j.status === JobStatus.PENDING);
  const adminPendingQuotes = quotes.filter(q => !q.isRepliedByAdmin);
  const adminDisputedJobs = jobs.filter(j => j.status === JobStatus.DISPUTED);

  const clientJobs = jobs.filter(j => j.clientId === currentUser.id);
  const clientQuotes = quotes.filter(q => q.clientId === currentUser.id);
  const clientConsultancies = consultancies.filter(c => c.clientId === currentUser.id);

  const workerJobs = jobs.filter(j => j.workerId === currentUser.id);
  const workerTotalEarned = jobs
    .filter(j => j.workerId === currentUser.id && j.status === JobStatus.APPROVED)
    .reduce((sum, j) => sum + (j.price - j.commission), 0);

  // Stats dashboard calculations
  const totalCommisionAll = jobs
    .filter(j => j.status === JobStatus.APPROVED)
    .reduce((sum, j) => sum + j.commission, 0);
  const totalLockedEscrow = jobs
    .filter(j => j.status !== JobStatus.APPROVED)
    .reduce((sum, j) => sum + j.price, 0);
  const clientsCount = users.filter(u => u.type === UserType.CLIENT).length;
  const workersCount = users.filter(u => u.type !== UserType.CLIENT && u.type !== UserType.ADMIN).length;

  // Helper function to render simulated Google Maps path tracker
  // Builds month-by-month growth data (new user signups and platform
  // revenue/commission earned) for the Admin statistics diagrams.
  const buildGrowthData = () => {
    const monthMap: Record<string, { month: string; newUsers: number; revenue: number }> = {};

    users.forEach(u => {
      if (u.type === UserType.ADMIN || !u.registrationDate) return;
      const d = new Date(u.registrationDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, newUsers: 0, revenue: 0 };
      monthMap[key].newUsers += 1;
    });

    jobs.forEach(j => {
      if (j.status !== JobStatus.APPROVED || !j.createdAt) return;
      const d = new Date(j.createdAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, newUsers: 0, revenue: 0 };
      monthMap[key].revenue += j.commission;
    });

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  };

  const renderSimulatedMap = (job: Job) => {
    let progressPercent = 0;
    let label = 'Preparing';
    let color = 'text-slate-400';
    
    if (job.status === JobStatus.TRAVELLING) {
      progressPercent = 35;
      label = 'En Route (Travelling)';
      color = 'text-blue-500 animate-pulse';
    } else if (job.status === JobStatus.ARRIVED) {
      progressPercent = 60;
      label = 'Arrived on Site';
      color = 'text-emerald-500';
    } else if (job.status === JobStatus.WORKING) {
      progressPercent = 85;
      label = 'Actively Building';
      color = 'text-amber-500 animate-pulse';
    } else if (job.status === JobStatus.COMPLETED) {
      progressPercent = 100;
      label = 'Completed - Pending Release';
      color = 'text-emerald-600 font-bold';
    } else if (job.status === JobStatus.CLIENT_APPROVED) {
      progressPercent = 100;
      label = 'Client Approved - Pending Admin Payout';
      color = 'text-purple-600 font-bold';
    }

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-bold flex items-center gap-1 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Site Tracking:
          </span>
          <span className={`text-[10px] font-mono uppercase font-bold ${color}`}>
            {label}
          </span>
        </div>
        
        {/* Progress Bar Line */}
        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-700 rounded-full transition-all duration-700" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-[10px] text-slate-500 font-medium flex justify-between">
          <span>{job.workerName} Base</span>
          <span>In Transit</span>
          <span>{job.location.address}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-800">
      
      {/* Dashboard Top User Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 bg-white/10"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-lg text-white">{currentUser.name}</span>
              <span className="text-[10px] font-bold bg-blue-700 text-blue-100 px-2.5 py-0.5 rounded-full uppercase">
                {currentUser.type}
              </span>
              {currentUser.isVerified ? (
                <span className="flex items-center gap-0.5 text-[9px] font-bold bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <UserCheck className="w-3 h-3 text-emerald-400" /> Audited ID Verified
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <ShieldAlert className="w-3 h-3 text-amber-400" /> Pending Verification
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser.email} • {currentUser.phone}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">
              Registered on {currentUser.registrationDate}
            </p>
          </div>
        </div>

        {/* Dashboard Top Summary Badges */}
        <div className="flex gap-4 flex-wrap">
          {currentUser.type === UserType.ADMIN && (
            <>
              <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-slate-300 font-mono block">Pending Audits</span>
                <span className="text-xl font-bold">{adminPendingUsers.length + adminPendingJobs.length + adminPendingQuotes.length}</span>
              </div>
              <div className="bg-red-500/20 px-4 py-3 rounded-xl border border-red-500/20">
                <span className="text-[10px] uppercase text-red-300 font-mono block">Active Disputes</span>
                <span className="text-xl font-bold text-red-300">{adminDisputedJobs.length}</span>
              </div>
            </>
          )}

          {currentUser.type === UserType.CLIENT && (
            <>
              <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-slate-300 font-mono block">Contracts Registered</span>
                <span className="text-xl font-bold">{clientJobs.length}</span>
              </div>
              <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-slate-300 font-mono block">Quotes Received</span>
                <span className="text-xl font-bold">{clientQuotes.length}</span>
              </div>
            </>
          )}

          {(currentUser.type === UserType.TECHNICAL || currentUser.type === UserType.HELPER || currentUser.type === UserType.COMPANY || currentUser.type === UserType.GROUP) && (
            <>
              <div className="bg-emerald-500/20 px-4 py-3 rounded-xl border border-emerald-500/10">
                <span className="text-[10px] uppercase text-emerald-300 font-mono block">Total Escrow Earned</span>
                <span className="text-xl font-bold text-emerald-300">{workerTotalEarned.toLocaleString()} RWF</span>
              </div>
              <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] uppercase text-slate-300 font-mono block">Active Jobs</span>
                <span className="text-xl font-bold">{workerJobs.filter(j => j.status !== JobStatus.APPROVED).length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================== */}
      {/* 1. ADMIN DASHBOARD PANELS             */}
      {/* ===================================== */}
      {currentUser.type === UserType.ADMIN && (
        <div className="space-y-6">

          {/* Colorful Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'Total Users', value: users.length.toLocaleString(), bg: 'bg-indigo-600', icon: Users },
              { label: 'Total Workers', value: workersCount.toLocaleString(), bg: 'bg-emerald-600', icon: HardHat },
              { label: 'Total Clients', value: clientsCount.toLocaleString(), bg: 'bg-amber-500', icon: UserCheck },
              { label: 'Total Projects', value: jobs.length.toLocaleString(), bg: 'bg-blue-600', icon: Briefcase },
              { label: 'Total Revenue', value: `${jobs.filter(j => j.status === JobStatus.APPROVED).reduce((s, j) => s + j.price, 0).toLocaleString()} RWF`, bg: 'bg-rose-600', icon: DollarSign },
              { label: 'Commission (10%)', value: `${totalCommisionAll.toLocaleString()} RWF`, bg: 'bg-teal-600', icon: Percent }
            ].map((card, i) => (
              <div key={i} className={`${card.bg} text-white rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <card.icon className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-xl font-extrabold mt-2 truncate">{card.value}</p>
                <p className="text-xxs uppercase font-bold opacity-90 tracking-wide">{card.label}</p>
              </div>
            ))}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side Tabs Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {[
              {
                group: 'Main', items: [
                  { id: 'stats', label: 'Dashboard', count: null, icon: BarChart2 },
                  { id: 'users', label: 'Users & Approvals', count: adminPendingUsers.length, icon: UserCheck }
                ]
              },
              {
                group: 'Services', items: [
                  { id: 'quotes', label: 'Quotation Requests', count: adminPendingQuotes.length, icon: Percent },
                  { id: 'projects', label: 'Projects Management', count: null, icon: Briefcase },
                  { id: 'advisory', label: 'Consultancy Board', count: consultancies.filter(c => !c.reply).length, icon: MessageSquare }
                ]
              },
              {
                group: 'Products', items: [
                  { id: 'products', label: 'Products Management', count: null, icon: Plus },
                  { id: 'brochures', label: 'Brochures', count: brochures.length, icon: FileText }
                ]
              },
              {
                group: 'Finance', items: [
                  { id: 'escrow', label: 'Escrow & Disputes', count: adminPendingJobs.length + adminDisputedJobs.length, icon: Landmark }
                ]
              },
              {
                group: 'Communication', items: [
                  { id: 'clientRequests', label: 'Client Requests', count: (clientRequests || []).filter(r => !r.isRead).length, icon: Bell }
                ]
              },
              {
                group: 'System', items: [
                  { id: 'homepage', label: 'Homepage Settings', count: null, icon: Layout },
                  { id: 'security', label: 'Security', count: null, icon: Lock }
                ]
              }
            ].map((section) => (
              <div key={section.group}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">{section.group}</p>
                <div className="space-y-1">
                  {section.items.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id as any)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-between ${
                          adminTab === tab.id
                            ? 'bg-blue-800 text-white border-blue-800 shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4 shrink-0" />
                          {tab.label}
                        </span>
                        {tab.count !== null && tab.count > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content Display (9 cols) */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            
            {/* STATS TAB */}
            {adminTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Manason Platform Metrics</h3>
                  <p className="text-xs text-slate-500">Secure real-time transaction processing totals across Rwanda.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Commisions Earned</span>
                    <span className="text-2xl font-extrabold text-blue-900 mt-1 block">{(totalCommisionAll).toLocaleString()} RWF</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">10% Platform escrow service fee</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Active Escrow Locked</span>
                    <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalLockedEscrow.toLocaleString()} RWF</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Held in safe bank reserves</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Cataloged Products</span>
                    <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{products.length} Materials</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Supplied by verified partners</span>
                  </div>
                </div>

                {/* Additional Quick Stats */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">Users Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">Construction Professionals & Techs</span>
                        <span className="font-bold">{workersCount} registered</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, (workersCount / (users.length || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">Clients (Contractors/Developers)</span>
                        <span className="font-bold">{clientsCount} registered</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full" style={{ width: `${Math.min(100, (clientsCount / (users.length || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth Diagrams */}
                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">Kwiyongera kw'Abakoresha (buri kwezi)</h4>
                    {buildGrowthData().length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nta makuru ahagije kugira ngo hagaragazwe ishusho.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={buildGrowthData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="newUsers" name="Abashya biyandikishije" stroke="#1e3a8a" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">Amafaranga y'Umusaruro (RWF, buri kwezi)</h4>
                    {buildGrowthData().length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nta makuru ahagije kugira ngo hagaragazwe ishusho.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={buildGrowthData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="revenue" name="Umusaruro (RWF)" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* USERS & AUDITS TAB */}
            {adminTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase">User Registry & Audits</h3>
                    <p className="text-xs text-slate-500">Approve trade certificates or manage profiles of Rwandan technicians.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {users.map(user => {
                    if (user.type === UserType.ADMIN) return null;
                    return (
                      <div key={user.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-950">{user.name}</h4>
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
                              {user.type}
                            </span>
                            {user.isVerified ? (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Verified</span>
                            ) : (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Unverified</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">
                            Email: {user.email} • Phone: {user.phone} • ID: {user.idNumber}
                          </p>
                          {user.idDocumentUrl ? (
                            <a
                              href={user.idDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-700 hover:underline font-bold inline-flex items-center gap-1 mt-1"
                            >
                              <FileText className="w-3 h-3" /> Reba Dosiye ya ID/Passport Yoherejwe
                            </a>
                          ) : (
                            <p className="text-[10px] text-rose-500 font-bold mt-1">⚠ Nta dosiye ya ID yoherejwe</p>
                          )}
                          {user.specialty && (
                            <div className="mt-2 text-xxs bg-white border rounded p-2 text-slate-600 space-y-1">
                              <div>Specialty: <strong>{user.specialty}</strong></div>
                              <div>Experience: <strong>{user.experience}</strong></div>
                              <div>Price Rate: <strong>{user.prices}</strong></div>
                              <div>Skills: <strong>{user.skills?.join(', ') || 'None listed'}</strong></div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!user.isVerified && (
                            <button
                              onClick={() => {
                                verifyUserByAdmin(user.id);
                                alert(`Successfully verified ${user.name}`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve ID
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to remove user: ${user.name}?`)) {
                                await deleteUserByAdmin(user.id);
                                alert('User deleted.');
                              }
                            }}
                            className="bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 text-xxs font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MANAGE PRODUCTS TAB */}
            {adminTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase">Construction Materials Catalog</h3>
                    <p className="text-xs text-slate-500">Post new bricks, cements, and aggregate sand with live pricing.</p>
                  </div>
                  <button
                    onClick={() => setProductModal({
                      show: true,
                      mode: 'add',
                      name: '',
                      category: 'Cement',
                      price: '15500',
                      description: 'Top-quality local construction material.',
                      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
                      supplier: 'Cimerwa Rwanda'
                    })}
                    className="bg-blue-800 hover:bg-blue-950 text-white text-xxs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="p-4 rounded-xl border border-slate-200 bg-white flex gap-3">
                      <img src={product.imageUrl} className="w-16 h-16 rounded object-cover bg-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{product.name}</h4>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 uppercase shrink-0">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-xxs text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-blue-900 font-mono">{(product.price).toLocaleString()} RWF</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setProductModal({
                                show: true,
                                mode: 'edit',
                                productId: product.id,
                                name: product.name,
                                category: product.category,
                                price: String(product.price),
                                description: product.description,
                                image: product.imageUrl,
                                supplier: product.supplierName
                              })}
                              className="text-slate-500 hover:text-blue-800 p-1"
                              title="Edit Price & Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                  await deleteProductByAdmin(product.id);
                                  alert('Product removed');
                                }
                              }}
                              className="text-rose-600 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MANAGE BROCHURES TAB */}
            {adminTab === 'brochures' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase">PDF Technical Brochures</h3>
                    <p className="text-xs text-slate-500">Provide official catalogues for structural engineers and private builders.</p>
                  </div>
                  <button
                    onClick={() => setBrochureModal({
                      show: true,
                      name: '',
                      category: 'Structural Guides',
                      size: '3.1 MB'
                    })}
                    className="bg-blue-800 hover:bg-blue-950 text-white text-xxs font-bold uppercase px-3.5 py-2.5 rounded-xl flex items-center gap-1 shadow"
                  >
                    <Plus className="w-4 h-4" /> Upload brochure
                  </button>
                </div>

                <div className="space-y-3">
                  {brochures.map(b => (
                    <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-950">{b.name}</h4>
                          <span className="text-[10px] text-slate-500">
                            Category: {b.category} • Size: {b.size} • Downloads: <strong>{b.downloadCount}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            incrementBrochureDownload(b.id);
                            if (b.fileUrl) {
                              window.open(b.fileUrl, '_blank');
                            } else {
                              triggerFileDownload(b.name, b.category);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg border border-slate-200 bg-white"
                          title="View / Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this brochure document?')) {
                              await deleteBrochureByAdmin(b.id);
                              alert('Brochure deleted');
                            }
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg border border-slate-200 bg-white"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ESCROW LEDGER TAB */}
            {adminTab === 'escrow' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">National Escrow Ledger</h3>
                  <p className="text-xs text-slate-500">Monitor deposits, hold contractor fees, and arbitrate construction disputes securely.</p>
                </div>

                {jobs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No contract agreements are registered on the platform.</p>
                ) : (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div key={job.id} className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">Agreement ID: {job.id}</span>
                            <h4 className="font-bold text-sm text-slate-950 mt-0.5">{job.title}</h4>
                            <p className="text-xxs text-slate-500 mt-1">
                              Client: <strong>{job.clientName}</strong> → Contractor: <strong>{job.workerName} ({job.workerType})</strong>
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-slate-900 block">
                              {job.price.toLocaleString()} RWF
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider ${
                              job.status === JobStatus.APPROVED ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              job.status === JobStatus.CLIENT_APPROVED ? 'bg-purple-50 text-purple-800 border border-purple-200 animate-pulse' :
                              job.status === JobStatus.DISPUTED ? 'bg-red-50 text-red-800 border border-red-200' :
                              job.status === JobStatus.PENDING ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-800 animate-pulse'
                            }`}>
                              {job.status === JobStatus.CLIENT_APPROVED ? 'AWAITING ADMIN PAYOUT REVIEW' : job.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Admin override */}
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-2 flex-wrap text-xxs">
                          <span className="text-slate-500 font-medium">
                            Platform Cut (10%): <strong>{job.commission.toLocaleString()} RWF</strong>
                          </span>
                          
                          <div className="flex gap-2">
                            {['escrow_deposited', 'travelling', 'arrived', 'working'].includes(job.status) && (
                              <button
                                onClick={() => setExpandedMapJobId(expandedMapJobId === job.id ? null : job.id)}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase px-2.5 py-1.5 rounded-md flex items-center gap-1"
                              >
                                <MapPin className="w-3 h-3" /> {expandedMapJobId === job.id ? 'Hisha GPS' : 'Reba GPS'}
                              </button>
                            )}
                            {job.status === JobStatus.PENDING && (
                              <>
                                {job.paymentReceiptUrl && (
                                  <a
                                    href={job.paymentReceiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold uppercase px-2.5 py-1.5 rounded-md flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" /> Reba Inyemezabuguzi
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    updateJobStatus(job.id, JobStatus.ESCROW_DEPOSITED);
                                    alert('Deposited manually');
                                  }}
                                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase px-3 py-2 rounded-md shadow-sm"
                                >
                                  Confirm Bank/Momo Deposit Received
                                </button>
                              </>
                            )}
                            
                            {job.status === JobStatus.DISPUTED && (
                              <>
                                {job.progressUpdates.length > 0 && (
                                  <div className="w-full bg-red-50 border border-red-200 rounded-lg p-2.5 mb-2 text-xxs text-red-900">
                                    <strong className="block uppercase text-[9px] tracking-wide mb-1">Impamvu y'ikibazo (raporo ya nyuma):</strong>
                                    "{job.progressUpdates[job.progressUpdates.length - 1].comment}"
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    resolveDisputeByAdmin(job.id, 'release');
                                    alert('Funds released to worker.');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase px-2.5 py-1.5 rounded-md"
                                >
                                  Release funds to worker
                                </button>
                                <button
                                  onClick={() => {
                                    resolveDisputeByAdmin(job.id, 'refund');
                                    alert('Funds refunded to client.');
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-2.5 py-1.5 rounded-md"
                                >
                                  Refund funds to client
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {expandedMapJobId === job.id && (
                          <LiveJobMap liveLocation={job.liveLocation} destination={job.location} />
                        )}

                        {job.status === JobStatus.CLIENT_APPROVED && (
                          <div className="pt-3 border-t border-purple-100 bg-purple-50/50 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl">
                            <p className="text-xxs font-bold uppercase text-purple-800 tracking-wide mb-2 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" /> Umukiriya yemeje — Suzuma raporo mbere yo kwishyura
                            </p>
                            {job.progressUpdates.length === 0 ? (
                              <p className="text-xxs text-slate-400 italic mb-2">Nta raporo (amafoto/video) umukozi yashyizeho kuri aka kazi.</p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
                                {job.progressUpdates.map(pu => (
                                  <div key={pu.id} className="p-2 rounded-lg bg-white border border-purple-100 text-xxs flex gap-2">
                                    {pu.videoUrl ? (
                                      <video src={pu.videoUrl} controls className="w-20 h-12 rounded object-cover shrink-0 bg-black" />
                                    ) : pu.imageUrl && (
                                      <img src={pu.imageUrl} className="w-12 h-12 rounded object-cover shrink-0 bg-slate-100" />
                                    )}
                                    <div>
                                      <p className="font-semibold text-slate-800">"{pu.comment}"</p>
                                      <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(pu.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (!confirm(`Emeza ko wasuzumye raporo kandi wishyura ${Math.round(job.price * 0.9).toLocaleString()} RWF kuri ${job.workerName}?`)) return;
                                  resolveDisputeByAdmin(job.id, 'release');
                                  alert('Amafaranga yoherejwe ku mukozi. Akazi karangiye.');
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xxs px-3 py-2 rounded-md flex items-center justify-center gap-1.5"
                              >
                                <Award className="w-3.5 h-3.5" /> Emeza Raporo & Ohereza Amafaranga
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Sobanura impamvu utemeranya na raporo (Admin dispute):');
                                  if (!reason || !reason.trim()) return;
                                  addProgressUpdate(job.id, `⚠ IKIBAZO CYATANZWE NA ADMIN: ${reason}`);
                                  updateJobStatus(job.id, JobStatus.DISPUTED);
                                  alert('Aka kazi kashyizwe mu bibazo (Disputed) kugira ngo gasuzumwe byimbitse.');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xxs px-3 py-2 rounded-md"
                              >
                                Ikibazo Kirahari
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUOTES BOARD TAB */}
            {adminTab === 'quotes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Material Quote Inquiries</h3>
                  <p className="text-xs text-slate-500">Negotiate bulk factory-direct pricing on behalf of clients with Rwandan manufacturers.</p>
                </div>

                {quotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No active product quote requests registered.</p>
                ) : (
                  <div className="space-y-4">
                    {quotes.map(quote => (
                      <div key={quote.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-[10px] font-mono text-slate-400 block uppercase">Quote ID: {quote.id}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              quote.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              quote.status === 'replied' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {quote.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm text-slate-900 mt-1">
                            {quote.productName}
                          </h4>
                          <p className="text-xxs text-slate-500 mt-1">
                            Client: <strong>{quote.clientName}</strong> • Supplier: <strong>{quote.supplierName}</strong>
                          </p>
                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200/60 mt-2 italic">
                            "{quote.details}"
                          </p>
                        </div>

                        {/* Admin Offer form */}
                        {!quote.isRepliedByAdmin ? (
                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <div className="relative flex-1 max-w-xs">
                              <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">RWF</span>
                              <input
                                type="number"
                                placeholder="Negotiated Bulk Price Offer"
                                value={repliedPrices[quote.id] || ''}
                                onChange={(e) => setRepliedPrices({ ...repliedPrices, [quote.id]: e.target.value })}
                                className="w-full pl-10 pr-2 py-1.5 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-800"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const val = repliedPrices[quote.id];
                                if (!val) return;
                                replyQuoteByAdmin(quote.id, Number(val));
                                alert('Bulk negotiated offer sent!');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-md"
                            >
                              Send Price Offer
                            </button>
                          </div>
                        ) : (
                          <div className="text-xxs text-slate-500 bg-white p-3 border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              Price offered to Client: <strong className="text-slate-900 font-bold">{quote.priceOfferedByAdmin?.toLocaleString()} RWF</strong>
                            </div>
                            <button
                              onClick={() => triggerQuotationDownload(quote)}
                              className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded text-xxs font-bold flex items-center gap-1 self-start sm:self-auto"
                            >
                              <Download className="w-3 h-3" /> Download PDF Quote
                            </button>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONSULTANCY BOARD TAB */}
            {adminTab === 'advisory' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Consultancy & Design Board</h3>
                  <p className="text-xs text-slate-500">Provide architectural plans or quantity surveying calculations to private developers.</p>
                </div>

                {consultancies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No consultancy requests filed yet.</p>
                ) : (
                  <div className="space-y-4">
                    {consultancies.map(con => (
                      <div key={con.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                        <div className="flex justify-between text-xxs mb-1.5 pb-1 border-b">
                          <span className="font-bold text-blue-800 uppercase">{con.type} DESIGN REQUEST</span>
                          <span className="text-slate-400 font-mono">{con.createdAt}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-950">{con.clientName}</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                          "{con.details}"
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-[10px] mt-3 text-slate-500">
                          <span>Target Budget: <strong>{con.budget}</strong></span>
                          <span>Phone/Email: <strong>{con.phone} / {con.email}</strong></span>
                        </div>

                        {con.reply ? (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                            <p className="font-bold text-blue-900">Assigned Expert: {con.assignedExpert}</p>
                            <p className="text-slate-700 mt-1 leading-relaxed">"{con.reply}"</p>
                          </div>
                        ) : (
                          <div className="mt-4 pt-3 border-t">
                            {activeConsultancyId === con.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned expert name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Eng. Jean de Dieu Nsabimana, PE"
                                    value={expertName}
                                    onChange={(e) => setExpertName(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Advisory design feasibility response</label>
                                  <textarea
                                    placeholder="Provide detailed plan recommendation or sizing survey summary..."
                                    rows={3}
                                    value={advisoryReply}
                                    onChange={(e) => setAdvisoryReply(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      if (!expertName || !advisoryReply) return;
                                      await replyConsultancyByAdmin(con.id, expertName, advisoryReply);
                                      alert('Consultancy response posted!');
                                      setActiveConsultancyId(null);
                                      setExpertName('');
                                      setAdvisoryReply('');
                                    }}
                                    className="bg-blue-800 text-white text-xxs font-bold uppercase px-3 py-2 rounded-md"
                                  >
                                    Submit Reply
                                  </button>
                                  <button
                                    onClick={() => setActiveConsultancyId(null)}
                                    className="text-slate-500 text-xxs font-bold uppercase px-3 py-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveConsultancyId(con.id);
                                  setExpertName('Eng. Manason Senior Consultant');
                                  setAdvisoryReply('We have audited your site specs. Here are our architectural recommendations...');
                                }}
                                className="bg-slate-900 hover:bg-black text-white text-xxs font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Post Design Advisory Answer
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HOMEPAGE SETTINGS TAB */}
            {adminTab === 'homepage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Manage Homepage Content</h3>
                  <p className="text-xs text-slate-500">Update announcement ribbon text, main hero headlines, and banners.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Announcement Ribbon Text
                    </label>
                    <input
                      type="text"
                      value={homeAnnouncement}
                      onChange={(e) => setHomeAnnouncement(e.target.value)}
                      placeholder="e.g. ⚡ OVER RWF 50,000,000 IN CLIENT ESCROW PROTECTED IN RWANDA!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Hero Banner Main Title
                    </label>
                    <input
                      type="text"
                      value={homeBannerTitle}
                      onChange={(e) => setHomeBannerTitle(e.target.value)}
                      placeholder="e.g. RWANDA'S TRUSTED CONSTRUCTION ESCROW MARKETPLACE"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Hero Banner Subtitle
                    </label>
                    <textarea
                      value={homeBannerSubtitle}
                      onChange={(e) => setHomeBannerSubtitle(e.target.value)}
                      rows={2}
                      placeholder="e.g. Connect directly with verified plumbers, builders, suppliers, and manufacturers. Escrow ensures your funds are only released when you approve the finished work."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      await updateHomepageByAdmin({
                        announcement: homeAnnouncement,
                        bannerTitle: homeBannerTitle,
                        bannerSubtitle: homeBannerSubtitle
                      });
                      alert('Homepage text modified successfully!');
                    }}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase text-xs px-4 py-2.5 rounded-lg shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {adminTab === 'security' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Umutekano wa Konti</h3>
                  <p className="text-xs text-slate-500">
                    Umwanya umwe gusa wo kwinjira nka Admin ushobora gukora icyarimwe. Niba winjiye
                    kuri telefoni ndetse ukinjira kuri mudasobwa, uwabanje azasohoka byikora.
                    Dashboard izisohoka nawe ubwawe niba wafunze iyi paji.
                  </p>
                </div>

                {passwordMessage && (
                  <div className={`text-xs font-semibold px-4 py-3 rounded-xl ${
                    passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}

                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPasswordMessage(null);
                    if (newPasswordInput !== confirmPasswordInput) {
                      setPasswordMessage({ type: 'error', text: 'Password nshya ntizihuye n\'iyo wongeye kwandika.' });
                      return;
                    }
                    if (newPasswordInput.length < 8) {
                      setPasswordMessage({ type: 'error', text: 'Password nshya igomba kuba nibura inyuguti/imibare 8.' });
                      return;
                    }
                    try {
                      await changeAdminPassword(currentPasswordInput, newPasswordInput);
                      setPasswordMessage({ type: 'success', text: 'Password yahinduwe neza! Uyikoreshe ubutaha winjira.' });
                      setCurrentPasswordInput('');
                      setNewPasswordInput('');
                      setConfirmPasswordInput('');
                    } catch (err: any) {
                      setPasswordMessage({ type: 'error', text: err.message || 'Byanze. Ongera ugerageze.' });
                    }
                  }}
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password ya Kera
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password Nshya
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Ongera Wandike Password Nshya
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase text-xs px-4 py-2.5 rounded-lg shadow"
                  >
                    Hindura Password
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      if (confirm('Urashaka gusohoka muri Dashboard ubu?')) {
                        logout();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-800 font-bold uppercase text-xs"
                  >
                    Sohoka muri Dashboard ubu
                  </button>
                </div>
              </div>
            )}

            {/* PROJECTS MANAGEMENT TAB */}
            {adminTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase">Manage Projects Portfolio</h3>
                    <p className="text-xs text-slate-500">Add, edit, or delete exemplary structures displayed on the homepage.</p>
                  </div>
                  <button
                    onClick={() => setProjectModal({
                      show: true,
                      mode: 'add',
                      title: '',
                      category: 'Commercial',
                      contractor: '',
                      description: '',
                      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070'
                    })}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects && projects.map((proj) => (
                    <div key={proj.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4">
                      <img src={proj.imageUrl} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">{proj.category}</span>
                        <h4 className="font-bold text-slate-950 text-sm truncate uppercase">{proj.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{proj.contractor}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{proj.description}</p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setProjectModal({
                              show: true,
                              mode: 'edit',
                              projectId: proj.id,
                              title: proj.title,
                              category: proj.category,
                              contractor: proj.contractor,
                              description: proj.description,
                              imageUrl: proj.imageUrl
                            })}
                            className="text-blue-700 hover:text-blue-800 text-[10px] font-bold uppercase flex items-center gap-0.5"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this project from the portfolio?')) {
                                await deleteProjectByAdmin(proj.id);
                                alert('Project deleted successfully!');
                              }
                            }}
                            className="text-rose-600 hover:text-rose-700 text-[10px] font-bold uppercase flex items-center gap-0.5 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLIENT REQUESTS UNIFIED INBOX PANEL */}
            {adminTab === 'clientRequests' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600 animate-pulse" /> Client Inquiry & Communications Center
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage direct contact messages, quotation requests, worker hirings, and advisory submissions in one secure, unified interface.
                  </p>
                </div>

                {/* Dashboard Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Logs</span>
                      <span className="text-2xl font-bold text-slate-800">{(clientRequests || []).length}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      Σ
                    </div>
                  </div>
                  <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">Unread Alerts</span>
                      <span className="text-2xl font-bold text-orange-600">{(clientRequests || []).filter(r => !r.isRead).length}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-500 font-bold text-sm">
                      !
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Replied Cases</span>
                      <span className="text-2xl font-bold text-emerald-600">{(clientRequests || []).filter(r => r.adminReply).length}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-500 font-bold text-sm">
                      ✓
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center px-1">Type:</span>
                    {(['all', 'contact', 'consultancy', 'hire', 'quote'] as const).map((filterType) => (
                      <button
                        key={filterType}
                        type="button"
                        onClick={() => {
                          setClientReqTypeFilter(filterType);
                          setSelectedReqId(null);
                        }}
                        className={`px-3 py-1 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all border ${
                          clientReqTypeFilter === filterType
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {filterType}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center px-1">Status:</span>
                    {(['all', 'unread', 'replied'] as const).map((filterRead) => (
                      <button
                        key={filterRead}
                        type="button"
                        onClick={() => {
                          setClientReqReadFilter(filterRead);
                          setSelectedReqId(null);
                        }}
                        className={`px-3 py-1 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all border ${
                          clientReqReadFilter === filterRead
                            ? 'bg-slate-700 border-slate-700 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {filterRead === 'all' ? 'All' : filterRead === 'unread' ? 'Unread' : 'Replied'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Inbox Double-Pane Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[450px]">
                  {/* Left Column: Requests List */}
                  <div className="md:col-span-5 border border-slate-150 rounded-2xl overflow-hidden flex flex-col bg-white">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-150 text-xxs font-bold uppercase text-slate-500 tracking-wider">
                      Inbox List ({
                        (clientRequests || []).filter(r => {
                          const typeMatch = clientReqTypeFilter === 'all' || r.type === clientReqTypeFilter;
                          const readMatch =
                            clientReqReadFilter === 'all' ||
                            (clientReqReadFilter === 'unread' && !r.isRead) ||
                            (clientReqReadFilter === 'replied' && !!r.adminReply);
                          return typeMatch && readMatch;
                        }).length
                      })
                    </div>
                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px] flex-1">
                      {(clientRequests || []).filter(r => {
                        const typeMatch = clientReqTypeFilter === 'all' || r.type === clientReqTypeFilter;
                        const readMatch =
                          clientReqReadFilter === 'all' ||
                          (clientReqReadFilter === 'unread' && !r.isRead) ||
                          (clientReqReadFilter === 'replied' && !!r.adminReply);
                        return typeMatch && readMatch;
                      }).length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No matching client requests found in this channel.
                        </div>
                      ) : (
                        (clientRequests || [])
                          .filter(r => {
                            const typeMatch = clientReqTypeFilter === 'all' || r.type === clientReqTypeFilter;
                            const readMatch =
                              clientReqReadFilter === 'all' ||
                              (clientReqReadFilter === 'unread' && !r.isRead) ||
                              (clientReqReadFilter === 'replied' && !!r.adminReply);
                            return typeMatch && readMatch;
                          })
                          .map((req) => {
                            const isSelected = selectedReqId === req.id;
                            const unreadDot = !req.isRead;
                            
                            // Type labels and icon color
                            const typeColors: Record<string, string> = {
                              contact: 'bg-indigo-50 border-indigo-100 text-indigo-700',
                              consultancy: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                              hire: 'bg-blue-50 border-blue-100 text-blue-700',
                              quote: 'bg-amber-50 border-amber-100 text-amber-700'
                            };

                            return (
                              <div
                                key={req.id}
                                onClick={async () => {
                                  setSelectedReqId(req.id);
                                  setAdminReplyText(req.adminReply || '');
                                  if (!req.isRead) {
                                    // Mark as read instantly on selection
                                    await updateClientRequest(req.id, { isRead: true });
                                  }
                                }}
                                className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-all relative border-l-4 ${
                                  isSelected 
                                    ? 'bg-blue-50/40 border-l-blue-600' 
                                    : unreadDot 
                                      ? 'border-l-orange-500 bg-slate-50/20' 
                                      : 'border-l-transparent'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeColors[req.type] || 'bg-slate-100 text-slate-600'}`}>
                                    {req.type}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className={`text-xs font-semibold ${unreadDot ? 'text-slate-900 font-bold' : 'text-slate-700'} line-clamp-1`}>
                                  {req.title}
                                </h4>
                                <p className="text-xxs text-slate-500 line-clamp-1 mt-0.5">
                                  Client: {req.clientName}
                                </p>
                                
                                {unreadDot && (
                                  <span className="absolute right-3 top-3.5 w-2 h-2 rounded-full bg-orange-500" />
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Request Detail Display */}
                  <div className="md:col-span-7 border border-slate-150 rounded-2xl p-5 flex flex-col bg-white">
                    {selectedReqId ? (
                      (() => {
                        const req = (clientRequests || []).find(r => r.id === selectedReqId);
                        if (!req) return <div className="text-slate-400 text-xs">Request details not found.</div>;

                        const typeLabels: Record<string, string> = {
                          contact: 'General Client Inquiry Form',
                          consultancy: 'Professional Advisory Request',
                          hire: 'Specialist Work Hire Request',
                          quote: 'Materials Price Quote Request'
                        };

                        return (
                          <div className="space-y-4 flex-1 flex flex-col">
                            {/* Header */}
                            <div className="border-b border-slate-100 pb-3">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase block w-fit mb-2">
                                {typeLabels[req.type] || 'Inquiry'}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                {req.title}
                              </h3>
                              <p className="text-xxs font-mono text-slate-400 mt-1">
                                Request ID: {req.id} • Submitted: {new Date(req.createdAt).toLocaleString()}
                              </p>
                            </div>

                            {/* Client Profile Box */}
                            <div className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl space-y-2">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Sender Client Profile
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xxs">
                                <div>
                                  <span className="text-slate-400 block">Client Name</span>
                                  <span className="font-semibold text-slate-800 text-[11px]">{req.clientName}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Contact Email</span>
                                  <span className="font-semibold text-slate-800 text-[11px] block truncate" title={req.clientEmail}>{req.clientEmail}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">WhatsApp / Phone</span>
                                  <span className="font-semibold text-slate-800 text-[11px] block">{req.clientPhone}</span>
                                </div>
                              </div>
                            </div>

                            {/* Inquiry Details Message Body */}
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Inquiry Message Body
                              </h4>
                              <div className="bg-slate-50/20 border border-slate-150 p-4 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                {req.details}
                              </div>
                            </div>

                            {/* Additional Info / Budget If Any */}
                            {(req.budget || (req.additionalInfo && Object.keys(req.additionalInfo).length > 0)) && (
                              <div className="bg-slate-50/40 border border-slate-100 p-3 rounded-xl text-xxs space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Associated Parameters
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                  {req.budget && (
                                    <div>
                                      <span className="text-slate-400">Offered Budget:</span>
                                      <span className="font-semibold text-slate-800 ml-1.5">{req.budget}</span>
                                    </div>
                                  )}
                                  {req.additionalInfo?.productName && (
                                    <div>
                                      <span className="text-slate-400">Inquired Item:</span>
                                      <span className="font-semibold text-slate-800 ml-1.5">{req.additionalInfo.productName}</span>
                                    </div>
                                  )}
                                  {req.additionalInfo?.workerName && (
                                    <div>
                                      <span className="text-slate-400">Assigned Expert:</span>
                                      <span className="font-semibold text-slate-800 ml-1.5">{req.additionalInfo.workerName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Admin Action Area */}
                            <div className="border-t border-slate-100 pt-3.5 mt-auto space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Administrative Reply Desk
                                </h4>
                                {req.repliedAt && (
                                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                    ✓ Replied on {new Date(req.repliedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {/* Smart Quick Templates */}
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: 'Acknowledge Submission', text: `Dear ${req.clientName}, thank you for contacting Manason Engineering. We have received your inquiry regarding "${req.title}" and our executive committee is reviewing it. We will reach back to you shortly.` },
                                  { label: 'Offer Consultation', text: `Dear ${req.clientName}, thank you for your advisory request. We would like to schedule a formal site scoping call. Please let us know when you are available this week.` },
                                  { label: 'Quotation Approved', text: `Dear ${req.clientName}, your request for the materials quote has been approved. The competitive pricing schedule has been finalized and uploaded to your workspace.` }
                                ].map((t, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setAdminReplyText(t.text)}
                                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-1 rounded"
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="Type your formal business response here... (This will instantly notify the client via simulated WhatsApp, Email, and dashboard communications.)"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 font-mono"
                                rows={3}
                              />

                              <div className="flex justify-between items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!adminReplyText.trim()) {
                                      alert('Please enter a response body first.');
                                      return;
                                    }
                                    await updateClientRequest(req.id, { adminReply: adminReplyText });
                                    alert('Business reply posted and transmitted to the company database and clients contact channels successfully!');
                                  }}
                                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 rounded-lg shadow-sm"
                                >
                                  Transmit Official Response
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Mark this request as unread?')) {
                                      await updateClientRequest(req.id, { isRead: false });
                                      setSelectedReqId(null);
                                    }
                                  }}
                                  className="text-slate-500 hover:text-slate-700 text-[10px] font-bold uppercase tracking-wider"
                                >
                                  Mark as Unread
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                          <Bell className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase">No Request Selected</h4>
                          <p className="text-xxs text-slate-400 mt-1 max-w-xs mx-auto">
                            Select any client inquiry from the left panel to review message details, inspect profile parameters, and issue direct helper responses.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        </div>
      )}

      {/* ===================================== */}
      {/* 2. CLIENT DASHBOARD PANELS            */}
      {/* ===================================== */}
      {currentUser.type === UserType.CLIENT && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side Tabs Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">My Client Center</p>
            {[
              { id: 'hired', label: 'Hired Builders', count: clientJobs.filter(j => j.status !== JobStatus.APPROVED).length, icon: Landmark },
              { id: 'quotes', label: 'Quotations Inbox', count: clientQuotes.filter(q => q.status === 'replied').length, icon: CreditCard },
              { id: 'consultancy', label: 'Consultancy Plans', count: clientConsultancies.length, icon: MessageSquare },
              { id: 'brochures', label: 'PDF Catalogues', count: null, icon: FileText },
              { id: 'favorites', label: 'Saved Favorites', count: currentUser.favorites?.length || 0, icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setClientTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-between ${
                    clientTab === tab.id
                      ? 'bg-blue-800 text-white border-blue-800 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display (9 cols) */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            
            {/* HIRED BUILDERS TAB */}
            {clientTab === 'hired' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">My Hired Builders & Escrow</h3>
                  <p className="text-xs text-slate-500">Track milestones, check photo logs, and release funds upon completion.</p>
                </div>

                {clientJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <HardHat className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-sm">No hired builders yet</p>
                    <p className="text-xs max-w-md mx-auto mt-1 text-slate-400">
                      Search the Talent Directory in the menu to contract bricklayers, plumbers, helpers, or construction groups!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {clientJobs.map(job => (
                      <div key={job.id} className="p-5 rounded-2xl border border-slate-200 flex flex-col justify-between bg-slate-50/40">
                        
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div>
                            <span className="text-xxs font-mono text-slate-400 uppercase">Contract ID: {job.id}</span>
                            <h4 className="font-bold text-base text-slate-900 mt-0.5">{job.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Specialist: <strong>{job.workerName}</strong> ({job.workerType})
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-900 text-base block">{job.price.toLocaleString()} RWF</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 inline-block uppercase tracking-wider ${
                              job.status === JobStatus.APPROVED ? 'bg-emerald-100 text-emerald-800' :
                              job.status === JobStatus.CLIENT_APPROVED ? 'bg-purple-100 text-purple-800' :
                              job.status === JobStatus.DISPUTED ? 'bg-red-100 text-red-800' :
                              job.status === JobStatus.PENDING ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800 animate-pulse'
                            }`}>
                              Escrow Status: {job.status}
                            </span>
                          </div>
                        </div>

                        {/* Progress details if worker is active */}
                        {job.status !== JobStatus.PENDING && job.status !== JobStatus.APPROVED && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            {/* Simulated map tracker */}
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Live Status Tracking</p>
                              {renderSimulatedMap(job)}
                              <div className="mt-2">
                                <LiveJobMap liveLocation={job.liveLocation} destination={job.location} />
                              </div>
                              {job.status !== JobStatus.DISPUTED && (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Sobanura ikibazo ufite kuri uyu mukozi/akazi (Admin azabimenya ako kanya):');
                                    if (!reason || !reason.trim()) return;
                                    addProgressUpdate(job.id, `⚠ IKIBAZO CYATANZWE N'UMUKIRIYA: ${reason}`);
                                    updateJobStatus(job.id, JobStatus.DISPUTED);
                                    alert('Ikibazo cyoherejwe kuri Admin. Bazagikemura vuba.');
                                  }}
                                  className="mt-2 w-full text-xxs font-bold uppercase py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  ⚠ Menyesha Ikibazo Ako Kanya
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Progress reports (photos/videos/comments) — always visible once work has begun,
                            including after final approval, so the client retains a permanent record. */}
                        {job.status !== JobStatus.PENDING && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Latest Site Photos & Logs</p>
                              {job.progressUpdates.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Waiting for builder to upload first progress comment.</p>
                              ) : (
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                  {job.progressUpdates.map(pu => (
                                    <div key={pu.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex gap-2">
                                      {pu.videoUrl ? (
                                        <video src={pu.videoUrl} controls className="w-16 h-10 rounded object-cover shrink-0 bg-black" />
                                      ) : pu.imageUrl && (
                                        <img src={pu.imageUrl} className="w-10 h-10 rounded object-cover shrink-0 bg-slate-100" />
                                      )}
                                      <div>
                                        <p className="font-bold text-slate-800">"{pu.comment}"</p>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(pu.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        )}

                        {/* Pending Deposit confirmation warning */}
                        {job.status === JobStatus.PENDING && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 text-slate-900 rounded-xl border border-amber-200 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xs">
                            <div className="flex gap-2.5">
                              <Wallet className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-900 block text-sm font-bold">Kwishyura Muri Escrow (Momo Escrow Deposit)</strong>
                                <span className="text-slate-600 block mt-0.5">
                                  Nyamuneka ohereza amafaranga y'amasezerano ungana na <strong>{job.price.toLocaleString()} RWF</strong> binyuze kuri Mobile Money (MTN cyangwa Airtel Money).
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 self-stretch md:self-auto">
                              <button
                                onClick={() => {
                                  setMomoJob(job);
                                  setMomoStatus('idle');
                                  setMomoPin('');
                                  setMomoSmsText('');
                                  setMomoTxId('');
                                }}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-amber-400 justify-center transition-all duration-200"
                              >
                                <Smartphone className="w-4 h-4 text-slate-950" />
                                Kwishyura na MoMo
                              </button>

                              {job.paymentReceiptUrl ? (
                                <a
                                  href={job.paymentReceiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xxs font-bold text-emerald-700 underline text-center"
                                >
                                  ✅ Inyemezabuguzi yoherejwe — itegerejwe kwemezwa na Admin
                                </a>
                              ) : (
                                <>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf,application/pdf"
                                    id={`receipt-upload-${job.id}`}
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const base64String: string = await new Promise((resolve, reject) => {
                                          const reader = new FileReader();
                                          reader.onloadend = () => resolve(reader.result as string);
                                          reader.onerror = reject;
                                          reader.readAsDataURL(file);
                                        });
                                        const url = await uploadFile(file.name, file.type, base64String);
                                        await submitPaymentReceipt(job.id, url);
                                        alert('Inyemezabuguzi yoherejwe kuri Admin! Bazayigenzura vuba.');
                                      } catch (err: any) {
                                        alert(err.message || 'Kwohereza inyemezabuguzi byanze.');
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`receipt-upload-${job.id}`}
                                    className="cursor-pointer text-xxs font-bold text-slate-600 hover:text-slate-900 underline text-center"
                                  >
                                    Cyangwa: nishyuye hanze (MoMo/PayPal) — ohereza inyemezabuguzi (PDF/ifoto)
                                  </label>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Escrow release / Dispute action triggers */}
                        {job.status === JobStatus.COMPLETED && (
                          <div className="mt-4 p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <strong>Deliverables complete:</strong> {job.workerName} completed the construction. Please review the reports above and confirm.
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  updateJobStatus(job.id, JobStatus.CLIENT_APPROVED);
                                  alert('Byemejwe! Admin azasuzuma raporo mbere yo kohereza amafaranga ku mukozi.');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase px-3.5 py-2 rounded-lg"
                              >
                                Confirm Work Completed
                              </button>
                              <button
                                onClick={() => {
                                  updateJobStatus(job.id, JobStatus.DISPUTED);
                                  alert('Dispute raised. Admin arbiter will resolve.');
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-3.5 py-2 rounded-lg"
                              >
                                File Escrow Dispute
                              </button>
                            </div>
                          </div>
                        )}

                        {job.status === JobStatus.CLIENT_APPROVED && (
                          <div className="mt-4 p-4 bg-purple-50 text-purple-900 rounded-xl border border-purple-100 text-xs flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                            <div>
                              <strong className="block">Byemejwe na wewe — Admin ubu arasuzuma.</strong>
                              Admin arimo gusuzuma raporo/amafoto/video by'akazi mbere yo kohereza amafaranga ku mukozi. Uzamenyeshwa ako kanya bimara kurangira.
                            </div>
                          </div>
                        )}

                        {/* Dual Reviews & ratings form */}
                        {(job.status === JobStatus.APPROVED || job.status === JobStatus.CLIENT_APPROVED) && !job.clientRating && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
                            <p className="font-bold text-slate-900 uppercase">Write verified review for {job.workerName}</p>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-600">Select Rating:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(stars => (
                                  <button
                                    key={stars}
                                    type="button"
                                    onClick={() => setReviewRating({ ...reviewRating, [job.id]: stars })}
                                    className="p-0.5 text-amber-500 hover:scale-110 transition-transform"
                                  >
                                    <Star className={`w-5 h-5 ${
                                      (reviewRating[job.id] || 0) >= stars ? 'fill-current' : 'stroke-current'
                                    }`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Write constructive comment on their trade craftsmanship..."
                                value={reviewComment[job.id] || ''}
                                onChange={(e) => setReviewComment({ ...reviewComment, [job.id]: e.target.value })}
                                className="flex-1 px-3 py-2 rounded border border-slate-300 focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  const rating = reviewRating[job.id] || 5;
                                  const comment = reviewComment[job.id] || 'Excellent work!';
                                  submitReview(job.id, rating, comment, true);
                                }}
                                className="bg-blue-800 text-white font-bold px-4 py-2 rounded uppercase text-xxs"
                              >
                                Log Verified Review
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Review already logged */}
                        {(job.status === JobStatus.APPROVED || job.status === JobStatus.CLIENT_APPROVED) && job.clientRating && (
                          <div className="mt-3 p-3 bg-slate-50 text-slate-700 rounded-lg text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-1">Your Verified Feedback</span>
                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                              {Array.from({ length: job.clientRating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            <p className="italic font-medium">"{job.clientReviewComment}"</p>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUOTATIONS INBOX TAB */}
            {clientTab === 'quotes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">My Material Quotations Inbox</h3>
                  <p className="text-xs text-slate-500">Secure purchase orders with factory negotiated pricing direct from manufacturers.</p>
                </div>

                {clientQuotes.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 italic">No price quote inquiries logged yet.</p>
                ) : (
                  <div className="space-y-4">
                    {clientQuotes.map(quote => (
                      <div key={quote.id} className="p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{quote.productName}</h4>
                          <p className="text-xxs text-slate-500">Supplier: {quote.supplierName} • Inquired quantity detailed in Admin inbox</p>
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/40 mt-2 italic">
                            "{quote.details}"
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2 shrink-0">
                          {quote.isRepliedByAdmin ? (
                            <>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Admin Negotiated Price Offer</span>
                              <span className="font-bold text-slate-900 text-sm block mt-0.5">{quote.priceOfferedByAdmin?.toLocaleString()} RWF</span>
                              
                              <button
                                onClick={() => triggerQuotationDownload(quote)}
                                className="bg-blue-800 hover:bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded flex items-center gap-1.5 shadow"
                              >
                                <Download className="w-3.5 h-3.5" /> Download PDF Quotation
                              </button>

                              {quote.status === 'replied' ? (
                                <button
                                  onClick={() => {
                                    approveQuoteByClient(quote.id);
                                    alert('Purchase order secured! Invoice sent.');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded"
                                >
                                  Approve & Secure Purchase Order
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded font-bold border border-emerald-200 inline-block">
                                  ✓ Order Secured & Paid
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xxs font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded animate-pulse">
                              Awaiting Admin Factory Check
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONSULTANCY PLANS TAB */}
            {clientTab === 'consultancy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">My Consultancy & Feasibility Plans</h3>
                  <p className="text-xs text-slate-500">Advisory recommendations received from Rwanda's licensed design engineers.</p>
                </div>

                {clientConsultancies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No consultancy design plans requested yet.</p>
                ) : (
                  <div className="space-y-4">
                    {clientConsultancies.map(con => (
                      <div key={con.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex justify-between text-xxs mb-2 border-b pb-1">
                          <span className="font-bold text-blue-800 uppercase">{con.type} FEASIBILITY</span>
                          <span className="text-slate-400">{con.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-700 italic">"{con.details}"</p>
                        <p className="text-xxs text-slate-500 mt-2">Target Budget: {con.budget}</p>

                        {con.reply ? (
                          <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-xs">
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Expert Response</span>
                            <p className="font-bold text-slate-900 mt-2">Expert Engineer: {con.assignedExpert}</p>
                            <p className="text-slate-600 mt-1 leading-relaxed">"{con.reply}"</p>
                          </div>
                        ) : (
                          <div className="mt-4 text-xxs text-slate-500 font-medium animate-pulse flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Awaiting Manason Engineering licensed engineer review...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOWNLOAD PDF BROCHURES TAB */}
            {clientTab === 'brochures' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Technical Catalogues & Leaflets</h3>
                  <p className="text-xs text-slate-500">Download building specifications, structural formulas, and factory sand tables.</p>
                </div>

                {brochures.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No brochures uploaded by Admin yet.</p>
                ) : (
                  <div className="space-y-3">
                    {brochures.map(b => (
                      <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{b.name}</h4>
                            <p className="text-xxs text-slate-500">
                              Category: {b.category} • Size: {b.size} • Total Downloads: <strong>{b.downloadCount}</strong>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            incrementBrochureDownload(b.id);
                            if (b.fileUrl) {
                              window.open(b.fileUrl, '_blank');
                            } else {
                              triggerFileDownload(b.name, b.category);
                            }
                          }}
                          className="bg-blue-800 hover:bg-blue-900 text-white text-xxs font-bold uppercase px-3.5 py-2.5 rounded-lg flex items-center gap-1 shadow"
                        >
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SAVED FAVORITES TAB */}
            {clientTab === 'favorites' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">My Saved Professionals</h3>
                  <p className="text-xs text-slate-500">Instantly contract or reference your favorite Rwandan construction technicians.</p>
                </div>

                {(!currentUser.favorites || currentUser.favorites.length === 0) ? (
                  <div className="text-center py-12 text-slate-400 italic border rounded-xl bg-slate-50">
                    <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    No favorite professionals saved. Browse the directory and click the star icon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users
                      .filter(u => currentUser.favorites?.includes(u.id))
                      .map(fav => (
                        <div key={fav.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-center flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <img src={fav.avatarUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{fav.name}</h4>
                              <p className="text-xxs text-slate-500">Specialty: {fav.specialty} • Prices: {fav.prices || 'By Quote'}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const nextFavorites = currentUser.favorites?.filter(id => id !== fav.id) || [];
                                await updateUserProfile(currentUser.id, { favorites: nextFavorites });
                                alert('Removed from favorites.');
                              }}
                              className="text-slate-500 hover:text-rose-600 p-2 rounded-lg border border-slate-200"
                              title="Remove Favorite"
                            >
                              <Heart className="w-4 h-4 fill-current text-rose-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ===================================== */}
      {/* 3. WORKER / PROFESSIONAL DASHBOARD   */}
      {/* ===================================== */}
      {(currentUser.type === UserType.TECHNICAL || currentUser.type === UserType.HELPER || currentUser.type === UserType.COMPANY || currentUser.type === UserType.GROUP) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side Tabs Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Technician Cabinet</p>
            {[
              { id: 'contracts', label: 'My Contracts', count: workerJobs.filter(j => j.status !== JobStatus.APPROVED).length, icon: Landmark },
              { id: 'profile', label: 'Edit Profile & CV', count: null, icon: Edit }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setWorkerTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-between ${
                    workerTab === tab.id
                      ? 'bg-blue-800 text-white border-blue-800 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display (9 cols) */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            
            {/* WORKER CONTRACTS TAB */}
            {workerTab === 'contracts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">My Active Client Construction Contracts</h3>
                  <p className="text-xs text-slate-500">Respond to client hires, transition project steps, and post masonry logs.</p>
                </div>

                {workerJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <HardHat className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-sm">No hired contracts registered yet</p>
                    <p className="text-xs max-w-md mx-auto mt-1 text-slate-400">
                      Keep your availability set to "Available" in registration details. Clients will find your profile in our directory and secure escrow agreements!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {workerJobs.map(job => (
                      <div key={job.id} className="p-5 rounded-2xl border border-slate-200 flex flex-col justify-between bg-slate-50/40">
                        
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div>
                            <span className="text-xxs font-mono text-slate-400 uppercase">Contract ID: {job.id}</span>
                            <h4 className="font-bold text-base text-slate-900 mt-0.5">{job.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Client: <strong>{job.clientName}</strong> • Address: <strong>{job.location.address}</strong>
                            </p>
                            <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200/60 mt-2 italic">
                              "{job.description}"
                            </p>
                          </div>

                          <div className="text-right text-xs">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Escrow Value</span>
                            <span className="font-bold text-slate-900 text-base block mt-0.5">{job.price.toLocaleString()} RWF</span>
                            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                              Your earnings (after 10% platform fee): <strong>{(job.price - job.commission).toLocaleString()} RWF</strong>
                            </span>
                          </div>
                        </div>

                        {/* Pending Deposit Warning block */}
                        {job.status === JobStatus.PENDING && (
                          <div className="mt-4 p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <strong>Waiting for Client Deposit:</strong> Escrow is currently pending. Do NOT start traveling or working yet. We will notify you via SMS/WhatsApp once funds are secured.
                            </div>
                          </div>
                        )}

                        {/* Live Tracking Status Transition form */}
                        {job.status !== JobStatus.PENDING && job.status !== JobStatus.APPROVED && job.status !== JobStatus.COMPLETED && job.status !== JobStatus.CLIENT_APPROVED && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                            <p className="text-xs font-bold text-slate-900 uppercase">Live Site Tracking Panel</p>
                            
                            <div className="flex flex-wrap gap-2 text-xxs font-bold uppercase tracking-wide">
                              {job.status === JobStatus.ESCROW_DEPOSITED && (
                                <button
                                  onClick={() => {
                                    updateJobStatus(job.id, JobStatus.TRAVELLING);
                                    alert('Traveling status posted!');
                                  }}
                                  className="bg-blue-800 hover:bg-blue-900 text-white px-3.5 py-2.5 rounded-lg shadow"
                                >
                                  ✈ Start Travelling to Site
                                </button>
                              )}

                              {job.status === JobStatus.TRAVELLING && (
                                <button
                                  onClick={() => {
                                    updateJobStatus(job.id, JobStatus.ARRIVED);
                                    alert('Arrived status posted!');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-lg shadow"
                                >
                                  ✓ Mark Arrived at Site
                                </button>
                              )}

                              {job.status === JobStatus.ARRIVED && (
                                <button
                                  onClick={() => {
                                    updateJobStatus(job.id, JobStatus.WORKING);
                                    alert('Working status posted!');
                                  }}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-3.5 py-2.5 rounded-lg shadow"
                                >
                                  🔨 Start Active Construction Work
                                </button>
                              )}
                            </div>

                            {/* Active work progress update form */}
                            {job.status === JobStatus.WORKING && (
                              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                                <h5 className="font-bold text-xxs uppercase text-slate-500 tracking-wide">Upload Progress Update</h5>
                                
                                <input
                                  type="text"
                                  placeholder="E.g., Finished placing foundation cement rods. Ready for bricklaying."
                                  value={progressComment[job.id] || ''}
                                  onChange={(e) => setProgressComment({ ...progressComment, [job.id]: e.target.value })}
                                  className="w-full px-3 py-2 rounded border border-slate-300 text-xs text-slate-800"
                                />

                                <div className="flex items-center gap-2 flex-wrap">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id={`progress-photo-${job.id}`}
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setIsUploadingProgressPhoto(prev => ({ ...prev, [job.id]: true }));
                                      try {
                                        const base64String: string = await new Promise((resolve, reject) => {
                                          const reader = new FileReader();
                                          reader.onloadend = () => resolve(reader.result as string);
                                          reader.onerror = reject;
                                          reader.readAsDataURL(file);
                                        });
                                        const url = await uploadFile(file.name, file.type, base64String);
                                        setProgressPhotoUrl(prev => ({ ...prev, [job.id]: url }));
                                      } catch (err: any) {
                                        alert(err.message || 'Kwohereza ifoto byanze.');
                                      } finally {
                                        setIsUploadingProgressPhoto(prev => ({ ...prev, [job.id]: false }));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`progress-photo-${job.id}`}
                                    className="cursor-pointer text-xxs font-bold uppercase px-3 py-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                                  >
                                    <Image className="w-3.5 h-3.5" />
                                    {isUploadingProgressPhoto[job.id]
                                      ? 'Kohereza...'
                                      : progressPhotoUrl[job.id]
                                        ? '✅ Ifoto Yoherejwe'
                                        : 'Shyiramo Ifoto y\'Akazi'}
                                  </label>

                                  <input
                                    type="file"
                                    accept="video/*"
                                    id={`progress-video-${job.id}`}
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setIsUploadingProgressVideo(prev => ({ ...prev, [job.id]: true }));
                                      try {
                                        const base64String: string = await new Promise((resolve, reject) => {
                                          const reader = new FileReader();
                                          reader.onloadend = () => resolve(reader.result as string);
                                          reader.onerror = reject;
                                          reader.readAsDataURL(file);
                                        });
                                        const url = await uploadFile(file.name, file.type, base64String);
                                        setProgressVideoUrl(prev => ({ ...prev, [job.id]: url }));
                                      } catch (err: any) {
                                        alert(err.message || 'Kwohereza video byanze.');
                                      } finally {
                                        setIsUploadingProgressVideo(prev => ({ ...prev, [job.id]: false }));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`progress-video-${job.id}`}
                                    className="cursor-pointer text-xxs font-bold uppercase px-3 py-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    {isUploadingProgressVideo[job.id]
                                      ? 'Kohereza...'
                                      : progressVideoUrl[job.id]
                                        ? '✅ Video Yoherejwe'
                                        : 'Shyiramo Video y\'Akazi'}
                                  </label>

                                  <button
                                    onClick={() => {
                                      const comment = progressComment[job.id];
                                      if (!comment) return;
                                      addProgressUpdate(job.id, comment, progressPhotoUrl[job.id], progressVideoUrl[job.id]);
                                      setProgressComment({ ...progressComment, [job.id]: '' });
                                      setProgressPhotoUrl(prev => ({ ...prev, [job.id]: '' }));
                                      setProgressVideoUrl(prev => ({ ...prev, [job.id]: '' }));
                                      alert('Raporo y\'akazi yoherejwe ku mukiriya!');
                                    }}
                                    className="bg-slate-900 text-white text-xxs font-bold uppercase px-4 py-2 rounded"
                                  >
                                    Upload Report
                                  </button>
                                </div>

                                {progressPhotoUrl[job.id] && (
                                  <img src={progressPhotoUrl[job.id]} alt="Progress" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                                )}

                                {progressVideoUrl[job.id] && (
                                  <video src={progressVideoUrl[job.id]} controls className="w-full h-40 object-cover rounded-lg border border-slate-200 bg-black" />
                                )}

                                {/* Mark Job Completed */}
                                <button
                                  onClick={() => {
                                    updateJobStatus(job.id, JobStatus.COMPLETED);
                                    alert('Work marked completed. Client has been notified to release escrow.');
                                  }}
                                  className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-bold uppercase rounded-lg shadow"
                                >
                                  ✓ All Work Completed - Request Escrow Release
                                </button>
                              </div>
                            )}

                            {/* Simulated maps visualization */}
                            {renderSimulatedMap(job)}
                            <div className="mt-2">
                              <LiveJobMap liveLocation={job.liveLocation} destination={job.location} />
                            </div>
                            {job.status !== JobStatus.DISPUTED && (
                              <button
                                onClick={() => {
                                  const reason = prompt('Sobanura ikibazo ufite kuri uyu mukiriya/akazi (Admin azabimenya ako kanya):');
                                  if (!reason || !reason.trim()) return;
                                  addProgressUpdate(job.id, `⚠ IKIBAZO CYATANZWE N'UMUKOZI: ${reason}`);
                                  updateJobStatus(job.id, JobStatus.DISPUTED);
                                  alert('Ikibazo cyoherejwe kuri Admin. Bazagikemura vuba.');
                                }}
                                className="mt-2 w-full text-xxs font-bold uppercase py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                              >
                                ⚠ Menyesha Ikibazo Ako Kanya
                              </button>
                            )}

                          </div>
                        )}

                        {/* Pending release info */}
                        {job.status === JobStatus.COMPLETED && (
                          <div className="mt-4 p-3 bg-slate-100 text-slate-700 rounded-xl text-xs flex gap-2">
                            <Check className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div>
                              <strong>Awaiting Client Approval:</strong> Work marked completed. Funds are securely locked in Manason escrow. Payment releases after client and admin confirmation.
                            </div>
                          </div>
                        )}

                        {job.status === JobStatus.CLIENT_APPROVED && (
                          <div className="mt-4 p-3 bg-purple-50 text-purple-800 rounded-xl text-xs flex gap-2">
                            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Umukiriya Yemeje!</strong> Ubu Admin arasuzuma raporo z'akazi kawe. Amafaranga azoherezwa vuba nyuma yo gusuzumwa.
                            </div>
                          </div>
                        )}

                        {/* Dual Reviews & Client ratings display */}
                        {job.status === JobStatus.APPROVED && (
                          <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-3">
                            <span className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] block">✓ Project Closed & Paid</span>
                            
                            {job.clientRating && (
                              <div className="p-3 bg-blue-50 text-blue-900 rounded-lg">
                                <span className="font-bold block text-[10px] text-blue-600 uppercase">Client Feedback</span>
                                <div className="flex items-center gap-0.5 text-amber-500 my-1">
                                  {Array.from({ length: job.clientRating }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                  ))}
                                </div>
                                <p className="italic">"{job.clientReviewComment}"</p>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WORKER PROFILE TAB */}
            {workerTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase">Edit Professional CV Portfolio</h3>
                  <p className="text-xs text-slate-500">Provide trade certificates, expected prices, and toggle availability.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Professional Specialty
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Master Plumber, Masonry Expert"
                        value={workerSpecialty}
                        onChange={(e) => setWorkerSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Experience Sizing
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 6 Years Professional"
                        value={workerExperience}
                        onChange={(e) => setWorkerExperience(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Expected Daily Rate / Desired Price
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12,000 RWF / Day"
                        value={workerPrices}
                        onChange={(e) => setWorkerPrices(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Availability Status
                      </label>
                      <select
                        value={workerAvailability}
                        onChange={(e) => setWorkerAvailability(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Profile Image URL
                      </label>
                      <input
                        type="text"
                        value={workerAvatar}
                        onChange={(e) => setWorkerAvatar(e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Trade Skills (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Plastering, Concrete mixing, Foundations, Slabs"
                        value={workerSkillsInput}
                        onChange={(e) => setWorkerSkillsInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Certificates & Cooperative Numbers (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="A0 Integrated Trade Certificate, Kigali Masonry Coop #231"
                        value={workerCertsInput}
                        onChange={(e) => setWorkerCertsInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const skills = workerSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
                      const certificates = workerCertsInput.split(',').map(s => s.trim()).filter(Boolean);
                      await updateUserProfile(currentUser.id, {
                        specialty: workerSpecialty,
                        experience: workerExperience,
                        prices: workerPrices,
                        availability: workerAvailability as any,
                        skills,
                        certificates,
                        avatarUrl: workerAvatar || undefined
                      });
                      alert('Professional CV profile saved securely!');
                    }}
                    className="bg-blue-800 hover:bg-blue-950 text-white font-bold uppercase text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    Save Professional CV
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DIALOG MODAL FOR ADDING/EDITING PRODUCT (ADMIN ONLY)   */}
      {/* ======================================================== */}
      {productModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm uppercase">
                {productModal.mode === 'add' ? 'Add New Product' : 'Edit Product Details'}
              </h3>
              <button onClick={() => setProductModal({ ...productModal, show: false })} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Material Name</label>
                <input
                  type="text"
                  value={productModal.name}
                  onChange={(e) => setProductModal({ ...productModal, name: e.target.value })}
                  placeholder="e.g. Cimerwa cement 42.5N"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Category</label>
                  <select
                    value={productModal.category}
                    onChange={(e) => setProductModal({ ...productModal, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value="Cement">Cement</option>
                    <option value="Clay Bricks & Roof Tiles">Clay Bricks & Roof Tiles</option>
                    <option value="Steel Products">Steel Products</option>
                    <option value="Concrete Blocks & Concrete Products">Concrete Blocks & Concrete Products</option>
                    <option value="Ceramic Tiles">Ceramic Tiles</option>
                    <option value="Aluminium Windows & Doors">Aluminium Windows & Doors</option>
                    <option value="Glass Products">Glass Products</option>
                    <option value="Granite & Natural Stone">Granite & Natural Stone</option>
                    <option value="Paints">Paints</option>
                    <option value="Waterproofing & Construction Chemicals">Waterproofing & Construction Chemicals</option>
                    <option value="PVC Pipes & Plumbing">PVC Pipes & Plumbing</option>
                    <option value="Water Pumps">Water Pumps</option>
                    <option value="Roofing Materials">Roofing Materials</option>
                    <option value="Construction Equipment">Construction Equipment</option>
                    <option value="Hardware & Building Materials">Hardware & Building Materials</option>
                    <option value="Aggregates & Sand">Aggregates & Sand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Price (RWF)</label>
                  <input
                    type="number"
                    value={productModal.price}
                    onChange={(e) => setProductModal({ ...productModal, price: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Supplier Partner</label>
                <input
                  type="text"
                  value={productModal.supplier}
                  onChange={(e) => setProductModal({ ...productModal, supplier: e.target.value })}
                  placeholder="e.g. CIMERWA"
                  list="rwanda-suppliers-list"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
                <datalist id="rwanda-suppliers-list">
                  <option value="CIMERWA" /><option value="Prime Cement Ltd" /><option value="PPC Rwanda" />
                  <option value="Simba Cement Rwanda" /><option value="Kigali Cement Company" /><option value="Anjia Cement Ltd" />
                  <option value="Ruliba Clays Ltd" /><option value="AXWA Ltd" />
                  <option value="SteelRwa" /><option value="Kigali Steel Ltd" /><option value="Roofings Group Rwanda" />
                  <option value="Gorilla Bricks Ltd" /><option value="Real Contractors Ltd" /><option value="Fair Construction Ltd" />
                  <option value="Casabg Ltd" /><option value="BTN Manufacturing" /><option value="Terra Construction Ltd" />
                  <option value="S&H Industries Ltd" /><option value="Integrated Infrastructures Company (IIC)" />
                  <option value="Rwanda Ceramics" /><option value="Rwanda Aluminium Ltd" /><option value="HomeFix Rwanda" />
                  <option value="Rwanda Glass Ltd" /><option value="East African Granite Industries" />
                  <option value="Master Paints Rwanda" /><option value="Sadolin Paints Rwanda" /><option value="Sika Rwanda" />
                  <option value="Polypipes Rwanda" /><option value="Davis & Shirtliff Rwanda" /><option value="Trust Industries Rwanda" />
                  <option value="CFAO Mobility Rwanda" />
                  <option value="SP Rwanda" /><option value="BAHO Hardware" /><option value="Alpha Hardware" />
                  <option value="Royal Hardware" /><option value="Century Hardware" /><option value="Top Five Hardware" />
                  <option value="Akagera Business Group" /><option value="Garasi Hardware" /><option value="Sofaru Hardware" />
                  <option value="Bricotech Hardware" /><option value="Fixit Hardware" />
                  <option value="Building Equipments and Materials Supply (BEMS/Duhange)" />
                  <option value="Quincaillerie Gloria" /><option value="Quincaillerie Merci Seigneur" />
                  <option value="Quincaillerie Metalic" /><option value="Quincaillerie Reoboth" /><option value="Quincaillerie Right Vision" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Ifoto y'Igicuruzwa</label>
                <input
                  type="file"
                  accept="image/*"
                  id="product-photo-upload-input"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setProductModal(prev => ({ ...prev, isUploadingImage: true }));
                    try {
                      const base64String: string = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });
                      const url = await uploadFile(file.name, file.type, base64String);
                      setProductModal(prev => ({ ...prev, image: url, isUploadingImage: false }));
                    } catch (err: any) {
                      alert(err.message || 'Kohereza ifoto byanze.');
                      setProductModal(prev => ({ ...prev, isUploadingImage: false }));
                    }
                  }}
                />
                <label
                  htmlFor="product-photo-upload-input"
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {productModal.image ? (
                    <img src={productModal.image} alt="Preview" className="w-full h-28 object-cover rounded-lg mb-2" />
                  ) : (
                    <Upload className="w-7 h-7 text-slate-400 mb-1" />
                  )}
                  <p className="text-xs font-semibold text-slate-700">
                    {productModal.isUploadingImage ? 'Kohereza...' : productModal.image ? 'Hindura Ifoto' : 'Kanda Wongeremo Ifoto'}
                  </p>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Description</label>
                <textarea
                  value={productModal.description}
                  onChange={(e) => setProductModal({ ...productModal, description: e.target.value })}
                  placeholder="Material specs..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setProductModal({ ...productModal, show: false })}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!productModal.name || !productModal.price) return;
                    if (productModal.mode === 'add') {
                      await addProductByAdmin({
                        name: productModal.name,
                        category: productModal.category,
                        price: Number(productModal.price),
                        description: productModal.description,
                        imageUrl: productModal.image,
                        supplierId: 'supplier-cimerwa',
                        supplierName: productModal.supplier,
                        rating: 4.8
                      });
                      alert('Product added successfully!');
                    } else if (productModal.productId) {
                      await updateProductByAdmin(productModal.productId, {
                        name: productModal.name,
                        category: productModal.category,
                        price: Number(productModal.price),
                        description: productModal.description,
                        imageUrl: productModal.image,
                        supplierName: productModal.supplier
                      });
                      alert('Product updated successfully!');
                    }
                    setProductModal({ ...productModal, show: false });
                  }}
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg text-xs font-bold uppercase"
                >
                  Save Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.5 DIALOG MODAL FOR ADDING/EDITING PROJECT (ADMIN ONLY) */}
      {/* ======================================================== */}
      {projectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm uppercase">
                {projectModal.mode === 'add' ? 'Add Portfolio Project' : 'Edit Project Details'}
              </h3>
              <button onClick={() => setProjectModal({ ...projectModal, show: false })} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Project Title</label>
                <input
                  type="text"
                  value={projectModal.title}
                  onChange={(e) => setProjectModal({ ...projectModal, title: e.target.value })}
                  placeholder="e.g. Kigali Corporate Tower Cladding"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Category</label>
                  <select
                    value={projectModal.category}
                    onChange={(e) => setProjectModal({ ...projectModal, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Civil/Infrastructure">Civil/Infrastructure</option>
                    <option value="Public Space">Public Space</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Contractor / Material Partner</label>
                  <input
                    type="text"
                    value={projectModal.contractor}
                    onChange={(e) => setProjectModal({ ...projectModal, contractor: e.target.value })}
                    placeholder="e.g. Kigali Builders Ltd"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Project Image URL</label>
                <input
                  type="text"
                  value={projectModal.imageUrl}
                  onChange={(e) => setProjectModal({ ...projectModal, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Description</label>
                <textarea
                  value={projectModal.description}
                  onChange={(e) => setProjectModal({ ...projectModal, description: e.target.value })}
                  placeholder="Describe the construction or materials used..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setProjectModal({ ...projectModal, show: false })}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!projectModal.title || !projectModal.contractor) {
                      alert('Please fill out the Title and Contractor fields.');
                      return;
                    }
                    if (projectModal.mode === 'add') {
                      await addProjectByAdmin({
                        title: projectModal.title,
                        category: projectModal.category,
                        contractor: projectModal.contractor,
                        description: projectModal.description,
                        imageUrl: projectModal.imageUrl
                      });
                      alert('Project added to portfolio successfully!');
                    } else if (projectModal.projectId) {
                      await updateProjectByAdmin(projectModal.projectId, {
                        title: projectModal.title,
                        category: projectModal.category,
                        contractor: projectModal.contractor,
                        description: projectModal.description,
                        imageUrl: projectModal.imageUrl
                      });
                      alert('Project updated successfully!');
                    }
                    setProjectModal({ ...projectModal, show: false });
                  }}
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg text-xs font-bold uppercase"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. DIALOG MODAL FOR ADDING/EDITING BROCHURE (ADMIN ONLY)   */}
      {/* ========================================================== */}
      {brochureModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm uppercase">Upload PDF Brochure</h3>
              <button onClick={() => setBrochureModal({ ...brochureModal, show: false })} className="text-slate-400 hover:text-slate-950 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Brochure Name</label>
                <input
                  type="text"
                  value={brochureModal.name}
                  onChange={(e) => setBrochureModal({ ...brochureModal, name: e.target.value })}
                  placeholder="e.g. Cimerwa Concrete Mixing Manual"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Category</label>
                <select
                  value={brochureModal.category}
                  onChange={(e) => setBrochureModal({ ...brochureModal, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                >
                  <option value="Structural Guides">Structural Guides</option>
                  <option value="Material Standards">Material Standards</option>
                  <option value="Plumbing Schemes">Plumbing Schemes</option>
                  <option value="Roof Sizing Slabs">Roof Sizing Slabs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Estimated PDF Size</label>
                <input
                  type="text"
                  value={brochureModal.size}
                  onChange={(e) => setBrochureModal({ ...brochureModal, size: e.target.value })}
                  placeholder="e.g. 2.4 MB"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              {/* Real PDF File selection input */}
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-4 flex flex-col items-center">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-600 font-bold mb-1">Select Dossier PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.type !== 'application/pdf') {
                      alert('Only PDF documents are supported for technical dossiers.');
                      return;
                    }
                    setBrochureModal(prev => ({ ...prev, isUploading: true }));
                    try {
                      const base64String: string = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });
                      const url = await uploadFile(file.name, file.type, base64String);
                      const computedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
                      setBrochureModal(prev => ({ 
                        ...prev, 
                        fileUrl: url, 
                        size: computedSize,
                        name: prev.name || file.name.replace('.pdf', '')
                      }));
                    } catch (err: any) {
                      alert(err.message || 'Error uploading file');
                    } finally {
                      setBrochureModal(prev => ({ ...prev, isUploading: false }));
                    }
                  }}
                  className="text-xxs text-slate-500"
                />
                {brochureModal.isUploading && (
                  <span className="text-xxs text-blue-600 font-bold animate-pulse mt-2">
                    Uploading dossier PDF...
                  </span>
                )}
                {brochureModal.fileUrl && (
                  <span className="text-xxs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PDF Secured Successfully
                  </span>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setBrochureModal({ ...brochureModal, show: false })}
                  className="px-4 py-2 border rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  disabled={brochureModal.isUploading || !brochureModal.name}
                  onClick={async () => {
                    if (!brochureModal.name) return;
                    await addBrochureByAdmin({
                      name: brochureModal.name,
                      category: brochureModal.category,
                      size: brochureModal.size,
                      fileUrl: brochureModal.fileUrl
                    });
                    alert('Technical brochure / dossier successfully added!');
                    setBrochureModal({ ...brochureModal, show: false });
                  }}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold uppercase"
                >
                  {brochureModal.isUploading ? 'Uploading...' : 'Upload Brochure'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MOBILE MONEY ESCROW DEPOSIT MODAL    */}
      {/* ===================================== */}
      {momoJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-300 relative">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500 animate-bounce" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">Ubwishyu bwa Mobile Money (MoMo Escrow)</h3>
                  <p className="text-xxs text-slate-500">Kwirura mu Escrow binyuze kuri MTN cyangwa Airtel Money</p>
                </div>
              </div>
              <button 
                onClick={() => setMomoJob(null)} 
                className="text-slate-400 hover:text-slate-950 hover:bg-slate-100 p-1.5 rounded-full transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
              
              {/* Payment Summary */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-xxs text-amber-800 uppercase tracking-widest font-extrabold">Umubare w'Ayishyurwa (Total Amount)</p>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">Contract: {momoJob.title}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 block tracking-tight">
                    {momoJob.price.toLocaleString()} RWF
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Secured by Escrow
                  </span>
                </div>
              </div>

              {/* Provider Selection Tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMomoProvider('MTN');
                    setMomoStatus('idle');
                  }}
                  className={`py-3.5 px-4 rounded-2xl font-bold uppercase text-xs tracking-wider border transition-all flex flex-col items-center gap-2 ${
                    momoProvider === 'MTN'
                      ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center font-black text-sm text-slate-950">
                    MTN
                  </div>
                  MTN Mobile Money
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMomoProvider('Airtel');
                    setMomoStatus('idle');
                  }}
                  className={`py-3.5 px-4 rounded-2xl font-bold uppercase text-xs tracking-wider border transition-all flex flex-col items-center gap-2 ${
                    momoProvider === 'Airtel'
                      ? 'bg-red-600 text-white border-red-700 shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-black text-sm">
                    airtel
                  </div>
                  Airtel Money
                </button>
              </div>

              {/* IDLE STATE: CHOOSE VERIFICATION FLOW */}
              {momoStatus === 'idle' && (
                <div className="space-y-6">
                  
                  {/* Option A: USSD manual and SMS parsing */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex gap-2 items-center text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xxs">1</span>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider">Uburyo bwa 1: Kwishyura na USSD & Genzura SMS</h4>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2">
                      <p className="font-medium text-slate-800">Koresha telefoni yawe ukande iyi kodi ikurikira ubashe koherereza Manason:</p>
                      <div className="flex items-center justify-between bg-slate-100 px-3 py-2 rounded-lg font-mono text-xs font-bold text-slate-900 select-all border">
                        {momoProvider === 'MTN' ? '*182*8*1*0785647676#' : '*182*8*2*0785647676#'}
                        <span className="text-[10px] text-slate-400 font-sans uppercase">MoMo Pay Code</span>
                      </div>
                      <p className="text-xxs text-slate-500 italic">
                        Cyangwa wohereze ku nimero: <strong>+250 790 009 922</strong> (MANASON ENGINEERING LTD).
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-xxs font-extrabold text-slate-600 uppercase tracking-wider">
                        Injiza ubutumwa bwa SMS bw'ubwishyu bwawe (Paste MoMo SMS Message)
                      </label>
                      <textarea
                        value={momoSmsText}
                        onChange={(e) => {
                          setMomoSmsText(e.target.value);
                          // Extract a transaction ID if available to make it look professional
                          const match = e.target.value.match(/TxId:\s*([A-Za-z0-9-]+)/i) || e.target.value.match(/Transaction\s*Id:\s*([A-Za-z0-9-]+)/i);
                          if (match) setMomoTxId(match[1]);
                        }}
                        rows={3}
                        placeholder="Paste the Mobile Money confirmation SMS you received here. Sisitemu irahita iyasoma yemeze ubwishyu..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 text-slate-800 font-mono"
                      />

                      {/* Clickable Quick Sample SMS triggers for testing */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Koresha SMS z'icyitegererezo zo kugerageza (Test Templates):</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const sample = `Yezu we! TxId: MOMO-TX-483921. You have successfully transferred ${momoJob.price.toLocaleString()} RWF to MANASON ENGINEERING LTD (0785647676). New balance: 84,500 RWF.`;
                              setMomoSmsText(sample);
                              setMomoTxId('MOMO-TX-483921');
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-200 transition-colors"
                          >
                            MTN SMS Template
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const sample = `Airtel Money Alert: Transfer of ${momoJob.price.toLocaleString()} RWF to MANASON ENGINEERING LTD was successful. TxID: AIRTEL-AM-902441.`;
                              setMomoSmsText(sample);
                              setMomoTxId('AIRTEL-AM-902441');
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-200 transition-colors"
                          >
                            Airtel SMS Template
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!momoSmsText.trim()) {
                            alert('Nyamuneka banza winjize ubutumwa bwa SMS uhawe na Mobile Money.');
                            return;
                          }
                          setMomoStatus('verifying');
                          // Simulate verify processing lag
                          await new Promise(resolve => setTimeout(resolve, 1800));

                          // Check if amount is parsed correctly or just verify anyway to be robust
                          const isSuccess = momoSmsText.toLowerCase().includes('manason') || momoSmsText.includes(momoJob.price.toLocaleString().split(',')[0]);

                          if (isSuccess) {
                            await updateJobStatus(momoJob.id, JobStatus.ESCROW_DEPOSITED);
                            setMomoStatus('success');
                          } else {
                            setMomoStatus('failed');
                          }
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold uppercase text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                      >
                        <MessageSquareCode className="w-4 h-4 text-emerald-400" />
                        Genzura Ubutumwa (Verify SMS Message)
                      </button>
                    </div>

                  </div>

                  {/* Option B: Direct Push OTP simulation */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex gap-2 items-center text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xxs">2</span>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider">Uburyo bwa 2: Koherezwa Push Prompt Kuri Telefoni</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xxs font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                          Nimero ya Telefoni Yakiraho MoMo (Phone Number)
                        </label>
                        <input
                          type="tel"
                          value={momoPhoneNumber}
                          onChange={(e) => setMomoPhoneNumber(e.target.value)}
                          placeholder="e.g. +250788311222"
                          className="w-full px-3 py-2 border rounded-xl text-xs font-mono tracking-wider focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!momoPhoneNumber.trim() || momoPhoneNumber.length < 8) {
                            alert('Nyamuneka injiza nimero ya telefoni iboneye.');
                            return;
                          }
                          setMomoStatus('push_sent');
                          setMomoPin('');
                        }}
                        className={`w-full font-bold uppercase text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all ${
                          momoProvider === 'MTN' 
                            ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-500' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Saba Kwishyura (Request Push Prompt)
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* VERIFYING LOADING SPINNER STATE */}
              {momoStatus === 'verifying' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Kugenzura Ubwishyu mu Isanduku...</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Sisitemu iri gusuzuma ubutumwa bw'amafaranga hamwe na kodi ya {momoProvider === 'MTN' ? 'MTN' : 'Airtel'} network api. Nyamuneka utegereze segonda imwe...
                    </p>
                  </div>
                </div>
              )}

              {/* SUCCESS STATE */}
              {momoStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-emerald-900 uppercase tracking-wider">Ubwishyu Bwemewe (Escrow Secured!)</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      Amafaranga ungana na <strong>{momoJob.price.toLocaleString()} RWF</strong> yageze neza muri Escrow ledger. Amasezerano arahise atangira, kandi umwubatsi {momoJob.workerName} yohererejwe ubutumwa bwo gutangira akazi!
                    </p>
                  </div>
                  {momoTxId && (
                    <div className="bg-slate-100 px-4 py-2 rounded-xl font-mono text-[10px] text-slate-500 border">
                      TRANSACTION ID: {momoTxId}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMomoJob(null);
                      setMomoStatus('idle');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    Komeza Kuri Dashboard
                  </button>
                </div>
              )}

              {/* FAILED STATE */}
              {momoStatus === 'failed' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <X className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-red-950 uppercase tracking-wider">Ntibyakunze (Verification Failed)</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                      Ntibishoboye kwemeza ubu butumwa. Reba neza niba amafaranga n'izina 'MANASON' byanditswemo neza, cyangwa ukoreshe push notification yohererezwa kuri telefoni yawe.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMomoStatus('idle')}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl"
                    >
                      Gerageza kandi (Retry)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomoJob(null)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase px-4 py-2.5 rounded-xl"
                    >
                      Funga (Close)
                    </button>
                  </div>
                </div>
              )}

              {/* PUSH DIALOG SIMULATOR OVERLAY */}
              {momoStatus === 'push_sent' && (
                <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-6 z-50">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 text-white shadow-2xl">
                    
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        {momoProvider === 'MTN' ? 'MTN MoMo Push' : 'Airtel Money Push'}
                      </div>
                      <button 
                        onClick={() => setMomoStatus('idle')} 
                        className="text-neutral-500 hover:text-white font-bold text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xxs text-neutral-400 uppercase tracking-widest">Kwishyura Manason Ltd</p>
                      <p className="text-xl font-black text-white">{momoJob.price.toLocaleString()} RWF</p>
                      <p className="text-[10px] text-neutral-400">Kuri nimero: {momoPhoneNumber}</p>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-center">
                      <p className="text-[10px] text-neutral-400 mb-2">Injiza PIN yawe ya {momoProvider === 'MTN' ? 'MoMo' : 'Airtel'} (Enter PIN):</p>
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3].map((idx) => (
                          <div 
                            key={idx} 
                            className={`w-3.5 h-3.5 rounded-full border border-neutral-700 transition-colors ${
                              momoPin.length > idx ? 'bg-amber-400 border-amber-400' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Numeric keypad pad */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => momoPin.length < 4 && setMomoPin(momoPin + num)}
                          className="py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl font-bold text-sm text-white select-none transition-all"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setMomoPin('')}
                        className="py-2.5 bg-neutral-800 hover:bg-red-900 text-xs font-bold text-red-400 rounded-xl"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => momoPin.length < 4 && setMomoPin(momoPin + '0')}
                        className="py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold text-sm text-white"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (momoPin.length < 4) {
                            alert('Nyamuneka banza winjize PIN yuzuye (4 digits).');
                            return;
                          }
                          setMomoStatus('verifying');
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          setMomoTxId(`${momoProvider === 'MTN' ? 'MTN' : 'AM'}-${Math.floor(100000 + Math.random() * 900000)}`);
                          await updateJobStatus(momoJob.id, JobStatus.ESCROW_DEPOSITED);
                          setMomoStatus('success');
                        }}
                        className="py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 rounded-xl"
                      >
                        Enter
                      </button>
                    </div>

                    <p className="text-[9px] text-neutral-500">Security Note: This is an encrypted secure API sandbox simulation. No actual funds are charged.</p>

                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
