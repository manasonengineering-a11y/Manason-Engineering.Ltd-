/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { StagePosting } from '../types';
import {
  GraduationCap, Building2, MapPin, Clock, Users, Send, Smartphone,
  CheckCircle2, Loader2, AlertCircle, ClipboardList
} from 'lucide-react';

const STAGE_FEE_RWF = 5000;

export default function StageProgram() {
  const { currentUser, stagePostings, stageApplications, submitStageApplication, initiateStagePayment, checkStagePaymentStatus } = useApp();
  const { t } = useLanguage();

  const [selectedPosting, setSelectedPosting] = useState<StagePosting | 'general' | null>(null);
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [studentPhone, setStudentPhone] = useState(currentUser?.phone || '');
  const [school, setSchool] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [motivation, setMotivation] = useState('');

  const [stage, setStage] = useState<'form' | 'paying' | 'paid' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const openPostings = stagePostings.filter(p => p.isOpen);

  const myApplications = currentUser
    ? stageApplications.filter(a => a.studentId === currentUser.id)
    : [];

  const resetForm = () => {
    setSelectedPosting(null);
    setSchool('');
    setFieldOfStudy('');
    setMotivation('');
    setStage('form');
    setErrorMsg('');
  };

  const handleSubmitAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone || !school || !fieldOfStudy) return;

    setStage('paying');
    setErrorMsg('');

    try {
      const postingId = selectedPosting && selectedPosting !== 'general' ? selectedPosting.id : null;
      const postingTitle = selectedPosting && selectedPosting !== 'general'
        ? `${selectedPosting.title} — ${selectedPosting.companyName}`
        : t('stageGeneralPosting');

      const application = await submitStageApplication({
        studentName, studentPhone, school, fieldOfStudy,
        postingId, postingTitle, motivation
      });

      const payRes = await initiateStagePayment(application.id, studentPhone);
      if (!payRes.success || !payRes.referenceId) {
        setErrorMsg(payRes.error || 'MoMo payment could not be started. Try again.');
        setStage('error');
        return;
      }

      const referenceId = payRes.referenceId;
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        const statusRes = await checkStagePaymentStatus(referenceId);
        if (statusRes.status === 'SUCCESSFUL') {
          if (pollRef.current) clearInterval(pollRef.current);
          setStage('paid');
        } else if (statusRes.status === 'FAILED' || statusRes.status === 'REJECTED' || attempts > 20) {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMsg('Payment was not completed. Please try applying again.');
          setStage('error');
        }
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
      setStage('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
          <GraduationCap className="w-7 h-7 text-blue-700" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('stageHeroTitle')}
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
          {t('stageHeroSubtitle')}
        </p>
        <p className="text-xxs uppercase font-bold tracking-wide text-amber-700 bg-amber-50 border border-amber-200 inline-block px-3 py-1.5 rounded-full mt-4">
          {t('stageFeeNote')}
        </p>
      </div>

      {!selectedPosting ? (
        <>
          {/* Postings list */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {openPostings.length === 0 && (
              <div className="sm:col-span-2 text-center text-xs text-slate-500 italic py-4">
                {t('stageNoPostings')}
              </div>
            )}
            {openPostings.map(posting => (
              <div key={posting.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xxs font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {posting.field}
                  </span>
                  <span className="flex items-center gap-1 text-xxs text-slate-400 font-semibold">
                    <Users className="w-3 h-3" /> {posting.slots}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{posting.title}</h3>
                <p className="text-xxs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3" /> {posting.companyName}
                </p>
                <div className="flex items-center gap-3 text-xxs text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {posting.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {posting.durationWeeks}w</span>
                </div>
                {posting.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{posting.description}</p>
                )}
                <button
                  onClick={() => setSelectedPosting(posting)}
                  className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-wide"
                >
                  {t('stageApplyButton')}
                </button>
              </div>
            ))}
          </div>

          {/* General placement option */}
          <div className="text-center border-t border-slate-100 pt-6">
            <button
              onClick={() => setSelectedPosting('general')}
              className="px-5 py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700 text-xs font-bold uppercase tracking-wide"
            >
              {t('stageGeneralPosting')}
            </button>
          </div>

          {/* My applications */}
          {myApplications.length > 0 && (
            <div className="mt-12">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4" /> {t('stageMyApplications')}
              </h3>
              <div className="space-y-2">
                {myApplications.map(app => (
                  <div key={app.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{app.postingTitle}</p>
                      <p className="text-slate-400 text-xxs">{app.school} • {app.fieldOfStudy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                        app.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {app.paymentStatus}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                        app.status === 'placed' ? 'bg-blue-50 text-blue-700' :
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Application + payment form */
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {stage === 'form' && (
            <form onSubmit={handleSubmitAndPay} className="space-y-3">
              <button type="button" onClick={resetForm} className="text-xxs text-slate-400 font-bold uppercase mb-2">
                ← Back
              </button>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input required value={studentName} onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('stageFormPhone')}</label>
                <input required type="tel" placeholder="e.g. +250788123456" value={studentPhone} onChange={e => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('stageFormSchool')}</label>
                <input required value={school} onChange={e => setSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('stageFormField')}</label>
                <input required value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('stageFormMotivation')}</label>
                <textarea rows={3} value={motivation} onChange={e => setMotivation(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" /> {t('stagePayButton')} ({STAGE_FEE_RWF.toLocaleString()} RWF)
              </button>
            </form>
          )}

          {stage === 'paying' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">{t('stagePaying')}</p>
              <p className="text-xxs text-slate-400 mt-1">{studentPhone}</p>
            </div>
          )}

          {stage === 'paid' && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">{t('stagePaid')}</p>
              <button onClick={resetForm} className="mt-4 text-xs font-bold text-blue-700 uppercase">
                ← Back to postings
              </button>
            </div>
          )}

          {stage === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">{errorMsg}</p>
              <button onClick={() => setStage('form')} className="mt-4 text-xs font-bold text-blue-700 uppercase">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
