/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveJobMapProps {
  liveLocation?: { lat: number; lng: number; updatedAt: string };
  destination?: { lat: number; lng: number; address: string };
}

// Small embeddable OpenStreetMap showing a worker's last-known live GPS
// position (sent from their phone via the tracking link) alongside the job
// site destination. Used inside Admin and Client job detail views.
export default function LiveJobMap({ liveLocation, destination }: LiveJobMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const workerMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center = liveLocation || destination || { lat: -1.9547, lng: 30.0824 };
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !destination) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;border-radius:9999px;background:#e11d48;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    if (destMarkerRef.current) {
      destMarkerRef.current.setLatLng([destination.lat, destination.lng]);
    } else {
      destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon })
        .bindTooltip('Aho akazi kazakorerwa')
        .addTo(map);
    }
  }, [destination?.lat, destination?.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !liveLocation) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:24px;height:24px;border-radius:9999px;background:#3b82f6;opacity:0.35;"></span>
        <span style="width:14px;height:14px;border-radius:9999px;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    if (workerMarkerRef.current) {
      workerMarkerRef.current.setLatLng([liveLocation.lat, liveLocation.lng]);
    } else {
      workerMarkerRef.current = L.marker([liveLocation.lat, liveLocation.lng], { icon })
        .bindTooltip('Umukozi (GPS nyayo)')
        .addTo(map);
    }
    map.panTo([liveLocation.lat, liveLocation.lng]);
  }, [liveLocation?.lat, liveLocation?.lng]);

  const secondsAgo = liveLocation
    ? Math.round((Date.now() - new Date(liveLocation.updatedAt).getTime()) / 1000)
    : null;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <div ref={containerRef} className="w-full h-48 bg-slate-100" />
      <div className="px-3 py-1.5 bg-slate-900 text-white text-xxs flex items-center justify-between">
        {liveLocation ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS Nyayo Iraboneka
            </span>
            <span className="text-slate-400">
              {secondsAgo !== null && secondsAgo < 120 ? `${secondsAgo}s ashize` : 'Vuba aha'}
            </span>
          </>
        ) : (
          <span className="text-slate-400">Umukozi ntarahera link ya GPS</span>
        )}
      </div>
    </div>
  );
}
