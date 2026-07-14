/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useLanguage } from './LanguageContext';
import { UserType } from '../types';
import { X, Lock, Mail, Phone, Shield, FileText, Upload, Briefcase, DollarSign, Clock, Users, Building, HelpCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, uploadFile } = useApp();
  const { t } = useLanguage();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Primary Info fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserType>(UserType.CLIENT);
  const [password, setPassword] = useState('');
  
  // Profile avatar
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload a valid image file (PNG, JPG, or JPEG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Profile photos must be under 5MB.');
      return;
    }

    setError('');
    setIsUploadingAvatar(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const uploadedUrl = await uploadFile(file.name, file.type, base64String);
          setAvatarUrl(uploadedUrl);
          setIsUploadingAvatar(false);
        } catch (err: any) {
          setError(err.message || 'Failed to upload profile photo.');
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image file.');
      setIsUploadingAvatar(false);
    }
  };

  // Verification fields
  const [idType, setIdType] = useState<'National ID' | 'Passport'>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [idDocumentName, setIdDocumentName] = useState('');
  const [isUploadingIdDoc, setIsUploadingIdDoc] = useState(false);
  const [companyBrochureUrl, setCompanyBrochureUrl] = useState('');
  const [companyBrochureName, setCompanyBrochureName] = useState('');
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  const handleCompanyBrochureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      setError('Invalid file type. Please upload a PNG, JPG, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Brochures must be under 10MB.');
      return;
    }

    setError('');
    setIsUploadingBrochure(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const uploadedUrl = await uploadFile(file.name, file.type, base64String);
          setCompanyBrochureUrl(uploadedUrl);
          setCompanyBrochureName(file.name);
          setIsUploadingBrochure(false);
        } catch (err: any) {
          setError(err.message || 'Failed to upload brochure.');
          setIsUploadingBrochure(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to process brochure file.');
      setIsUploadingBrochure(false);
    }
  };

  const handleIdDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      setError('Invalid file type. Please upload a PNG, JPG, or PDF file.');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError('File size too large. ID documents must be under 4MB.');
      return;
    }

    setError('');
    setIsUploadingIdDoc(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const uploadedUrl = await uploadFile(file.name, file.type, base64String);
          setIdDocumentUrl(uploadedUrl);
          setIdDocumentName(file.name);
          setIsUploadingIdDoc(false);
        } catch (err: any) {
          setError(err.message || 'Failed to upload ID document.');
          setIsUploadingIdDoc(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process ID document.');
      setIsUploadingIdDoc(false);
    }
  };

  // Pro specific fields
  const [skillsText, setSkillsText] = useState('');
  const [experience, setExperience] = useState('');
  const [prices, setPrices] = useState('');
  const [availability, setAvailability] = useState<'Available' | 'Busy' | 'Unavailable'>('Available');
  const [certificates, setCertificates] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Group fields
  const [groupMembersText, setGroupMembersText] = useState('');

  // Company / Supplier fields
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email && !phone) {
      setError('Please provide email or phone number.');
      return;
    }

    const identifier = email || phone;
    try {
      const success = await login(identifier, password);
      if (success) {
        setSuccessMsg('Successfully logged in! Opening your dashboard...');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      } else {
        setError('No registered account found with that email or phone number.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSubmittingRegister) return; // Prevent double-submit from a fast double-click.

    if (!name || !email || !phone || !password || !idNumber) {
      setError('Please fill in all required primary fields and your ID/Passport number.');
      return;
    }

    // Role-specific validation
    if (userType === UserType.TECHNICAL || userType === UserType.HELPER) {
      if (!skillsText) {
        setError('Please list at least some of your skills.');
        return;
      }
    }

    if (userType === UserType.COMPANY && !companyName) {
      setError('Please provide your construction company name.');
      return;
    }

    if (userType === UserType.GROUP && !groupMembersText) {
      setError('Please provide a list of group members.');
      return;
    }

    // Every worker must upload a profile photo during registration
    if (userType !== UserType.CLIENT && !avatarUrl) {
      setError('Every worker, technical specialist, cooperative or company MUST upload a valid profile photo to register.');
      return;
    }

    const skills = skillsText ? skillsText.split(',').map(s => s.trim()) : undefined;
    const groupMembers = groupMembersText ? groupMembersText.split(',').map(m => m.trim()) : undefined;

    setIsSubmittingRegister(true);
    try {
      await register({
        name,
        email,
        phone,
        type: userType,
        idNumber,
        skills,
        experience: experience || undefined,
        prices: prices || undefined,
        availability,
        certificates: certificates ? [certificates] : undefined,
        specialty: specialty || undefined,
        groupMembers,
        companyName: companyName || undefined,
        address: address || undefined,
        avatarUrl: avatarUrl || undefined,
        idDocumentUrl: idDocumentUrl || undefined,
        companyBrochureUrl: companyBrochureUrl || undefined
      });

      setSuccessMsg(`Registration Successful! You are logged in as a ${userType}.`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register profile.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {isLoginMode ? 'MANASON SECURITY GATEWAY' : 'JOIN RWANDA’S PREMIUM BUILDERS'}
              </h2>
              <p className="text-xs text-slate-500">
                {isLoginMode ? 'Enter your credentials to access your dashboard' : 'Submit your identity details & credentials for verified access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info banners */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm border border-emerald-200 font-medium">
            {successMsg}
          </div>
        )}

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoginMode ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Email Address or Rwandan Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. manasonengineering@gmail.com or +250785647676"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setPhone(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-sm tracking-wide shadow-md transition-all uppercase"
              >
                Secure Login
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-6 text-slate-800">
              
              {/* Core User Settings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="font-bold text-sm text-blue-900 border-b pb-1">1. Primary Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jean Bosco Habimana"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">User Account Type</label>
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value as UserType)}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {Object.values(UserType)
                        .filter(type => type !== UserType.ADMIN)
                        .map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. bosco@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Rwandan Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +250788123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Choose Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Profile Photo Upload (Only for Workers) */}
                {userType !== UserType.CLIENT && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Professional Profile Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Uploaded avatar"
                          className="w-16 h-16 rounded-full object-cover border border-slate-300 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                          No Photo
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          id="avatar-upload-input"
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload-input"
                          className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-md text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isUploadingAvatar ? 'Uploading...' : 'Upload Profile Photo'}
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Required for professionals. Must be a clear portrait of you or your brand logo (PNG or JPG, Max 5MB).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Identity Verification Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="font-bold text-sm text-blue-900 border-b pb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  2. Government Identity Verification (Required for Escrow safety)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Verification Document</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="id_type"
                          checked={idType === 'National ID'}
                          onChange={() => setIdType('National ID')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        Rwanda National ID
                      </label>
                      <label className="flex items-center gap-1 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="id_type"
                          checked={idType === 'Passport'}
                          onChange={() => setIdType('Passport')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        International Passport
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {idType === 'National ID' ? 'National ID (16 Digits)' : 'Passport Number'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={idType === 'National ID' ? 'e.g. 1199580012345678' : 'e.g. PC987654'}
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Scan of ID Document</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleIdDocumentChange}
                    id="id-document-upload-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="id-document-upload-input"
                    className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors block"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">
                      {isUploadingIdDoc
                        ? 'Uploading...'
                        : idDocumentUrl
                          ? `✅ ${idDocumentName} Uploaded`
                          : 'Click to upload ID copy'}
                    </p>
                    <p className="text-xxs text-slate-400 mt-1">PNG, JPG or PDF (Max 4MB)</p>
                  </label>
                </div>
              </div>

              {/* PROFESSIONAL PROFILE SPECIFIC FIELDS */}
              {(userType === UserType.TECHNICAL || userType === UserType.HELPER) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="font-bold text-sm text-blue-900 border-b pb-1 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    3. Professional Construction Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Core Specialty / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Master Plasterer, Roof framing specialist"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Years of Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 5 Years"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Skills & Tools (Comma separated)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Concrete mixing, scaffolding, plastering, stone laying"
                        value={skillsText}
                        onChange={(e) => setSkillsText(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Requested Rates/Price (e.g. daily, hourly or contract-based)</label>
                      <input
                        type="text"
                        placeholder="e.g. 15,000 RWF / Day or 2,000 RWF / Hour"
                        value={prices}
                        onChange={(e) => setPrices(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Availability Status</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="Available">Available for Contracts</option>
                        <option value="Busy">Currently busy on work site</option>
                        <option value="Unavailable">Unavailable for hiring</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Certificates / Trade Licenses</label>
                      <input
                        type="text"
                        placeholder="e.g. IPRC Kigali Plumbing Certificate Level 3, RDB Card"
                        value={certificates}
                        onChange={(e) => setCertificates(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COOPERATIVE / GROUP FIELDS */}
              {userType === UserType.GROUP && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="font-bold text-sm text-blue-900 border-b pb-1 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    3. Cooperative / Group Details
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Registered Group Members (Comma separated names)</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Emmanuel Niyonkuru (Leader), Francois Nshimiye, Paul Mutabazi, Eric Tuyishime"
                      value={groupMembersText}
                      onChange={(e) => setGroupMembersText(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Group specialty</label>
                      <input
                        type="text"
                        placeholder="e.g. Heavy masonry, foundation steelworks, road terracing"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Rates range</label>
                      <input
                        type="text"
                        placeholder="e.g. 80,000 RWF / Day for full team"
                        value={prices}
                        onChange={(e) => setPrices(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COMPANY / SUPPLIER / MANUFACTURER FIELDS */}
              {(userType === UserType.COMPANY || userType === UserType.SUPPLIER || userType === UserType.MANUFACTURER) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="font-bold text-sm text-blue-900 border-b pb-1 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-600" />
                    3. Registered Corporate Entity Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Registered Business Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CIMERWA Cement Plc or Kigali Builders Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Physical Office Address</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KN 4 Ave, Gikondo Industrial Zone, Kigali"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Upload Product Catalogue or Corporate Brochure</label>
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      onChange={handleCompanyBrochureChange}
                      id="company-brochure-upload-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="company-brochure-upload-input"
                      className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors block"
                    >
                      <FileText className="w-8 h-8 text-slate-400 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-700">
                        {isUploadingBrochure
                          ? 'Uploading...'
                          : companyBrochureUrl
                            ? `✅ ${companyBrochureName} Uploaded`
                            : 'Attach Official Product Brochure / PDF'}
                      </p>
                      <p className="text-xxs text-slate-400 mt-0.5">Will appear on your public directory card</p>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingRegister}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm tracking-wide shadow-md transition-all uppercase"
              >
                {isSubmittingRegister ? 'Kohereza...' : 'Submit Professional Verification Registration'}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer toggler */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center text-xs">
          <span className="text-slate-500 mr-1.5">
            {isLoginMode ? 'New to Manason Engineering?' : 'Already have a secure account?'}
          </span>
          <button
            onClick={() => {
              setError('');
              setIsLoginMode(!isLoginMode);
            }}
            className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
          >
            {isLoginMode ? 'Register New Profile' : 'Access your dashboard (Login)'}
          </button>
        </div>

      </div>
    </div>
  );
}
