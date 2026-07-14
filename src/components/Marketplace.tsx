/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { triggerFileDownload } from '../lib/pdfDownloader';
import { Product } from '../types';
import { Sparkles, FileDown, Check, Tag, Info, AlertCircle, ShoppingBag, ShieldAlert } from 'lucide-react';

export default function Marketplace() {
  const { products, currentUser, addQuoteRequest, quotes, brochures, incrementBrochureDownload, setIsAuthOpen } = useApp();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quoteTarget, setQuoteTarget] = useState<Product | null>(null);
  const [quoteDetails, setQuoteDetails] = useState('');
  const [isQuoteSuccess, setIsQuoteSuccess] = useState(false);

  const categories = [
    'All', 'Cement', 'Clay Bricks & Roof Tiles', 'Steel Products',
    'Concrete Blocks & Concrete Products', 'Ceramic Tiles', 'Aluminium Windows & Doors',
    'Glass Products', 'Granite & Natural Stone', 'Paints',
    'Waterproofing & Construction Chemicals', 'PVC Pipes & Plumbing', 'Water Pumps',
    'Roofing Materials', 'Construction Equipment', 'Hardware & Building Materials'
  ];

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !quoteTarget) return;

    addQuoteRequest(quoteTarget.id, quoteDetails);
    setIsQuoteSuccess(true);
    setTimeout(() => {
      setIsQuoteSuccess(false);
      setQuoteTarget(null);
      setQuoteDetails('');
    }, 2000);
  };

  return (
    <section id="marketplace" className="py-12 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            100% Rwandan Building Materials
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            {t('products')}
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Source high-strength cement, premium paints, reinforcement rods, and clay blocks made locally in Rwanda. Receive verified custom pricing immediately.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? t('all') : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            // Find if there is an active approved quote for this product for the current user
            const activeQuote = quotes.find(q => q.productId === product.id && q.clientId === currentUser?.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-300"
              >
                {/* Product Image Panel */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badging */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isMadeInRwanda && (
                      <span className="bg-emerald-600 text-white font-bold text-[9px] uppercase px-2.5 py-1 rounded-md shadow-sm tracking-wider">
                        {t('madeInRwanda')} 🇷🇼
                      </span>
                    )}
                    {product.isPromotion && (
                      <span className="bg-amber-500 text-slate-900 font-bold text-[9px] uppercase px-2.5 py-1 rounded-md shadow-sm tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Sale Promo
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1 group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      By {product.supplierName}
                    </p>
                    <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                      {product.description}
                    </p>

                    {product.isPromotion && product.promotionalText && (
                      <div className="mt-3 p-2 bg-amber-50 text-amber-800 rounded-md text-[10px] font-semibold border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        {product.promotionalText}
                      </div>
                    )}
                  </div>

                  {/* Pricing / CTA Section */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                          Igiciro
                        </span>
                        <span className="font-bold text-slate-700 text-sm">
                          Saba Igiciro Cyihariye
                        </span>
                      </div>

                      {/* Live Price verification */}
                      <span className="text-xxs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                        {t('livePrices')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Active Quote status notice */}
                      {activeQuote && (
                        <div className={`p-2 rounded-lg text-xs flex gap-1.5 border ${
                          activeQuote.status === 'pending'
                            ? 'bg-slate-50 text-slate-600 border-slate-200'
                            : activeQuote.status === 'replied'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold capitalize">Quote: {activeQuote.status}</p>
                            {activeQuote.priceOfferedByAdmin && (
                              <p className="text-[10px] mt-0.5">
                                Admin Approved Price: <strong>{activeQuote.priceOfferedByAdmin.toLocaleString()} RWF</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Request Price CTA */}
                      {currentUser ? (
                        <button
                          onClick={() => setQuoteTarget(product)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs tracking-wide uppercase shadow-sm transition-all"
                        >
                          {t('requestPriceButton')}
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsAuthOpen(true)}
                          className="w-full py-2.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg font-bold text-xs tracking-wide uppercase transition-all"
                        >
                          Login to Request Price
                        </button>
                      )}

                      {/* Catalogue download */}
                      <button 
                        onClick={() => {
                          const matchingBrochure = brochures?.find(b => b.category.toLowerCase() === product.category.toLowerCase() || b.name.toLowerCase().includes(product.name.toLowerCase()));
                          if (matchingBrochure) {
                            incrementBrochureDownload(matchingBrochure.id);
                            triggerFileDownload(matchingBrochure.name, matchingBrochure.category);
                          } else {
                            triggerFileDownload(`${product.name} Technical Sheet`, product.category);
                          }
                        }}
                        className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xxs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <FileDown className="w-3 h-3" />
                        Download PDF Brochure
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* PRICE QUOTATION MODAL */}
      {quoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base uppercase">
                  Bulk Quote Request
                </h3>
                <p className="text-xs text-slate-500">
                  Negotiate directly on {quoteTarget.name}
                </p>
              </div>
              <button
                onClick={() => setQuoteTarget(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {isQuoteSuccess ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Price Request Sent!</h4>
                <p className="text-xs text-slate-500 mt-1.5">
                  Your bulk inquiry is dispatched to the Admin inbox. Live pricing responses appear in your client dashboard!
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4">
                
                <div className="bg-emerald-50 text-emerald-900 p-3.5 rounded-xl border border-emerald-100 text-xs flex gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Admin-Verified Escrow:</strong>
                    Requests are processed directly by Manason Engineering administrators to guarantee the lowest bulk factory price from suppliers.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Order Quantity & Transport Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. Please offer bulk rate for 150 cement bags delivered to Gahanga. Need the discount applied directly to my dashboard so I can execute."
                    value={quoteDetails}
                    onChange={(e) => setQuoteDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs tracking-wide uppercase shadow"
                >
                  Dispatch Price Request to Admin
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
