/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { ShieldCheck, HardHat, FileCheck, Landmark, CheckCircle, Compass, Brain, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export default function ConsultancySection() {
  const { addConsultancy, askAiFeasibility } = useApp();
  const { t } = useLanguage();

  // Regular human booking states
  const [consultancyType, setConsultancyType] = useState<'architecture' | 'engineering' | 'quantity_surveying'>('architecture');
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // AI Advisory states
  const [activeTab, setActiveTab] = useState<'schedule' | 'ai_analyser'>('schedule');
  const [aiProjectType, setAiProjectType] = useState('Residential Villa');
  const [aiDetails, setAiDetails] = useState('');
  const [aiBudget, setAiBudget] = useState('');
  const [aiLocation, setAiLocation] = useState('Gahanga, Kicukiro, Kigali');
  const [aiResult, setAiResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleConsultancySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addConsultancy(consultancyType, details, budget, phone, email);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setDetails('');
      setBudget('');
      setPhone('');
      setEmail('');
    }, 2500);
  };

  const handleAiAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDetails) return;
    setIsAnalyzing(true);
    setAiResult('');
    try {
      const result = await askAiFeasibility(aiProjectType, aiDetails, aiBudget, aiLocation);
      setAiResult(result);
    } catch (err) {
      console.error(err);
      setAiResult(t('aiAnalysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to render markdown-like structures beautifully with tailwind
  const renderAiReport = (markdownText: string) => {
    if (!markdownText) return null;
    
    // Split by sections starting with '#' or '**'
    const lines = markdownText.split('\n');
    return (
      <div className="space-y-4 text-slate-300 font-sans text-xs leading-relaxed max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('###')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-blue-400 mt-4 mb-2 uppercase tracking-wide border-b border-slate-900 pb-1 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-500 animate-pulse" />
                {trimmed.replace(/###|\*/g, '').trim()}
              </h4>
            );
          }
          if (trimmed.startsWith('####') || trimmed.startsWith('**')) {
            return (
              <h5 key={idx} className="text-xs font-bold text-white mt-3 mb-1 uppercase tracking-wider">
                {trimmed.replace(/####|\*\*|:/g, '').trim()}
              </h5>
            );
          }
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 my-1">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>{trimmed.substring(1).trim()}</span>
              </div>
            );
          }
          if (trimmed === '') return <div key={idx} className="h-2" />;
          return <p key={idx} className="text-slate-300">{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <section id="consultancy" className="py-16 bg-slate-900 text-slate-100 relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/60 text-blue-300 text-xs font-bold mb-3 uppercase tracking-wider border border-blue-800">
            <Landmark className="w-3.5 h-3.5" />
            {t('certifiedAdvisoryBoard')}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            {t('consultancyTitle')}
          </h2>
          <p className="mt-3 text-base text-slate-400">
            {t('consultancySubtitle')}
          </p>
        </div>

        {/* Dynamic Mode Switcher Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'schedule'
                  ? 'bg-blue-700 text-white shadow-lg shadow-blue-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="inline-block w-4 h-4 mr-2" />
              {t('scheduleAdvisoryBrief')}
            </button>
            <button
              onClick={() => setActiveTab('ai_analyser')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'ai_analyser'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              {t('aiFeasibilityConsultant')}
            </button>
          </div>
        </div>

        {activeTab === 'schedule' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Advice Cards (Left Column - 5 cols) */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-950 text-blue-400 rounded-xl border border-blue-900">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('houseDesign')}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {t('houseDesignDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('roadDesign')}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {t('roadDesignDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-950 text-amber-400 rounded-xl border border-amber-900">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{t('boqTitle')}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {t('boqDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Request Form (Right Column - 7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
              {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-200">
                  <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold">{t('advisoryRequestLogged')}</h4>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                    {t('advisoryRequestLoggedDesc')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultancySubmit} className="space-y-4 text-slate-100">
                  <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-2 uppercase tracking-wide">
                    {t('scheduleTechnicalBrief')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {t('advisoryDiscipline')}
                      </label>
                      <select
                        value={consultancyType}
                        onChange={(e) => setConsultancyType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="architecture">{t('houseDesign')}</option>
                        <option value="engineering">{t('roadDesign')}</option>
                        <option value="quantity_surveying">{t('quantitySurveyingOption')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {t('estimatedBudget')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('budgetPlaceholder')}
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {t('contactPhone')}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={t('phonePlaceholder')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {t('contactEmail')}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      {t('describeProjectParams')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={t('describeProjectPlaceholder')}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:scale-[1.01] transition-transform duration-200"
                  >
                    {t('requestExpert')}
                  </button>
                </form>
              )}
            </div>

          </div>
        ) : (
          /* ==========================================
             AI ADVISORY FEASIBILITY ANALYSER (INTEGRATED)
             ========================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Input parameters panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <form onSubmit={handleAiAnalysis} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    {t('instantAiFeasibility')}
                  </h3>
                </div>

                <div>
                  <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {t('proposedStructureType')}
                  </label>
                  <select
                    value={aiProjectType}
                    onChange={(e) => setAiProjectType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Residential Villa">{t('residentialVilla')}</option>
                    <option value="Multi-story Apartments">{t('multiStoryApartments')}</option>
                    <option value="Warehouse / Industrial Shed">{t('industrialWarehouse')}</option>
                    <option value="Retaining Wall & Terracing">{t('retainingWallTerracing')}</option>
                    <option value="Access Road / Pavement Paving">{t('accessRoadPaving')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      {t('rwandaDistrictSector')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('districtPlaceholder')}
                      value={aiLocation}
                      onChange={(e) => setAiLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      {t('targetBudget')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('targetBudgetPlaceholder')}
                      value={aiBudget}
                      onChange={(e) => setAiBudget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {t('describeSoilSlope')}
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t('describeSoilPlaceholder')}
                    value={aiDetails}
                    onChange={(e) => setAiDetails(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      {t('analyzingFeasibility')}
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-cyan-300" />
                      {t('generateAiAudit')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* AI Report Output Panel (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-8 relative flex flex-col justify-between shadow-2xl overflow-hidden min-h-[400px]">
              
              {/* Construction Grid background accent */}
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

              {isAnalyzing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/90 z-20">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border border-blue-900 flex items-center justify-center animate-spin">
                      <RefreshCw className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-cyan-400 animate-bounce" />
                    </div>
                  </div>
                  <h4 className="text-sm font-mono tracking-widest text-blue-400 uppercase">
                    {t('computingSoilLoad')}
                  </h4>
                  <p className="text-slate-500 text-xs mt-2 max-w-sm">
                    {t('leveragingGemini')}
                  </p>
                </div>
              ) : null}

              {aiResult ? (
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-xxs font-mono text-slate-400">
                        {t('auditedByAi')}
                      </span>
                    </div>
                    <button
                      onClick={() => setAiResult('')}
                      className="text-xxs text-slate-500 hover:text-slate-300 underline uppercase"
                    >
                      {t('clearReport')}
                    </button>
                  </div>

                  {renderAiReport(aiResult)}

                  <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xxs text-slate-500 italic">
                      {t('aiReportDisclaimer')}
                    </span>
                    <button
                      onClick={() => {
                        // Prefill schedule tab with details
                        setDetails(
                          t('aiFeasibilityPrefillTemplate')
                            .replace('{type}', aiProjectType)
                            .replace('{location}', aiLocation)
                            .replace('{budget}', aiBudget)
                            .replace('{details}', aiDetails)
                        );
                        setBudget(aiBudget);
                        setActiveTab('schedule');
                      }}
                      className="px-4 py-1.5 bg-blue-950 text-blue-400 border border-blue-900 rounded-lg text-xxs font-bold uppercase hover:bg-blue-900 hover:text-white transition-colors"
                    >
                      {t('convertToBoardFile')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400 relative z-10 h-full">
                  <div className="w-16 h-16 bg-slate-900 text-blue-400 border border-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h4 className="text-base font-bold text-slate-200">
                    {t('awaitingProjectInput')}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                    {t('awaitingProjectInputDesc')}
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Safe Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xxs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          {t('certifiedFooter')}
        </div>

      </div>
    </section>
  );
}
