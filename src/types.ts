/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserType {
  ADMIN = 'Admin',
  CLIENT = 'Client',
  TECHNICAL = 'Technical',
  HELPER = 'Helper',
  COMPANY = 'Construction Company',
  GROUP = 'Construction Group',
  SUPPLIER = 'Supplier',
  MANUFACTURER = 'Manufacturer'
}

export enum JobStatus {
  PENDING = 'pending',
  ESCROW_DEPOSITED = 'escrow_deposited',
  TRAVELLING = 'travelling',
  ARRIVED = 'arrived',
  WORKING = 'working',
  COMPLETED = 'completed',
  CLIENT_APPROVED = 'client_approved', // Client confirmed the work is done; awaiting Admin review of reports before payout
  APPROVED = 'approved', // Admin confirmed reports & released payment to the worker
  DISPUTED = 'disputed'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  isVerified: boolean;
  idNumber: string; // National ID or Passport
  registrationDate: string;
  avatarUrl?: string;
  password?: string; // Never sent to the client by the server (stripped in API responses)
  
  // Professionals (Technical / Helper) & Companies / Groups
  skills?: string[];
  experience?: string; // e.g. "5 Years"
  prices?: string; // e.g. "15,000 RWF / Day" or "By Quote"
  availability?: 'Available' | 'Busy' | 'Unavailable';
  certificates?: string[];
  specialty?: string;
  idDocumentUrl?: string; // Uploaded scan/photo of National ID or Passport, for Admin verification
  companyBrochureUrl?: string; // Uploaded product catalogue/corporate brochure for Company/Supplier profiles
  
  // Groups
  groupMembers?: string[]; // list of names
  
  // Supplier / Manufacturer / Companies
  companyName?: string;
  address?: string;
  catalogueUrl?: string;
  favorites?: string[]; // Worker IDs saved as favorite
}

export interface ProgressUpdate {
  id: string;
  timestamp: string;
  comment: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  workerId: string;
  workerName: string;
  workerType: UserType;
  title: string;
  description: string;
  price: number; // in RWF
  status: JobStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  // Live GPS position broadcast by the worker's phone via the tracking link
  // sent once escrow is deposited. Updated periodically until job completion.
  // Manual payment confirmation: client uploads proof of an out-of-system
  // MoMo/PayPal transfer (PDF or screenshot), which Admin reviews before
  // confirming the deposit and unlocking the contract.
  paymentReceiptUrl?: string;
  paymentReceiptUploadedAt?: string;
  liveLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  commission: number; // 10%
  progressUpdates: ProgressUpdate[];
  clientRating?: number;
  workerRating?: number;
  clientReviewComment?: string;
  workerReviewComment?: string;
  createdAt: string;
}

export enum JobPostingStatus {
  OPEN = 'open',
  AWARDED = 'awarded',
  CLOSED = 'closed'
}

export interface JobOffer {
  id: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
  workerType: UserType;
  price: number;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface JobPosting {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  status: JobPostingStatus;
  offers: JobOffer[];
  createdAt: string;
  awardedJobId?: string; // links to the resulting Job (escrow contract) once an offer is accepted
}

export interface Product {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  category: string;
  description: string;
  price: number; // in RWF
  isMadeInRwanda: boolean;
  imageUrl: string;
  isPromotion: boolean;
  promoPrice?: number;
  promotionalText?: string;
}

export interface QuoteRequest {
  id: string;
  clientId: string;
  clientName: string;
  productId?: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  details: string;
  priceOfferedByAdmin?: number;
  isRepliedByAdmin: boolean;
  status: 'pending' | 'replied' | 'approved' | 'paid';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  channel: 'chat' | 'whatsapp' | 'sms' | 'email';
}

export interface ConsultancyRequest {
  id: string;
  clientId: string;
  clientName: string;
  type: 'architecture' | 'engineering' | 'quantity_surveying';
  details: string;
  budget: string;
  phone: string;
  email: string;
  status: 'pending' | 'assigned';
  assignedExpert?: string;
  reply?: string;
  createdAt: string;
}

export interface Brochure {
  id: string;
  name: string;
  category: string;
  size: string;
  downloadCount: number;
  updatedAt: string;
  fileUrl?: string;
}

export interface HomepagePromotion {
  id: string;
  title: string;
  text: string;
}

export interface HomepageSettings {
  announcement: string;
  bannerTitle: string;
  bannerSubtitle: string;
  promotions: HomepagePromotion[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  contractor: string;
  description: string;
  imageUrl: string;
}

export interface ClientRequest {
  id: string;
  type: 'contact' | 'consultancy' | 'hire' | 'quote';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  title: string;
  details: string;
  budget?: string;
  additionalInfo?: any;
  isRead: boolean;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}
