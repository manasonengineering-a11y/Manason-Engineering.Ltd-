/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { MessageSquare, Mail, Phone, Bell, Shield, Trash2, ChevronRight, Sparkles } from 'lucide-react';

export default function NotificationLogger() {
  const { dispatches, clearDispatches } = useApp();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="comms-hub-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {dispatches.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xxs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {dispatches.length}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold tracking-wide hidden md:inline">
          Live Comms Hub (WhatsApp & SMS)
        </span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Body */}
      <div
        id="comms-drawer"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white uppercase">Rwanda Communications Stream</h3>
              <p className="text-xs text-slate-400">Log y'Ubutumwa bwose (SMS, WhatsApp, Email)</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Info panel */}
        <div className="p-3 bg-teal-950/40 border-b border-teal-900/40 text-teal-300 text-xs flex gap-2">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Uko bikora:</strong> Email ubu yoherezwa koko (Resend). WhatsApp/SMS bikoreshwa nka log hano
            kugeza ubonye ibyangombwa bya Meta Business — icyo gihe nazo zohererezwa koko.
          </span>
        </div>

        {/* Logs Stream */}
        <div className="p-4 overflow-y-auto h-[calc(100%-190px)] space-y-3">
          {dispatches.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <Bell className="w-12 h-12 stroke-1 mb-3 text-slate-600" />
              <p className="text-sm font-medium">No outbound communications sent yet</p>
              <p className="text-xs max-w-xs mt-1">
                Dispatches will trigger live when you hire workers, deposit escrow, post progress reports, or request quotes!
              </p>
            </div>
          ) : (
            dispatches.map(disp => (
              <div
                key={disp.id}
                className={`p-3 rounded-lg border text-xs transition-all duration-300 ${
                  disp.type === 'WhatsApp'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100'
                    : disp.type === 'SMS'
                    ? 'bg-sky-950/40 border-sky-800/60 text-sky-100'
                    : disp.type === 'Email'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-100'
                    : 'bg-slate-800/50 border-slate-700 text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    {disp.type === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                    {disp.type === 'SMS' && <Phone className="w-3.5 h-3.5 text-sky-400" />}
                    {disp.type === 'Email' && <Mail className="w-3.5 h-3.5 text-amber-400" />}
                    {disp.type === 'Platform' && <Bell className="w-3.5 h-3.5 text-purple-400" />}
                    <span className="uppercase tracking-wider text-xxs font-mono">{disp.type} API</span>
                  </div>
                  <span className="text-xxs text-slate-400 font-mono">{disp.timestamp}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xxs font-semibold text-slate-400">
                    RECIPIENT: <span className="font-mono text-slate-200">{disp.recipient}</span>
                  </p>
                  <p className="font-sans leading-relaxed text-slate-300 whitespace-pre-wrap">{disp.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear Logs button */}
        {dispatches.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
            <span className="text-xs text-slate-400">{dispatches.length} alerts logged</span>
            <button
              onClick={clearDispatches}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1.5 rounded-md hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Terminal
            </button>
          </div>
        )}
      </div>
    </>
  );
}
