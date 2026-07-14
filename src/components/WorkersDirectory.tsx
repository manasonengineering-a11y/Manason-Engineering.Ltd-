/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { User, UserType } from '../types';
import { Search, MapPin, CheckCircle, Clock, Award, Shield, UserCheck, Star, Sparkles, Compass } from 'lucide-react';

export default function WorkersDirectory() {
  const { users, currentUser, addJob, updateUserProfile, setIsAuthOpen } = useApp();
  const { t } = useLanguage();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  
  // Hiring Modal state
  const [hiringTarget, setHiringTarget] = useState<User | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobPrice, setJobPrice] = useState('');

  const toggleFavorite = async (workerId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const currentFavorites = currentUser.favorites || [];
    const isFav = currentFavorites.includes(workerId);
    let nextFavorites;
    if (isFav) {
      nextFavorites = currentFavorites.filter(id => id !== workerId);
    } else {
      nextFavorites = [...currentFavorites, workerId];
    }
    await updateUserProfile(currentUser.id, { favorites: nextFavorites });
  };

  const [userLat, setUserLat] = useState(-1.9547);
  const [userLng, setUserLng] = useState(30.0824);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [selectedWorkerOnMap, setSelectedWorkerOnMap] = useState<User | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const workerMarkersRef = useRef<Record<string, L.Marker>>({});
  const hireLocationMapRef = useRef<HTMLDivElement | null>(null);
  const hireLocationMapInstanceRef = useRef<L.Map | null>(null);
  const hireLocationMarkerRef = useRef<L.Marker | null>(null);

  const getWorkerCoordinates = (worker: User) => {
    let hash = 0;
    for (let i = 0; i < worker.id.length; i++) {
      hash = worker.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((hash & 0xFF) / 255) * 0.04 - 0.02;
    const lngOffset = (((hash >> 8) & 0xFF) / 255) * 0.04 - 0.02;

    let baseLat = -1.9547;
    let baseLng = 30.0824;

    const addr = (worker.address || '').toLowerCase();
    const nameStr = (worker.name || '').toLowerCase();
    
    if (addr.includes('musanze') || nameStr.includes('musanze')) {
      baseLat = -1.5039;
      baseLng = 29.6341;
    } else if (addr.includes('rubavu') || addr.includes('gisenyi')) {
      baseLat = -1.7019;
      baseLng = 29.2625;
    } else if (addr.includes('huye')) {
      baseLat = -2.5967;
      baseLng = 29.7405;
    } else if (addr.includes('kicukiro')) {
      baseLat = -1.9705;
      baseLng = 30.1044;
    } else if (addr.includes('nyarugenge')) {
      baseLat = -1.9441;
      baseLng = 30.0619;
    }

    return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
  };

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if (!navigator.geolocation) {
      alert(t('geolocationNotSupported'));
      setIsDetectingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setGpsSuccess(true);
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn("GPS failed, using Kigali default:", err);
        setUserLat(-1.9547);
        setUserLng(30.0824);
        setGpsSuccess(false);
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const [mapLocationText, setMapLocationText] = useState('KG 12 Ave, Remera, Kigali');
  const [mapCoordinates, setMapCoordinates] = useState({ lat: -1.9547, lng: 30.0824 });
  const [isHiredSuccess, setIsHiredSuccess] = useState(false);

  // Filter list to only show Workers, Technicals, Helpers, Companies, and Groups
  const allowedTypes = [
    UserType.TECHNICAL,
    UserType.HELPER,
    UserType.COMPANY,
    UserType.GROUP
  ];

  const workers = users.filter(u => {
    // Correct type
    if (!allowedTypes.includes(u.type)) return false;
    
    // Role filter
    if (selectedRole !== 'All' && u.type !== selectedRole) return false;

    // Search filter
    const lowerSearch = searchTerm.toLowerCase();
    const matchesName = u.name.toLowerCase().includes(lowerSearch);
    const matchesSpecialty = u.specialty?.toLowerCase().includes(lowerSearch);
    const matchesSkills = u.skills?.some(skill => skill.toLowerCase().includes(lowerSearch));
    const matchesAddress = u.address?.toLowerCase().includes(lowerSearch);

    return matchesName || matchesSpecialty || matchesSkills || matchesAddress;
  });

  // Initialize the real OpenStreetMap (Leaflet) map once, on mount.
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move / create the "your location" marker whenever GPS coordinates change.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const youIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;width:28px;height:28px;border-radius:9999px;background:#3b82f6;opacity:0.3;"></span>
        <span style="width:16px;height:16px;border-radius:9999px;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    } else {
      userMarkerRef.current = L.marker([userLat, userLng], { icon: youIcon, zIndexOffset: 1000 })
        .bindTooltip(t('yourLocationTooltip'), { permanent: false })
        .addTo(map);
    }
    map.setView([userLat, userLng], map.getZoom() || 13);
  }, [userLat, userLng]);

  // Sync worker markers with the current filtered worker list.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentIds = new Set(workers.map(w => w.id));

    // Remove markers for workers no longer in the filtered list.
    Object.keys(workerMarkersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        map.removeLayer(workerMarkersRef.current[id]);
        delete workerMarkersRef.current[id];
      }
    });

    workers.forEach(worker => {
      const coords = getWorkerCoordinates(worker);
      let color = '#3b82f6'; // blue - Technical
      if (worker.type === UserType.COMPANY) color = '#10b981'; // emerald
      if (worker.type === UserType.GROUP) color = '#a855f7'; // purple
      if (worker.type === UserType.HELPER) color = '#f59e0b'; // amber

      const isSelected = selectedWorkerOnMap?.id === worker.id;
      const icon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:${isSelected ? 'scale(1.3)' : 'scale(1)'};transition:transform .2s;">
          <div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);${isSelected ? 'outline:3px solid rgba(16,185,129,0.5);' : ''}"></div>
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      if (workerMarkersRef.current[worker.id]) {
        workerMarkersRef.current[worker.id]
          .setLatLng([coords.lat, coords.lng])
          .setIcon(icon);
      } else {
        const marker = L.marker([coords.lat, coords.lng], { icon })
          .bindTooltip(worker.name, { permanent: false })
          .on('click', () => setSelectedWorkerOnMap(worker))
          .addTo(map);
        workerMarkersRef.current[worker.id] = marker;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workers, selectedWorkerOnMap]);

  // Real Leaflet map inside the "Hire Now" modal, showing the selected job
  // site coordinates. Initializes when the modal opens, and re-centers
  // whenever the address text (and its derived coordinates) changes.
  useEffect(() => {
    if (!hiringTarget || !hireLocationMapRef.current) return;

    if (!hireLocationMapInstanceRef.current) {
      const map = L.map(hireLocationMapRef.current, {
        center: [mapCoordinates.lat, mapCoordinates.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      hireLocationMapInstanceRef.current = map;
    }

    const map = hireLocationMapInstanceRef.current;
    const icon = L.divIcon({
      className: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-50%);">
        <div style="width:16px;height:16px;border-radius:9999px;background:#e11d48;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>
      </div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 16]
    });

    if (hireLocationMarkerRef.current) {
      hireLocationMarkerRef.current.setLatLng([mapCoordinates.lat, mapCoordinates.lng]);
    } else {
      hireLocationMarkerRef.current = L.marker([mapCoordinates.lat, mapCoordinates.lng], { icon }).addTo(map);
    }
    map.setView([mapCoordinates.lat, mapCoordinates.lng], map.getZoom());

    // Leaflet needs a nudge to render correctly after appearing inside a
    // modal that was just mounted (container size wasn't known at init).
    setTimeout(() => map.invalidateSize(), 100);
  }, [hiringTarget, mapCoordinates.lat, mapCoordinates.lng]);

  // Clean up the hire modal's map instance when the modal closes.
  useEffect(() => {
    if (!hiringTarget && hireLocationMapInstanceRef.current) {
      hireLocationMapInstanceRef.current.remove();
      hireLocationMapInstanceRef.current = null;
      hireLocationMarkerRef.current = null;
    }
  }, [hiringTarget]);

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !hiringTarget) return;

    addJob({
      clientId: currentUser.id,
      clientName: currentUser.name,
      workerId: hiringTarget.id,
      workerName: hiringTarget.name,
      workerType: hiringTarget.type,
      title: jobTitle,
      description: jobDesc,
      price: Number(jobPrice),
      location: {
        lat: mapCoordinates.lat,
        lng: mapCoordinates.lng,
        address: mapLocationText
      }
    });

    setIsHiredSuccess(true);
    setTimeout(() => {
      setIsHiredSuccess(false);
      setHiringTarget(null);
      setJobTitle('');
      setJobDesc('');
      setJobPrice('');
    }, 2500);
  };

  const selectRandomKigaliCoords = (sector: string) => {
    let coords = { lat: -1.9547, lng: 30.0824 }; // Remera
    if (sector.includes('Kicukiro')) coords = { lat: -1.9705, lng: 30.1044 };
    if (sector.includes('Nyarugenge')) coords = { lat: -1.9441, lng: 30.0619 };
    if (sector.includes('Gasabo') || sector.includes('Kacyiru')) coords = { lat: -1.9352, lng: 30.0812 };
    if (sector.includes('Musanze')) coords = { lat: -1.5039, lng: 29.6341 };
    
    setMapCoordinates(coords);
  };

  const getAvailabilityLabel = (availability?: string) => {
    if (availability === 'Busy') return t('busyStatus');
    if (availability === 'Offline') return t('offlineStatus');
    return t('availableStatus');
  };

  return (
    <section id="workers-directory" className="py-12 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t('verifiedRwandaTalent')}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            {t('findWorkers')} / {t('companies')} / {t('groups')}
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            {t('workersDirectorySubtitle')}
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Role selector buttons */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {['All', UserType.TECHNICAL, UserType.HELPER, UserType.COMPANY, UserType.GROUP].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedRole === role
                    ? 'bg-blue-800 text-white border-blue-800 shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {role === 'All' ? t('all') : role}
              </button>
            ))}
          </div>
        </div>

        {/* Live OpenStreetMap — GPS Radar */}
        <div className="bg-slate-900 text-white rounded-3xl shadow-xl overflow-hidden mb-10 border border-slate-800">
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {t('gpsRadarTitle')}
                </h3>
              </div>
              <h4 className="text-xl font-bold mt-1 text-slate-100 font-sans">
                {t('interactiveNetworkTitle')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {t('gpsRadarSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
              >
                <Compass className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
                {isDetectingGps ? t('detectingGps') : gpsSuccess ? t('gpsActive') : t('detectMyLocation')}
              </button>

              <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                <button
                  onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                  title={t('zoomOut')}
                >
                  -
                </button>
                <span className="px-2 py-1.5 text-xxs font-mono text-slate-400 border-x border-slate-700 self-center">
                  OSM
                </span>
                <button
                  onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                  title={t('zoomIn')}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Real OpenStreetMap (Leaflet) — free, no API key required */}
            <div className="lg:col-span-2 h-[380px] bg-slate-950 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute top-3 left-3 z-[400] text-[10px] font-mono text-slate-200 bg-slate-950/80 px-2 py-1 rounded uppercase tracking-wider pointer-events-none">
                GPS: {userLat.toFixed(4)}N, {userLng.toFixed(4)}E
              </div>
            </div>

            {/* Selected Marker Detail Card */}
            <div className="p-6 bg-slate-950 flex flex-col justify-between h-[380px]">
              {selectedWorkerOnMap ? (
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={selectedWorkerOnMap.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={selectedWorkerOnMap.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{selectedWorkerOnMap.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mt-0.5">
                          {selectedWorkerOnMap.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block tracking-wider">
                          {t('specialtyLabel')}
                        </span>
                        <p className="font-semibold text-slate-200 mt-0.5">
                          {selectedWorkerOnMap.specialty || t('generalConstructionServices')}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block tracking-wider">
                          {t('distanceFromYou')}
                        </span>
                        <p className="font-mono text-slate-200 mt-0.5">
                          {getDistanceKm(
                            userLat,
                            userLng,
                            getWorkerCoordinates(selectedWorkerOnMap).lat,
                            getWorkerCoordinates(selectedWorkerOnMap).lng
                          ).toFixed(2)}{' '}
                          {t('kilometersUnit')}
                        </p>
                      </div>

                      {selectedWorkerOnMap.skills && (
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block tracking-wider mb-1">
                            {t('keySkills')}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedWorkerOnMap.skills.slice(0, 3).map(sk => (
                              <span key={sk} className="bg-slate-900 border border-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 flex gap-2">
                    <button
                      onClick={() => {
                        setHiringTarget(selectedWorkerOnMap);
                        setJobPrice(selectedWorkerOnMap.prices ? selectedWorkerOnMap.prices.replace(/[^0-9]/g, '') : '100000');
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      {t('hireNow')}
                    </button>
                    <button
                      onClick={() => setSelectedWorkerOnMap(null)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold"
                    >
                      {t('resetButton')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
                  <Compass className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
                  <h4 className="font-bold text-slate-400 text-sm">{t('noProfessionalSelected')}</h4>
                  <p className="text-xxs text-slate-500 max-w-xs mt-1.5">
                    {t('mapHintText')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center px-2 text-sm text-slate-500 font-medium">
          <span>{t('professionalsFoundCount').replace('{count}', String(workers.length))}</span>
          <span className="flex items-center gap-1 text-emerald-600 text-xs bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            <Shield className="w-3.5 h-3.5" /> {t('escrowInsured')}
          </span>
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 group hover:-translate-y-1"
            >
              
              {/* Card top banner/color depending on type */}
              <div className={`h-2 w-full ${
                worker.type === UserType.COMPANY ? 'bg-emerald-600' :
                worker.type === UserType.GROUP ? 'bg-purple-600' :
                worker.type === UserType.TECHNICAL ? 'bg-blue-600' : 'bg-amber-500'
              }`} />

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Avatar / Name / Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={worker.avatarUrl}
                      alt={worker.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shadow-sm bg-slate-100 border border-slate-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          worker.type === UserType.COMPANY ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          worker.type === UserType.GROUP ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                          worker.type === UserType.TECHNICAL ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {worker.type}
                        </span>
                        
                        {worker.isVerified && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                            <UserCheck className="w-3 h-3 text-blue-700" /> {t('verifiedBadge')}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-slate-900 text-base mt-1.5 group-hover:text-blue-800 transition-colors">
                        {worker.name}
                      </h3>

                      {worker.specialty && (
                        <p className="text-xs text-blue-800 font-semibold mt-1">
                          {worker.specialty}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills tags */}
                  {worker.skills && worker.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t('skills')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {worker.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {worker.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                            {t('moreSkillsCount').replace('{count}', String(worker.skills.length - 4))}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Credentials / Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">
                        {t('experience')}
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-blue-700" />
                        {worker.experience || t('verifiedRookie')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">
                        {t('expectedPrice')}
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {worker.prices || t('customQuote')}
                      </span>
                    </div>

                    {worker.certificates && worker.certificates.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">
                          {t('certificates')}
                        </span>
                        <span className="text-slate-700 truncate block font-medium mt-0.5">
                          {worker.certificates[0]}
                        </span>
                      </div>
                    )}

                    {worker.groupMembers && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">
                          {t('groupMembersLabel')}
                        </span>
                        <span className="text-slate-700 truncate block font-medium mt-0.5">
                          {worker.groupMembers.join(', ')}
                        </span>
                      </div>
                    )}

                    {worker.address && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">
                          {t('officeBaseLocation')}
                        </span>
                        <span className="text-slate-700 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {worker.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hire / Connect Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Availability badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      worker.availability === 'Available' ? 'bg-emerald-500 animate-pulse' :
                      worker.availability === 'Busy' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="text-xxs font-bold text-slate-500 uppercase tracking-wide">
                      {getAvailabilityLabel(worker.availability)}
                    </span>
                  </div>

                  {currentUser ? (
                    currentUser.id === worker.id ? (
                      <span className="text-xs text-slate-400 font-semibold italic">{t('yourProfile')}</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(worker.id)}
                          className={`p-2 rounded-lg border transition-all ${
                            (currentUser.favorites || []).includes(worker.id)
                              ? 'text-amber-500 border-amber-300 bg-amber-50/50'
                              : 'text-slate-400 border-slate-200 hover:text-amber-500 hover:bg-slate-50'
                          }`}
                          title={t('saveFavoriteWorker')}
                        >
                          <Star className={`w-4 h-4 ${(currentUser.favorites || []).includes(worker.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setHiringTarget(worker);
                            setJobPrice(worker.prices ? worker.prices.replace(/[^0-9]/g, '') : '100000');
                          }}
                          className="px-4 py-2 bg-blue-800 text-white rounded-lg font-bold text-xs hover:bg-blue-900 shadow-sm hover:shadow-md transition-all uppercase tracking-wide"
                        >
                          {t('hireNow')}
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-bold text-xs transition-all uppercase tracking-wide"
                    >
                      {t('loginToHire')}
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}

          {workers.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-lg">{t('noProfessionalsFound')}</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
                {t('noResultsHint')}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* HIRING ESCROW SETUP MODAL */}
      {hiringTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 uppercase">
                  {t('contractWithName').replace('{name}', hiringTarget.name)}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('escrowProtectionNote')}
                </p>
              </div>
              <button
                onClick={() => setHiringTarget(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {isHiredSuccess ? (
              <div className="p-8 text-center text-slate-800">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg">{t('escrowAgreementRegistered')}</h4>
                <p className="text-sm text-slate-500 mt-2">
                  {t('escrowAgreementRegisteredDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleHireSubmit} className="p-6 space-y-4">
                
                {/* Project Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    {t('jobContractTitle')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('jobTitlePlaceholder')}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    {t('scopeOfWork')}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={t('scopeOfWorkPlaceholder')}
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                {/* Contract Price / Budget */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    {t('escrowBudgetLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm font-bold">RWF</span>
                    <input
                      type="number"
                      required
                      placeholder={t('escrowBudgetPlaceholder')}
                      value={jobPrice}
                      onChange={(e) => setJobPrice(e.target.value)}
                      className="w-full pl-12 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-mono"
                    />
                  </div>
                  <p className="text-xxs text-slate-400 mt-1">
                    {t('commissionNote')}
                  </p>
                </div>

                {/* Site Maps Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    {t('siteLocationLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('siteLocationPlaceholder')}
                    value={mapLocationText}
                    onChange={(e) => {
                      setMapLocationText(e.target.value);
                      selectRandomKigaliCoords(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                  
                  {/* Real OpenStreetMap preview of the selected site coordinates */}
                  <div className="mt-2 h-28 rounded-lg border border-slate-200 overflow-hidden relative">
                    <div ref={hireLocationMapRef} className="w-full h-full" />
                    <div className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-500 uppercase bg-white/90 px-1.5 py-0.5 rounded z-[400] pointer-events-none">
                      GPS: {mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Submit Contract */}
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-bold text-sm tracking-wide uppercase shadow"
                >
                  {t('confirmSecureContract')}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
