/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';
import Logo from './Logo';

interface WorkerTrackingPageProps {
  jobId: string;
}

// Standalone page opened by a WORKER on their phone via the WhatsApp/SMS
// link sent automatically once a client deposits escrow funds. No login is
// required — the job ID in the link is the only thing needed. While open,
// the browser's GPS is read continuously and sent to the server so the
// client and admin can see the worker's live position on their map.
export default function WorkerTrackingPage({ jobId }: WorkerTrackingPageProps) {
  const [job, setJob] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then((jobs: any[]) => {
        const found = jobs.find(j => j.id === jobId);
        setJob(found || null);
      })
      .catch(() => setError('Ntibishoboka gushaka amakuru y\'aka kazi.'));
  }, [jobId]);

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError('Iyi telefoni/browser ntibashoboye gukoresha GPS.');
      return;
    }
    setError(null);
    setIsSharing(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`/api/jobs/${jobId}/live-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, lng: longitude })
        })
          .then(r => {
            if (r.ok) setLastSentAt(new Date());
          })
          .catch(() => {});
      },
      () => {
        setError('Ntitwabashije kubona aho uri. Reba ko wemeye uruhushya rwa GPS (Location) kuri iyi browser.');
        setIsSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    watchIdRef.current = id;
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <Logo height={40} className="mb-6" />

      {!job ? (
        <p className="text-slate-400 text-sm">Turashaka amakuru y'aka kazi...</p>
      ) : (
        <div className="max-w-sm w-full space-y-5">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <p className="text-xxs uppercase tracking-widest text-emerald-400 font-bold mb-1">Ikiganza cy'akazi</p>
            <h1 className="text-lg font-bold">{job.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{job.location?.address}</p>
          </div>

          {error && (
            <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl p-3 flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isSharing ? (
            <button
              onClick={startSharing}
              className="w-full py-4 bg-blue-700 hover:bg-blue-800 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Tangira Kohereza Aho Ndi (GPS)
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Turohereza aho uri ako kanya...
                </div>
                {lastSentAt && (
                  <p className="text-xxs text-slate-400 mt-2">
                    Byoherejwe bwa nyuma: {lastSentAt.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                onClick={stopSharing}
                className="w-full py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-900 rounded-xl font-bold text-xs uppercase"
              >
                Hagarika Kohereza
              </button>
            </div>
          )}

          <div className="flex items-start gap-2 text-left text-xxs text-slate-500 pt-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-slate-600" />
            <span>Reka iyi paji ifunguye igihe ugiye ku kazi kugeza ukirangije, kugira ngo umukiriya na Admin babashe kukurikirana neza.</span>
          </div>
        </div>
      )}
    </div>
  );
}
