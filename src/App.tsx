/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './components/AppContext';
// @ts-ignore
import kigaliHero from './assets/images/kigali_convention_centre_1783306122390.jpg';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { UserType } from './types';
import Logo from './components/Logo';
import AuthModal from './components/AuthModal';
import WorkersDirectory from './components/WorkersDirectory';
import Marketplace from './components/Marketplace';
import ConsultancySection from './components/ConsultancySection';
import JobPostingBoard from './components/JobPostingBoard';
import Dashboard from './components/Dashboard';
import NotificationLogger from './components/NotificationLogger';
import WorkerTrackingPage from './components/WorkerTrackingPage';
import { 
  Building2, HardHat, ShieldCheck, Mail, Phone, MapPin, 
  Menu, X, Landmark, Compass, Award, Users, ShoppingBag, 
  HelpCircle, MessageCircle, FileText, ChevronRight, Globe, Sparkles, Check, RefreshCw,
  Search, Wrench, Settings, Briefcase, Package, Truck, Megaphone
} from 'lucide-react';

function AppContent() {
  const { currentUser, logout, jobs, isLoading, homepage, projects, isAuthOpen, setIsAuthOpen, addClientRequest, settings } = useApp();
  const { language, setLanguage, t } = useLanguage();

  // Standalone GPS tracking page (opened by a worker via the WhatsApp/SMS
  // link sent when escrow is deposited). Renders instead of the normal app
  // shell whenever the URL contains ?trackJob=<jobId>, and needs no login.
  const trackJobId = new URLSearchParams(window.location.search).get('trackJob');
  if (trackJobId) {
    return <WorkerTrackingPage jobId={trackJobId} />;
  }
  
  const [activeView, setActiveView] = useState<'home' | 'workers' | 'products' | 'consultancy' | 'jobBoard' | 'projects' | 'about' | 'contact' | 'dashboard'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isContactSuccess, setIsContactSuccess] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);
  const [heroSearchTab, setHeroSearchTab] = useState<'workers' | 'services' | 'products'>('workers');
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const handleHeroSearch = () => {
    setActiveView(heroSearchTab === 'services' ? 'consultancy' : heroSearchTab);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    await addClientRequest({
      type: 'contact',
      clientName: currentUser ? currentUser.name : 'Guest Visitor',
      clientEmail: currentUser ? currentUser.email : 'guest@manason.engineering',
      clientPhone: currentUser ? currentUser.phone : '+250 788 000 000',
      title: contactSubject || 'Direct Inquiry',
      details: contactMessage,
      budget: '',
      additionalInfo: {
        isRegisteredUser: !!currentUser,
        userId: currentUser?.id || 'guest'
      }
    });

    setIsContactSuccess(true);
    setTimeout(() => {
      setIsContactSuccess(false);
      setContactSubject('');
      setContactMessage('');
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        {/* Dynamic blueprint grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        <div className="relative z-10 space-y-6 max-w-sm">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold tracking-widest text-white uppercase font-mono">MANASON ENGINEERING</h1>
            <p className="text-xs text-slate-400 font-medium">{t('loadingSubtitle')}</p>
          </div>
          <div className="w-48 h-1 bg-slate-900 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between text-slate-800">

      {/* TOP UTILITY BAR — contact info, WhatsApp, language, quick auth */}
      <div className="hidden md:flex bg-slate-950 text-slate-300 text-xxs font-medium items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-5">
          <a href={`mailto:${settings?.email || 'manasonengineering@gmail.com'}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5" /> {settings?.email || 'manasonengineering@gmail.com'}
          </a>
          <a href={`tel:${settings?.phone || '+250785647676'}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5" /> {settings?.phone || '+250785647676'}
          </a>
          <a
            href={`https://wa.me/${(settings?.whatsapp || '250785647676').replace(/[^0-9]/g, '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button onClick={() => setLanguage('en')} className={`px-1.5 py-0.5 rounded text-xxs font-bold uppercase ${language === 'en' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => setLanguage('rw')} className={`px-1.5 py-0.5 rounded text-xxs font-bold uppercase ${language === 'rw' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>RW</button>
            <span className="text-slate-700">|</span>
            <button onClick={() => setLanguage('fr')} className={`px-1.5 py-0.5 rounded text-xxs font-bold uppercase ${language === 'fr' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>FR</button>
          </div>
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsAuthOpen(true)} className="px-3 py-1 rounded border border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors font-bold uppercase tracking-wide text-xxs">
                {t('login')}
              </button>
              <button onClick={() => setIsAuthOpen(true)} className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-900 transition-colors font-bold uppercase tracking-wide text-xxs">
                {t('register')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold">{currentUser.name}</span>
              <span className="text-slate-700">|</span>
              <button onClick={() => { logout(); setActiveView('home'); }} className="hover:text-white transition-colors font-bold uppercase tracking-wide">
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Link to Home */}
            <div className="cursor-pointer flex-shrink-0" onClick={() => { setActiveView('home'); setIsMenuOpen(false); }}>
              <Logo height={44} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex space-x-1 items-center">
              {[
                { id: 'home', label: t('home') },
                { id: 'workers', label: t('findWorkers') },
                { id: 'products', label: t('products') },
                { id: 'consultancy', label: t('consultancy') },
                { id: 'jobBoard', label: t('jpNavLabel') },
                { id: 'projects', label: t('projects') },
                { id: 'about', label: t('about') },
                { id: 'contact', label: t('contact') }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeView === view.id
                      ? 'text-blue-800 bg-blue-50'
                      : 'text-slate-600 hover:text-blue-800 hover:bg-slate-100'
                  }`}
                >
                  {view.label}
                </button>
              ))}

              {/* Dynamic Dashboard button */}
              {currentUser && (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    activeView === 'dashboard'
                      ? 'text-emerald-800 bg-emerald-50'
                      : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/50'
                  }`}
                >
                  {t('dashboard')}
                </button>
              )}
            </nav>

            {/* Language switch & Authentication Center */}
            <div className="hidden xl:flex items-center gap-3">
              
              {/* Language Switcher */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xxs font-bold uppercase transition-all ${
                    language === 'en' ? 'bg-blue-800 text-white shadow' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('rw')}
                  className={`px-2 py-1 rounded text-xxs font-bold uppercase transition-all ${
                    language === 'rw' ? 'bg-blue-800 text-white shadow' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  RW
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={`px-2 py-1 rounded text-xxs font-bold uppercase transition-all ${
                    language === 'fr' ? 'bg-blue-800 text-white shadow' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  FR
                </button>
              </div>

              {/* Login / Profile logic */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={() => { logout(); setActiveView('home'); }}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mobile Hamburger menu trigger */}
            <div className="xl:hidden flex items-center gap-2">
              {/* Mobile Language switch */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'rw' : (language === 'rw' ? 'fr' : 'en'))}
                className="p-2 border rounded-lg bg-slate-100 text-xs font-bold flex items-center gap-1"
              >
                <Globe className="w-4 h-4 text-blue-800" />
                <span className="uppercase">{language}</span>
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-inner">
            {[
              { id: 'home', label: t('home') },
              { id: 'workers', label: t('findWorkers') },
              { id: 'products', label: t('products') },
              { id: 'consultancy', label: t('consultancy') },
              { id: 'jobBoard', label: t('jpNavLabel') },
              { id: 'projects', label: t('projects') },
              { id: 'about', label: t('about') },
              { id: 'contact', label: t('contact') }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => { setActiveView(view.id as any); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100 block"
              >
                {view.label}
              </button>
            ))}

            {currentUser && (
              <button
                onClick={() => { setActiveView('dashboard'); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50 block"
              >
                {t('dashboard')}
              </button>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {currentUser ? (
                <>
                  <div className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 rounded border">
                    {currentUser.name} ({currentUser.type})
                  </div>
                  <button
                    onClick={() => { logout(); setActiveView('home'); setIsMenuOpen(false); }}
                    className="w-full text-center py-2 border text-xs font-bold uppercase rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }}
                  className="w-full text-center py-2.5 bg-blue-800 text-white text-xs font-bold uppercase rounded-lg shadow"
                >
                  {t('login')} / {t('register')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN ACTIVE VIEW RENDERER */}
      <main className="flex-grow">
        
        {/* VIEW: HOME LANDING */}
        {activeView === 'home' && (
          <div className="animate-in fade-in duration-500">
            
            {homepage?.announcement && (
              <div className="bg-slate-900 text-amber-400 px-4 py-2.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b border-slate-800 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span>{homepage.announcement}</span>
              </div>
            )}
            
            {/* HERO SECTION WITH SEARCH WIDGET */}
            <div 
              id="hero"
              className="relative min-h-[75vh] flex items-center bg-cover bg-center text-white overflow-hidden py-16"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.85)), url('${kigaliHero}')`
              }}
            >
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                {/* Left: Headline & CTAs */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-600/40 text-blue-300 text-xs font-bold uppercase tracking-widest">
                    <Landmark className="w-3.5 h-3.5 text-blue-400" />
                    {homepage?.announcement ? t('heroRibbonAnnouncement') : t('heroRibbonDefault')}
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white font-sans">
                    {homepage?.bannerTitle || t('heroTitle')}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl font-medium">
                    {homepage?.bannerSubtitle || t('heroSubtitle')}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setActiveView('workers')}
                      className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-transform duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" /> {t('heroCtaWorkers')}
                    </button>
                    <button
                      onClick={() => setActiveView('consultancy')}
                      className="px-6 py-3.5 bg-slate-900/70 border border-slate-600 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-transform duration-200 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> {t('heroCtaQuote')}
                    </button>
                  </div>
                </div>

                {/* Right: Unified Search Widget */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-2xl p-5 text-slate-800">
                  <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
                    {([
                      { id: 'workers', label: t('searchTabWorkers'), icon: Users },
                      { id: 'services', label: t('searchTabServices'), icon: Briefcase },
                      { id: 'products', label: t('searchTabProducts'), icon: ShoppingBag }
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setHeroSearchTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xxs font-bold uppercase tracking-wide transition-all ${
                          heroSearchTab === tab.id ? 'bg-amber-400 text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={heroSearchQuery}
                        onChange={(e) => setHeroSearchQuery(e.target.value)}
                        placeholder={t('searchWidgetPlaceholder')}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>{t('selectCategoryPlaceholder')}</option>
                      </select>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>{t('selectLocationPlaceholder')}</option>
                      </select>
                    </div>
                    <button
                      onClick={handleHeroSearch}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" /> {t('searchButton')}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* TRUST STRIP */}
            <div className="bg-slate-900 text-white py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { icon: Users, title: t('trustProfessionals'), desc: t('trustProfessionalsDesc') },
                  { icon: ShieldCheck, title: t('trustQuality'), desc: t('trustQualityDesc') },
                  { icon: Briefcase, title: t('trustPayments'), desc: t('trustPaymentsDesc') },
                  { icon: HelpCircle, title: t('trustSupport'), desc: t('trustSupportDesc') },
                  { icon: MapPin, title: t('trustCoverage'), desc: t('trustCoverageDesc') }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <item.icon className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">{item.title}</p>
                      <p className="text-xxs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHAT ARE YOU LOOKING FOR — CATEGORY GRID */}
            <section className="py-14 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">{t('whatLookingFor')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {[
                    { icon: Building2, title: t('catConstruction'), desc: t('catConstructionDesc'), view: 'workers' },
                    { icon: Landmark, title: t('catArchitecture'), desc: t('catArchitectureDesc'), view: 'consultancy' },
                    { icon: Settings, title: t('catEngineering'), desc: t('catEngineeringDesc'), view: 'consultancy' },
                    { icon: Briefcase, title: t('catConsulting'), desc: t('catConsultingDesc'), view: 'consultancy' },
                    { icon: Package, title: t('catSupplies'), desc: t('catSuppliesDesc'), view: 'products' },
                    { icon: Truck, title: t('catEquipment'), desc: t('catEquipmentDesc'), view: 'products' },
                    { icon: HardHat, title: t('catWorkersTitle'), desc: t('catWorkersDesc'), view: 'workers' },
                    { icon: Megaphone, title: t('jpNavLabel'), desc: t('jpCategoryCardDesc'), view: 'jobBoard' }
                  ].map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveView(cat.view as any)}
                      className="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all bg-white group"
                    >
                      <cat.icon className="w-7 h-7 text-amber-500 mb-3" />
                      <p className="font-bold text-sm text-slate-900">{cat.title}</p>
                      <p className="text-xxs text-slate-500 mt-1 mb-2 leading-relaxed">{cat.desc}</p>
                      <span className="text-xxs font-bold text-blue-700 group-hover:underline flex items-center gap-0.5">
                        {t('exploreLabel')} <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* STATS NUMBERS */}
            <section className="py-10 bg-slate-100 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                {[
                  { icon: Award, num: `${projects.length > 0 ? projects.length : 500}+`, label: t('statProjects') },
                  { icon: Users, num: '1000+', label: t('statProfessionals') },
                  { icon: ShieldCheck, num: '300+', label: t('statClients') },
                  { icon: Compass, num: '10+', label: t('statYears') }
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <s.icon className="w-6 h-6 text-blue-700 mb-2" />
                    <p className="text-2xl font-extrabold text-slate-900">{s.num}</p>
                    <p className="text-xxs text-slate-500 uppercase font-bold tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* JOIN NETWORK BANNER */}
            {!currentUser && (
              <div className="bg-amber-400 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{t('joinNetworkTitle')}</h3>
                    <p className="text-sm text-slate-800 mt-1">{t('joinNetworkDesc')}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => setIsAuthOpen(true)} className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wide">
                      {t('iAmClient')}
                    </button>
                    <button onClick={() => setIsAuthOpen(true)} className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wide">
                      {t('iAmWorker')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FOR CLIENTS / PROFESSIONALS / COMPANIES */}
            <section className="py-14 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Users, title: t('forClientsTitle'), desc: t('forClientsDesc'), view: 'workers' },
                  { icon: HardHat, title: t('forProfessionalsTitle'), desc: t('forProfessionalsDesc'), view: 'workers' },
                  { icon: Briefcase, title: t('forCompaniesTitle'), desc: t('forCompaniesDesc'), view: 'workers' }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                    <item.icon className="w-8 h-8 text-blue-700 mb-3" />
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                    <button onClick={() => setActiveView(item.view as any)} className="text-xs font-bold text-blue-700 hover:underline mt-3 flex items-center gap-1">
                      {t('learnMore')} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* BENTO GRID SERVICES ADVANTAGE */}
            <section className="py-16 bg-white border-b border-slate-200 text-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight sm:text-3xl">
                    {t('servicesSectionTitle')}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {t('servicesSectionSubtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Service 1 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mb-4">
                        <HardHat className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg uppercase tracking-wide">{t('service1Title')}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {t('service1Desc')}
                      </p>
                    </div>
                    <button onClick={() => setActiveView('workers')} className="text-blue-800 hover:text-blue-900 text-xs font-bold uppercase tracking-wide flex items-center mt-6">
                      {t('service1Cta')} <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>

                  {/* Service 2 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mb-4">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg uppercase tracking-wide">{t('service2Title')}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {t('service2Desc')}
                      </p>
                    </div>
                    <button onClick={() => setActiveView('products')} className="text-emerald-700 hover:text-emerald-800 text-xs font-bold uppercase tracking-wide flex items-center mt-6">
                      {t('service2Cta')} <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>

                  {/* Service 3 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-xl flex items-center justify-center mb-4">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg uppercase tracking-wide">{t('service3Title')}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {t('service3Desc')}
                      </p>
                    </div>
                    <button onClick={() => setActiveView('consultancy')} className="text-purple-700 hover:text-purple-800 text-xs font-bold uppercase tracking-wide flex items-center mt-6">
                      {t('service3Cta')} <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* TRUSTED ESCROW PAYMENT OVERVIEW */}
            <section className="py-16 bg-slate-50 text-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-md flex flex-col lg:flex-row items-center justify-between gap-10">
                  
                  <div className="max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      {t('escrowBadge')}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                      {t('escrowTitle')}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {t('escrowDesc')}
                    </p>
                    <div className="space-y-2 text-xs text-slate-600 font-semibold">
                      <p className="flex items-center gap-2">✓ {t('escrowPoint1')}</p>
                      <p className="flex items-center gap-2">✓ {t('escrowPoint2')}</p>
                      <p className="flex items-center gap-2">✓ {t('escrowPoint3')}</p>
                    </div>
                  </div>

                  {/* Flow chart illustration */}
                  <div className="bg-slate-950 text-slate-300 p-6 rounded-2xl border border-slate-800 w-full lg:max-w-sm space-y-3 font-mono text-xxs leading-relaxed">
                    <p className="text-yellow-400 font-bold border-b border-slate-800 pb-1.5 uppercase text-[9px] tracking-wider">{t('escrowFlowTitle')}</p>
                    <div className="space-y-2">
                      <p className="text-slate-400">1. {t('escrowFlow1')} → <span className="text-slate-200">{t('escrowFlow1b')}</span></p>
                      <p className="text-slate-400">2. {t('escrowFlow2')} → <span className="text-blue-400">{t('escrowFlow2b')}</span></p>
                      <p className="text-slate-400">3. {t('escrowFlow3')} → <span className="text-amber-400">{t('escrowFlow3b')}</span></p>
                      <p className="text-slate-400">4. {t('escrowFlow4')} → <span className="text-emerald-400">{t('escrowFlow4b')}</span></p>
                      <p className="text-slate-500 mt-2 text-[8px]">★ {t('escrowFlowFee')}</p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW: DIRECTORIES / WORKERS */}
        {activeView === 'workers' && (
          <WorkersDirectory />
        )}

        {/* VIEW: PRODUCTS MARKETPLACE */}
        {activeView === 'products' && (
          <Marketplace />
        )}

        {/* VIEW: CONSULTANCY BRIEF */}
        {activeView === 'consultancy' && (
          <ConsultancySection />
        )}

        {/* VIEW: JOB POSTING BOARD */}
        {activeView === 'jobBoard' && (
          <JobPostingBoard />
        )}

        {/* VIEW: PROJECTS (RWANDAN BUILDINGS PORTFOLIO) */}
        {activeView === 'projects' && (
          <section id="projects-section" className="py-12 bg-white text-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 uppercase">{t('projectsSectionTitle')}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {t('projectsSectionSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                    <img src={proj.imageUrl} className="h-48 w-full object-cover" />
                    <div className="p-5 text-slate-800">
                      <span className="text-xxs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">{proj.category}</span>
                      <h3 className="font-bold text-sm uppercase text-slate-900 mt-2">{proj.title}</h3>
                      <p className="text-xxs text-slate-500">{proj.contractor}</p>
                      <p className="text-xs text-slate-600 mt-2">
                        {proj.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: ABOUT (MISSION & VISION) */}
        {activeView === 'about' && (
          <section id="about-section" className="py-12 bg-white text-slate-800">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
              
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 uppercase">{t('aboutSectionTitle')}</h2>
                <p className="mt-2 text-sm text-slate-500">{t('aboutSectionSubtitle')}</p>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed text-justify">
                <p>{t('aboutP1')}</p>
                <p>{t('aboutP2')}</p>
                <p>{t('aboutP3')}</p>
              </div>

              {/* Core Values Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">{t('missionTitle')}</h4>
                  <p className="text-xxs text-slate-500 leading-relaxed">
                    {t('missionDesc')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">{t('visionTitle')}</h4>
                  <p className="text-xxs text-slate-500 leading-relaxed">
                    {t('visionDesc')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">{t('valuesTitle')}</h4>
                  <p className="text-xxs text-slate-500 leading-relaxed">
                    {t('valuesDesc')}
                  </p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* VIEW: CONTACT INFO & FORMS */}
        {activeView === 'contact' && (
          <section id="contact-section" className="py-12 bg-white text-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 uppercase">{t('contactSectionTitle')}</h2>
                <p className="mt-2 text-sm text-slate-500">{t('contactSectionSubtitle')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Contact information (5 cols) */}
                <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                  
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm uppercase">{t('mainOffice')}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-600" /> {t('mainOfficeAddress')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 text-sm uppercase">{t('generalInquiries')}</h3>
                    <a href="mailto:manasonengineering@gmail.com" className="text-xs text-blue-700 hover:underline block mt-1 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" /> manasonengineering@gmail.com
                    </a>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 text-sm uppercase">{t('phoneHelpDesk')}</h3>
                    <a href="tel:+250785647676" className="text-xs text-blue-700 hover:underline block mt-1 flex items-center gap-1.5 font-mono">
                      <Phone className="w-4 h-4 text-blue-600" /> +250785647676
                    </a>
                  </div>

                  <div className="p-4 bg-blue-50 text-blue-900 rounded-xl text-xxs font-semibold">
                    {t('supportHoursNote')}
                  </div>

                </div>

                {/* Contact submit form (7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200">
                  {isContactSuccess ? (
                    <div className="text-center py-12 text-slate-800">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold">{t('messageDispatched')}</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {t('messageDispatchedDesc')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <h3 className="font-bold text-sm text-slate-950 uppercase border-b pb-1">{t('emailEscrowDesk')}</h3>
                      
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">{t('subjectProjectId')}</label>
                        <input
                          type="text"
                          required
                          placeholder={t('subjectPlaceholder')}
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">{t('messageDetails')}</label>
                        <textarea
                          required
                          rows={4}
                          placeholder={t('messagePlaceholder')}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold uppercase shadow tracking-wider"
                      >
                        {t('sendSecureMessage')}
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>
          </section>
        )}

        {/* VIEW: USER DASHBOARD */}
        {activeView === 'dashboard' && (
          <Dashboard />
        )}

      </main>

      {/* 3. PLATFORM GLOBAL FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-900">
            
            {/* Logo and short bio */}
            <div className="md:col-span-4 space-y-4">
              <Logo height={48} className="brightness-110" />
              <p className="text-xxs text-slate-500 leading-relaxed max-w-sm">
                {t('footerTagline')}
              </p>
            </div>

            {/* Quick links */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{t('footerMarketplace')}</h4>
              <div className="grid grid-cols-2 gap-2 text-xxs font-medium">
                <button onClick={() => setActiveView('workers')} className="text-left hover:text-white transition-colors uppercase">{t('footerArtisans')}</button>
                <button onClick={() => setActiveView('products')} className="text-left hover:text-white transition-colors uppercase">{t('footerMaterials')}</button>
                <button onClick={() => setActiveView('consultancy')} className="text-left hover:text-white transition-colors uppercase">{t('footerAdvisory')}</button>
                <button onClick={() => setActiveView('projects')} className="text-left hover:text-white transition-colors uppercase">{t('footerProjectsLink')}</button>
                <button onClick={() => setActiveView('about')} className="text-left hover:text-white transition-colors uppercase">{t('footerAboutUsLink')}</button>
                <button onClick={() => setActiveView('contact')} className="text-left hover:text-white transition-colors uppercase">{t('footerDisputes')}</button>
              </div>
            </div>

            {/* Contact info card */}
            <div className="md:col-span-4 space-y-3 text-xxs">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{t('footerHelpDeskEscrow')}</h4>
              <p className="text-slate-500 font-medium">{settings?.officeAddress || 'Gasabo District, Remera, Kigali, Rwanda'}</p>
              <p className="text-slate-300 font-semibold font-mono">
                {t('phoneHelpDesk')}: <a href={`tel:${settings?.phone || '+250785647676'}`} className="hover:underline">{settings?.phone || '+250785647676'}</a>
              </p>
              <p className="text-slate-300 font-semibold">
                Email: <a href={`mailto:${settings?.email || 'manasonengineering@gmail.com'}`} className="hover:underline">{settings?.email || 'manasonengineering@gmail.com'}</a>
              </p>
              <p className="text-emerald-400 font-semibold">
                WhatsApp: <a href={`https://wa.me/${(settings?.whatsapp || '250785647676').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{settings?.whatsapp || '+250785647676'}</a>
              </p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600 font-mono">
            <span>© 2026 MANASON ENGINEERING LTD. {t('footerRights')}</span>
            <span className="mt-2 sm:mt-0 uppercase tracking-widest text-slate-700"> Kigali, Rwanda 🇷🇼 </span>
          </div>

        </div>
      </footer>

      {/* 4. FLOATING COMMS HUB DRAWER — Admin-only: contains private system messages */}
      {currentUser?.type === UserType.ADMIN && <NotificationLogger />}

      {/* FLOATING ACTION INTEGRATION HUB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 font-sans">
        {/* Expanded Hub flyout */}
        {isCommsOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🇷🇼</span>
                  <span className="font-mono text-xxs font-bold text-emerald-400 tracking-wider">{t('onlineHelpDesk')}</span>
                </div>
                <button
                  onClick={() => setIsCommsOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-sm font-bold mt-1">{t('commsHubTitle')}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {t('commsHubDesc')}
              </p>
            </div>

            {/* List of communication methods */}
            <div className="p-4 space-y-3">
              {/* WhatsApp direct */}
              <a
                href={`https://wa.me/${(settings?.whatsapp || '250785647676').replace(/[^0-9]/g, '')}?text=Hello%20Manason%20Engineering,%20I%20would%20like%20to%20request%20assistance%20regarding%20construction%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  💬
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {t('chatWhatsapp')}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {t('avgResponse')}
                  </p>
                </div>
              </a>

              {/* Email direct */}
              <a
                href={`mailto:${settings?.email || 'manasonengineering@gmail.com'}?subject=Manason%20Engineering%20Inquiry`}
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  ✉️
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-800 transition-colors">
                    {t('officialEmail')}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {t('emailForQuotes')}
                  </p>
                </div>
              </a>

              {/* Hotline phone */}
              <a
                href={`tel:${settings?.phone || '+250785647676'}`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  📞
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-slate-800 transition-colors">
                    {t('escrowSupportPhone')}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {t('callLabel')}: {settings?.phone || '+250785647676'}
                  </p>
                </div>
              </a>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[9px] text-slate-400 font-mono">
              ● {t('compliance247')}
            </div>
          </div>
        )}

        {/* Floating circular button minimized */}
        <button
          onClick={() => setIsCommsOpen(!isCommsOpen)}
          className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all relative group"
          title={t('openCommDesk')}
        >
          <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-25 animate-ping group-hover:opacity-0" />
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* 5. SECURE AUTHENTICATION MODAL */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AppProvider>
  );
}
