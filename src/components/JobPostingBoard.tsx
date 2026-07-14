/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { JobPosting, JobPostingStatus } from '../types';
import {
  Megaphone, Plus, MapPin, Clock, Users, X, Check,
  Briefcase, Sparkles, ChevronRight, Award, ShieldCheck
} from 'lucide-react';

const CATEGORY_OPTIONS: { value: string; key: string }[] = [
  { value: 'Masonry', key: 'jpCategoryMasonry' },
  { value: 'Plumbing', key: 'jpCategoryPlumbing' },
  { value: 'Electrical', key: 'jpCategoryElectrical' },
  { value: 'Carpentry', key: 'jpCategoryCarpentry' },
  { value: 'Roofing', key: 'jpCategoryRoofing' },
  { value: 'Painting', key: 'jpCategoryPainting' },
  { value: 'Architecture & Design', key: 'jpCategoryArchitecture' },
  { value: 'Civil Engineering', key: 'jpCategoryCivilEngineering' },
  { value: 'General Construction', key: 'jpCategoryGeneral' },
  { value: 'Other', key: 'jpCategoryOther' }
];

function timeAgo(iso: string, t: (k: string) => string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('jpJustNow');
  if (mins < 60) return `${mins} ${t('jpMinutesAgo')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${t('jpHoursAgo')}`;
  const days = Math.floor(hours / 24);
  return `${days} ${t('jpDaysAgo')}`;
}

export default function JobPostingBoard() {
  const { jobPostings, currentUser, addJobPosting, submitJobOffer, acceptJobOffer, setIsAuthOpen } = useApp();
  const { t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<'open' | 'all'>('open');
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null);

  // Post-a-job modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postCategory, setPostCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [postLocation, setPostLocation] = useState('');
  const [postBudget, setPostBudget] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Offer form state (keyed by posting id)
  const [offerPrice, setOfferPrice] = useState<Record<string, string>>({});
  const [offerMessage, setOfferMessage] = useState<Record<string, string>>({});
  const [isSubmittingOffer, setIsSubmittingOffer] = useState<Record<string, boolean>>({});
  const [isAcceptingOffer, setIsAcceptingOffer] = useState<Record<string, boolean>>({});

  const visiblePostings = jobPostings.filter(jp =>
    statusFilter === 'all' ? true : jp.status === JobPostingStatus.OPEN
  );

  const getCategoryLabel = (value: string) => {
    const match = CATEGORY_OPTIONS.find(c => c.value === value);
    return match ? t(match.key) : value;
  };

  const openPostModal = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim() || !postBudget) return;
    setIsSubmittingPost(true);
    try {
      await addJobPosting({
        title: postTitle.trim(),
        description: postDescription.trim(),
        category: postCategory,
        location: postLocation.trim(),
        budget: Number(postBudget)
      });
      setPostSuccess(true);
      setPostTitle('');
      setPostDescription('');
      setPostCategory(CATEGORY_OPTIONS[0].value);
      setPostLocation('');
      setPostBudget('');
      setTimeout(() => {
        setPostSuccess(false);
        setIsPostModalOpen(false);
      }, 1800);
    } catch (err: any) {
      alert(err.message || t('jpPostFailed'));
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleOfferSubmit = async (postingId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const price = offerPrice[postingId];
    const message = offerMessage[postingId];
    if (!price || !message || !message.trim()) return;
    setIsSubmittingOffer(prev => ({ ...prev, [postingId]: true }));
    try {
      await submitJobOffer(postingId, Number(price), message.trim());
      setOfferPrice(prev => ({ ...prev, [postingId]: '' }));
      setOfferMessage(prev => ({ ...prev, [postingId]: '' }));
      const refreshed = jobPostings.find(jp => jp.id === postingId);
      if (refreshed) setSelectedPosting(refreshed);
      alert(t('jpOfferSent'));
    } catch (err: any) {
      alert(err.message || t('jpOfferFailed'));
    } finally {
      setIsSubmittingOffer(prev => ({ ...prev, [postingId]: false }));
    }
  };

  const handleAcceptOffer = async (postingId: string, offerId: string) => {
    if (!confirm(t('jpConfirmAccept'))) return;
    setIsAcceptingOffer(prev => ({ ...prev, [offerId]: true }));
    try {
      await acceptJobOffer(postingId, offerId);
      alert(t('jpOfferAccepted'));
      setSelectedPosting(null);
    } catch (err: any) {
      alert(err.message || t('jpAcceptFailed'));
    } finally {
      setIsAcceptingOffer(prev => ({ ...prev, [offerId]: false }));
    }
  };

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
            <Megaphone className="w-3.5 h-3.5" />
            {t('jpBoardBadge')}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mt-3">
            {t('jpBoardTitle')}
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            {t('jpBoardSubtitle')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                statusFilter === 'open'
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t('jpFilterOpen')}
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                statusFilter === 'all'
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {t('jpFilterAll')}
            </button>
          </div>
          <button
            onClick={openPostModal}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide px-5 py-2.5 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('jpPostAJob')}
          </button>
        </div>

        {/* Postings grid */}
        {visiblePostings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-500">{t('jpNoPostings')}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5">{t('jpNoPostingsDesc')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visiblePostings.map(posting => (
              <button
                key={posting.id}
                onClick={() => setSelectedPosting(posting)}
                className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {getCategoryLabel(posting.category)}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      posting.status === JobPostingStatus.OPEN
                        ? 'text-emerald-700 bg-emerald-50'
                        : posting.status === JobPostingStatus.AWARDED
                          ? 'text-purple-700 bg-purple-50'
                          : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {posting.status === JobPostingStatus.OPEN
                      ? t('jpStatusOpen')
                      : posting.status === JobPostingStatus.AWARDED
                        ? t('jpStatusAwarded')
                        : t('jpStatusClosed')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 mt-2.5 line-clamp-2">{posting.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{posting.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {posting.budget.toLocaleString()} RWF
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                    <Users className="w-3 h-3" />
                    {posting.offers.length} {t('jpOffersWord')}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  {posting.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {posting.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {timeAgo(posting.createdAt, t)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* POST A JOB MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">{t('jpPostAJob')}</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {postSuccess ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-lg">{t('jpPostSuccess')}</h4>
                <p className="text-sm text-slate-500 mt-2">{t('jpPostSuccessDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handlePostSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                    {t('jpJobTitleLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder={t('jpJobTitlePlaceholder')}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                    {t('jpCategoryLabel')}
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>{t(cat.key)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                    {t('jpDescriptionLabel')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder={t('jpDescriptionPlaceholder')}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                      {t('jpLocationLabel')}
                    </label>
                    <input
                      type="text"
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      placeholder={t('jpLocationPlaceholder')}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                      {t('jpBudgetLabel')}
                    </label>
                    <input
                      type="number"
                      required
                      value={postBudget}
                      onChange={(e) => setPostBudget(e.target.value)}
                      placeholder={t('jpBudgetPlaceholder')}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wide py-3 rounded-lg shadow-sm"
                >
                  {isSubmittingPost ? t('jpPublishing') : t('jpPublishJob')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POSTING DETAIL MODAL */}
      {selectedPosting && (() => {
        const posting = jobPostings.find(jp => jp.id === selectedPosting.id) || selectedPosting;
        const isOwner = currentUser && currentUser.id === posting.clientId;
        const myOffer = currentUser ? posting.offers.find(o => o.workerId === currentUser.id) : undefined;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-start justify-between p-5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {getCategoryLabel(posting.category)}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mt-2">{posting.title}</h3>
                </div>
                <button onClick={() => setSelectedPosting(null)} className="text-slate-400 hover:text-slate-700 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <p className="text-sm text-slate-600">{posting.description}</p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{t('jpBudgetLabel')}</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">{posting.budget.toLocaleString()} RWF</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{t('jpLocationLabel')}</span>
                    <p className="font-bold text-slate-800 mt-0.5">{posting.location || '—'}</p>
                  </div>
                </div>

                {/* Offer submission form (visible to non-owners who haven't offered, only while open) */}
                {!isOwner && posting.status === JobPostingStatus.OPEN && !myOffer && (
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-blue-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> {t('jpSubmitOfferTitle')}
                    </h4>
                    <input
                      type="number"
                      placeholder={t('jpOfferPricePlaceholder')}
                      value={offerPrice[posting.id] || ''}
                      onChange={(e) => setOfferPrice(prev => ({ ...prev, [posting.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      rows={2}
                      placeholder={t('jpOfferMessagePlaceholder')}
                      value={offerMessage[posting.id] || ''}
                      onChange={(e) => setOfferMessage(prev => ({ ...prev, [posting.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleOfferSubmit(posting.id)}
                      disabled={isSubmittingOffer[posting.id]}
                      className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wide py-2.5 rounded-lg"
                    >
                      {isSubmittingOffer[posting.id] ? t('jpSendingOffer') : t('jpSendOffer')}
                    </button>
                  </div>
                )}

                {!isOwner && myOffer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                    <p className="font-bold text-slate-700">{t('jpYouAlreadyOffered')}</p>
                    <p className="text-slate-500 mt-1">
                      {t('jpYourOfferWas')}: <span className="font-mono font-bold">{myOffer.price.toLocaleString()} RWF</span>
                    </p>
                  </div>
                )}

                {!currentUser && (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wide py-2.5 rounded-lg"
                  >
                    {t('loginToHire')}
                  </button>
                )}

                {/* Offers list (owner only) */}
                {isOwner && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-slate-500 mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {posting.offers.length} {t('jpOffersWord')}
                    </h4>
                    {posting.offers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">{t('jpNoOffersYet')}</p>
                    ) : (
                      <div className="space-y-2.5">
                        {posting.offers
                          .slice()
                          .sort((a, b) => a.price - b.price)
                          .map(offer => (
                            <div key={offer.id} className="border border-slate-200 rounded-xl p-3.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">{offer.workerName}</p>
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">{offer.workerType}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-800">{offer.price.toLocaleString()} RWF</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-2">"{offer.message}"</p>

                              {offer.status === 'accepted' && (
                                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="w-3 h-3" /> {t('jpOfferAcceptedBadge')}
                                </span>
                              )}
                              {offer.status === 'rejected' && (
                                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {t('jpOfferRejectedBadge')}
                                </span>
                              )}
                              {offer.status === 'pending' && posting.status === JobPostingStatus.OPEN && (
                                <button
                                  onClick={() => handleAcceptOffer(posting.id, offer.id)}
                                  disabled={isAcceptingOffer[offer.id]}
                                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xxs uppercase tracking-wide py-2 rounded-lg"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  {isAcceptingOffer[offer.id] ? t('jpAccepting') : t('jpAcceptOffer')}
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
