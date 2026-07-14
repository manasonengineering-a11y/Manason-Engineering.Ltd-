/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserType, Product, Job, JobStatus, QuoteRequest, Message, ConsultancyRequest } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Manason Admin',
    email: 'manasonengineering@gmail.com',
    phone: '+250785647676',
    type: UserType.ADMIN,
    isVerified: true,
    idNumber: '1199080012345678',
    registrationDate: '2026-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    // Default password — CHANGE THIS IMMEDIATELY from Dashboard > Security after first login.
    password: 'Manason@2026!'
  },
  {
    id: 'u-client1',
    name: 'Kezia Kagabo',
    email: 'kezia@gmail.com',
    phone: '+250788123456',
    type: UserType.CLIENT,
    isVerified: true,
    idNumber: '1199580098765432',
    registrationDate: '2026-04-12',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-client2',
    name: 'Jean-Pierre Nkurunziza',
    email: 'jp@gmail.com',
    phone: '+250788345678',
    type: UserType.CLIENT,
    isVerified: true,
    idNumber: '1199280011223344',
    registrationDate: '2026-05-01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-worker1',
    name: 'Emmanuel Mugisha',
    email: 'emmanuel@gmail.com',
    phone: '+250788554433',
    type: UserType.TECHNICAL,
    isVerified: true,
    idNumber: '1198880011112222',
    registrationDate: '2026-02-15',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    skills: ['Masonry', 'Plastering', 'Bricklaying', 'Foundation Work'],
    experience: '8 Years',
    prices: '15,000 RWF / Day',
    availability: 'Available',
    certificates: ['IPRC Kigali Masonry Certificate A2', 'RDB Certified Technician'],
    specialty: 'Residential house foundations & structural bricklaying'
  },
  {
    id: 'u-worker2',
    name: 'Alice Mutoni',
    email: 'alice@gmail.com',
    phone: '+250788667788',
    type: UserType.TECHNICAL,
    isVerified: true,
    idNumber: '1199480033334444',
    registrationDate: '2026-03-20',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: ['Electrical Wiring', 'Solar Panel Installation', 'Lighting Design'],
    experience: '5 Years',
    prices: '18,000 RWF / Day',
    availability: 'Available',
    certificates: ['EWSA Electricity License Grade B', 'Kigali College of Tech Diploma'],
    specialty: 'Smart home electrical distribution & hybrid solar setups'
  },
  {
    id: 'u-worker3',
    name: 'Olivier Tuyisenge',
    email: 'olivier@gmail.com',
    phone: '+250789123456',
    type: UserType.HELPER,
    isVerified: true,
    idNumber: '1200080055556666',
    registrationDate: '2026-05-10',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['Concrete Mixing', 'Scaffolding Setup', 'Site Cleaning', 'Material Moving'],
    experience: '2 Years',
    prices: '6,000 RWF / Day',
    availability: 'Available',
    specialty: 'Hardworking concrete mixing and high-rise scaffolding assistance'
  },
  {
    id: 'u-company1',
    name: 'Kigali Builders Ltd',
    email: 'info@kigalibuilders.rw',
    phone: '+250788880000',
    type: UserType.COMPANY,
    isVerified: true,
    idNumber: 'RDB-100456722',
    registrationDate: '2025-11-01',
    avatarUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    companyName: 'Kigali Builders Ltd',
    address: 'KN 4 Ave, Nyarugenge, Kigali',
    skills: ['Commercial Building Construction', 'Road Paving', 'Structural Engineering', 'Interior Fit-out'],
    experience: '12 Years',
    prices: 'Project-based Quotation',
    availability: 'Available',
    certificates: ['RDB Grade A Contractor License', 'IEER Engineering Registration'],
    specialty: 'Turnkey commercial plazas and residential estate developments'
  },
  {
    id: 'u-group1',
    name: 'Musanze Co-op Masonry',
    email: 'musanzecoop@gmail.com',
    phone: '+250782334455',
    type: UserType.GROUP,
    isVerified: true,
    idNumber: 'COOP-2026-09',
    registrationDate: '2026-01-20',
    avatarUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
    skills: ['Traditional Stone Masonry', 'Volcanic Stone Facing', 'Heavy Foundations', 'Terracing'],
    experience: '6 Years',
    prices: 'Group-rate Negotiable',
    availability: 'Available',
    groupMembers: ['Jean Bosco Ndahimana (Head)', 'Paul Mutabazi', 'Theophile Nsengimana', 'Gaspar Habyarimana', 'Eric Nsanzimana'],
    specialty: 'Beautiful, durable volcanic stone wall design and ecological terracing'
  },
  {
    id: 'u-supplier1',
    name: 'Ameki Color Paints Rwanda',
    email: 'sales@amekicolor.rw',
    phone: '+250788311222',
    type: UserType.SUPPLIER,
    isVerified: true,
    idNumber: 'RDB-9844321',
    registrationDate: '2025-05-15',
    avatarUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=80',
    companyName: 'Ameki Color Paints',
    address: 'Gikondo Industrial Zone, Kigali',
    specialty: 'High-quality wall paints, thinners, varnishes made in Rwanda'
  },
  {
    id: 'u-manufacturer1',
    name: 'CIMERWA Cement Plc',
    email: 'sales@cimerwa.rw',
    phone: '+250788311555',
    type: UserType.MANUFACTURER,
    isVerified: true,
    idNumber: 'RDB-1002221',
    registrationDate: '2025-01-01',
    avatarUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=150&auto=format&fit=crop&q=80',
    companyName: 'CIMERWA Cement Plc',
    address: 'Bugarama, Rusizi District (Headquarters) / Kigali Depot',
    specialty: 'Rwanda’s leading manufacturer of high-strength Portland cement'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Cement
  {
    id: 'p1', supplierId: 'u-admin', supplierName: 'CIMERWA',
    name: 'CIMERWA 32.5N Portland Cement', category: 'Cement',
    description: 'High-quality standard cement manufactured in Rusizi, perfect for plastering, mortar, block making, and everyday structural applications.',
    price: 13500, isMadeInRwanda: true, imageUrl: '/src/assets/images/cement_bag_1783255567822.jpg', isPromotion: false
  },
  {
    id: 'p2', supplierId: 'u-admin', supplierName: 'Prime Cement Ltd',
    name: 'Prime Cement 42.5R High Strength Cement', category: 'Cement',
    description: 'Premium, rapid hardening cement designed for heavy-duty columns, multi-story building foundations, and high-strength concrete works.',
    price: 16500, isMadeInRwanda: true, imageUrl: '/src/assets/images/cement_bag_1783255567822.jpg', isPromotion: false
  },
  {
    id: 'p3', supplierId: 'u-admin', supplierName: 'PPC Rwanda',
    name: 'PPC SureBuild Cement (50kg)', category: 'Cement',
    description: 'General-purpose cement suitable for a wide range of construction applications, from residential to commercial projects.',
    price: 13800, isMadeInRwanda: true, imageUrl: '/src/assets/images/cement_bag_1783255567822.jpg', isPromotion: false
  },
  {
    id: 'p4', supplierId: 'u-admin', supplierName: 'Simba Cement Rwanda',
    name: 'Simba Cement Standard Portland Cement', category: 'Cement',
    description: 'Reliable everyday cement for foundations, mortar, and general masonry work.',
    price: 13600, isMadeInRwanda: true, imageUrl: '/src/assets/images/cement_bag_1783255567822.jpg', isPromotion: false
  },

  // Clay Bricks & Roof Tiles
  {
    id: 'p5', supplierId: 'u-admin', supplierName: 'Ruliba Clays Ltd',
    name: 'Ruliba Decorative Facing Bricks', category: 'Clay Bricks & Roof Tiles',
    description: 'Beautiful, red baked clay facing bricks produced locally in Kigali. Insulates and provides a timeless aesthetic without needing plaster.',
    price: 250, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p6', supplierId: 'u-admin', supplierName: 'Ruliba Clays Ltd',
    name: 'Ruliba Clay Roof Tiles', category: 'Clay Bricks & Roof Tiles',
    description: 'Durable, weather-resistant baked clay roof tiles manufactured locally for long-lasting roofing.',
    price: 850, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1622015663084-307d19eabca2?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Steel Products
  {
    id: 'p7', supplierId: 'u-admin', supplierName: 'SteelRwa',
    name: 'SteelRwa Deformed Reinforcement Bars (T12 - 12m)', category: 'Steel Products',
    description: 'High-tensile hot rolled steel bars manufactured locally for concrete column reinforcement, compliant with East African standards.',
    price: 11000, isMadeInRwanda: true, imageUrl: '/src/assets/images/construction_rebar_1783255580103.jpg', isPromotion: false
  },
  {
    id: 'p8', supplierId: 'u-admin', supplierName: 'Kigali Steel Ltd',
    name: 'Kigali Steel Structural I-Beams', category: 'Steel Products',
    description: 'Heavy-duty structural steel beams for commercial and industrial construction frameworks.',
    price: 85000, isMadeInRwanda: true, imageUrl: '/src/assets/images/construction_rebar_1783255580103.jpg', isPromotion: false
  },
  {
    id: 'p9', supplierId: 'u-admin', supplierName: 'Roofings Group Rwanda',
    name: 'Roofings Group Galvanized Steel Sheets', category: 'Steel Products',
    description: 'Corrosion-resistant galvanized steel sheeting for roofing and cladding applications.',
    price: 12500, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Concrete Blocks & Concrete Products
  {
    id: 'p10', supplierId: 'u-admin', supplierName: 'Gorilla Bricks Ltd',
    name: 'Gorilla Bricks Solid Concrete Blocks', category: 'Concrete Blocks & Concrete Products',
    description: 'Machine-pressed solid concrete blocks for durable, load-bearing wall construction.',
    price: 700, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p11', supplierId: 'u-admin', supplierName: 'Real Contractors Ltd',
    name: 'Real Contractors Interlocking Pavers', category: 'Concrete Blocks & Concrete Products',
    description: 'Precast concrete pavers ideal for driveways, walkways, and compound flooring.',
    price: 950, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1595397551849-01ee0b3e5df3?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p12', supplierId: 'u-admin', supplierName: 'Fair Construction Ltd',
    name: 'Fair Construction Precast Concrete Kerbstones', category: 'Concrete Blocks & Concrete Products',
    description: 'Durable precast kerbstones for road edging and landscaping projects.',
    price: 3500, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1595397551849-01ee0b3e5df3?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Ceramic Tiles
  {
    id: 'p13', supplierId: 'u-admin', supplierName: 'Rwanda Ceramics',
    name: 'Rwanda Ceramics Floor Tiles (60x60cm)', category: 'Ceramic Tiles',
    description: 'Locally manufactured, polished ceramic floor tiles suitable for residential and commercial interiors.',
    price: 8500, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Aluminium Windows & Doors
  {
    id: 'p14', supplierId: 'u-admin', supplierName: 'Rwanda Aluminium Ltd',
    name: 'Rwanda Aluminium Sliding Window Frames', category: 'Aluminium Windows & Doors',
    description: 'Custom-fabricated aluminium window frames with tempered glass options for modern buildings.',
    price: 65000, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p15', supplierId: 'u-admin', supplierName: 'HomeFix Rwanda',
    name: 'HomeFix Aluminium Door Frames', category: 'Aluminium Windows & Doors',
    description: 'Sturdy aluminium door framing systems for interior and exterior applications.',
    price: 78000, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Glass Products
  {
    id: 'p16', supplierId: 'u-admin', supplierName: 'Rwanda Glass Ltd',
    name: 'Rwanda Glass Tempered Safety Glass Panels', category: 'Glass Products',
    description: 'Tempered safety glass panels for windows, partitions, and balustrades.',
    price: 22000, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Granite & Natural Stone
  {
    id: 'p17', supplierId: 'u-admin', supplierName: 'East African Granite Industries',
    name: 'Polished Granite Countertop Slabs', category: 'Granite & Natural Stone',
    description: 'Premium polished granite slabs for kitchen countertops, staircases, and flooring.',
    price: 45000, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Paints
  {
    id: 'p18', supplierId: 'u-admin', supplierName: 'Master Paints Rwanda',
    name: 'Master Paints Premium Wall Acrylic (20L)', category: 'Paints',
    description: 'Highly durable weather-resistant acrylic paint made in Kigali, ideal for exterior or interior walls.',
    price: 45000, isMadeInRwanda: true, imageUrl: '/src/assets/images/paint_can_1783255556019.jpg', isPromotion: false
  },
  {
    id: 'p19', supplierId: 'u-admin', supplierName: 'Sadolin Paints Rwanda',
    name: 'Sadolin Wood Varnish (Clear - 5L)', category: 'Paints',
    description: 'Polyurethane protective clear varnish for premium finishing of doors and wooden structures.',
    price: 18500, isMadeInRwanda: true, imageUrl: '/src/assets/images/wood_varnish_1783255595649.jpg', isPromotion: false
  },

  // Waterproofing & Construction Chemicals
  {
    id: 'p20', supplierId: 'u-admin', supplierName: 'Sika Rwanda',
    name: 'Sika Waterproofing Membrane Compound', category: 'Waterproofing & Construction Chemicals',
    description: 'Professional-grade waterproofing compound for roofs, basements, and wet areas.',
    price: 32000, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // PVC Pipes & Plumbing
  {
    id: 'p21', supplierId: 'u-admin', supplierName: 'Polypipes Rwanda',
    name: 'Polypipes PVC Drainage Pipes (110mm)', category: 'PVC Pipes & Plumbing',
    description: 'Durable PVC piping for drainage and plumbing systems, made locally in Rwanda.',
    price: 8500, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p22', supplierId: 'u-admin', supplierName: 'Davis & Shirtliff Rwanda',
    name: 'Davis & Shirtliff Plumbing Fittings Kit', category: 'PVC Pipes & Plumbing',
    description: 'Complete plumbing fittings kit for residential and commercial water systems.',
    price: 25000, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Water Pumps
  {
    id: 'p23', supplierId: 'u-admin', supplierName: 'Davis & Shirtliff Rwanda',
    name: 'Davis & Shirtliff Submersible Water Pump', category: 'Water Pumps',
    description: 'Reliable submersible water pump for borehole and water supply installations.',
    price: 350000, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1621905252472-943afaa20e20?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Roofing Materials
  {
    id: 'p24', supplierId: 'u-admin', supplierName: 'Roofings Group Rwanda',
    name: 'Roofings Group Iron Sheets (IT4)', category: 'Roofing Materials',
    description: 'High-quality galvanized iron roofing sheets, weather-resistant and long-lasting.',
    price: 13500, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p25', supplierId: 'u-admin', supplierName: 'Trust Industries Rwanda',
    name: 'Trust Industries Roofing Nails & Fasteners', category: 'Roofing Materials',
    description: 'Corrosion-resistant fasteners and nails for secure roof sheet installation.',
    price: 4500, isMadeInRwanda: true, imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Construction Equipment
  {
    id: 'p26', supplierId: 'u-admin', supplierName: 'CFAO Mobility Rwanda',
    name: 'CFAO Concrete Mixer (Rental/Purchase)', category: 'Construction Equipment',
    description: 'Heavy-duty concrete mixer suitable for medium to large construction sites.',
    price: 1200000, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1541976590-713941681591?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },

  // Hardware & Building Materials
  {
    id: 'p27', supplierId: 'u-admin', supplierName: 'SP Rwanda',
    name: 'SP Rwanda General Hardware Toolkit', category: 'Hardware & Building Materials',
    description: 'Comprehensive hardware toolkit for general construction and finishing work.',
    price: 55000, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5b?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p28', supplierId: 'u-admin', supplierName: 'BAHO Hardware',
    name: 'BAHO Hardware Assorted Fasteners Pack', category: 'Hardware & Building Materials',
    description: 'Assorted nails, screws, and bolts for general construction use.',
    price: 8500, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5b?w=400&auto=format&fit=crop&q=80', isPromotion: false
  },
  {
    id: 'p29', supplierId: 'u-admin', supplierName: 'Century Hardware',
    name: 'Century Hardware Power Tools Set', category: 'Hardware & Building Materials',
    description: 'Set of essential power tools for construction and carpentry work.',
    price: 120000, isMadeInRwanda: false, imageUrl: 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5b?w=400&auto=format&fit=crop&q=80', isPromotion: false
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    clientId: 'u-client1',
    clientName: 'Kezia Kagabo',
    workerId: 'u-worker1',
    workerName: 'Emmanuel Mugisha',
    workerType: UserType.TECHNICAL,
    title: 'Living Room Wall Plastering & Foundation Repair',
    description: 'Plastering work for three partition walls and leveling a minor crack in the concrete foundation block of the front porch.',
    price: 150000, // 150,000 RWF
    status: JobStatus.WORKING,
    location: {
      lat: -1.9547,
      lng: 30.0824,
      address: 'KG 12 Ave, Remera, Kigali, Rwanda'
    },
    commission: 15000,
    progressUpdates: [
      {
        id: 'pu1-1',
        timestamp: '2026-07-04T10:00:00Z',
        comment: 'Arrived at site with mixing materials and tools. Began chipping out old plaster.'
      },
      {
        id: 'pu1-2',
        timestamp: '2026-07-04T15:00:00Z',
        comment: 'First coat of mortar applied to the main wall. Left to dry overnight.'
      }
    ],
    createdAt: '2026-07-03'
  },
  {
    id: 'j2',
    clientId: 'u-client2',
    clientName: 'Jean-Pierre Nkurunziza',
    workerId: 'u-worker2',
    workerName: 'Alice Mutoni',
    workerType: UserType.TECHNICAL,
    title: 'Commercial Shop Solar Backup Installation',
    description: 'Install a 3kVA hybrid inverter, 2x 150Ah Lithium batteries, and wire four emergency LED lighting channels for a mini-supermarket.',
    price: 450000, // 450,000 RWF
    status: JobStatus.COMPLETED,
    location: {
      lat: -1.9441,
      lng: 30.0619,
      address: 'KN 3 Rd, Nyarugenge Market, Kigali, Rwanda'
    },
    commission: 45000,
    progressUpdates: [
      {
        id: 'pu2-1',
        timestamp: '2026-07-02T09:00:00Z',
        comment: 'Secured inverter brackets to wall and completed battery DC wiring.'
      },
      {
        id: 'pu2-2',
        timestamp: '2026-07-02T16:00:00Z',
        comment: 'All AC outputs tested. Solar panels connected. Backup transition working in under 15ms. Done!'
      }
    ],
    createdAt: '2026-07-01'
  },
  {
    id: 'j3',
    clientId: 'u-client1',
    clientName: 'Kezia Kagabo',
    workerId: 'u-group1',
    workerName: 'Musanze Co-op Masonry',
    workerType: UserType.GROUP,
    title: 'Volcanic Stone Retaining Boundary Wall',
    description: 'Build a beautiful 15-meter long by 2-meter tall dry volcanic stone boundary wall to hold back the terraced soil on a sloped plot in Musanze.',
    price: 900000, // 900,000 RWF
    status: JobStatus.APPROVED,
    location: {
      lat: -1.5039,
      lng: 29.6341,
      address: 'Ruhengeri Sector, Musanze, Rwanda'
    },
    commission: 90000,
    progressUpdates: [
      {
        id: 'pu3-1',
        timestamp: '2026-06-25T08:00:00Z',
        comment: 'First 5 meters of concrete foundation poured.'
      },
      {
        id: 'pu3-2',
        timestamp: '2026-06-29T17:00:00Z',
        comment: 'All stone placement finished. Beautiful volcanic texture. Cleaned and ready for inspection.'
      }
    ],
    clientRating: 5,
    workerRating: 5,
    clientReviewComment: 'Absolutely magnificent work! The volcanic stone work is artistic and extremely robust. Highly recommend Musanze Co-op!',
    workerReviewComment: 'Excellent client. Kezia provided drinking water, prompt instructions, and funded escrow instantly.',
    createdAt: '2026-06-24'
  }
];

export const INITIAL_QUOTES: QuoteRequest[] = [
  {
    id: 'q1',
    clientId: 'u-client1',
    clientName: 'Kezia Kagabo',
    productId: 'p1',
    productName: 'CIMERWA 32.5N Portland Cement',
    supplierId: 'u-manufacturer1',
    supplierName: 'CIMERWA Cement Plc',
    details: 'Requesting 120 bags of CIMERWA 32.5N for a private villa foundation in Gahanga. Requesting bulk discount and transport options to the site.',
    isRepliedByAdmin: true,
    priceOfferedByAdmin: 12500, // Admin offered bulk price of 12,500 RWF instead of 13,500
    status: 'replied',
    createdAt: '2026-07-03'
  },
  {
    id: 'q2',
    clientId: 'u-client2',
    clientName: 'Jean-Pierre Nkurunziza',
    productId: 'p6',
    productName: 'Ruliba Decorative Facing Bricks',
    supplierId: 'u-admin', // admin managed or Ruliba directly
    supplierName: 'Ruliba Clays Ltd',
    details: 'Need 5,500 pieces of Red Facing bricks for a modern warehouse cladding in Prime Economic Zone, Masoro.',
    isRepliedByAdmin: false,
    status: 'pending',
    createdAt: '2026-07-04'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u-client1',
    senderName: 'Kezia Kagabo',
    receiverId: 'u-worker1',
    receiverName: 'Emmanuel Mugisha',
    content: 'Hello Emmanuel, I saw your profile and skills in plastering. Can you work on my residential project in Remera starting tomorrow?',
    timestamp: '2026-07-03T08:15:00Z',
    channel: 'chat'
  },
  {
    id: 'm2',
    senderId: 'u-worker1',
    senderName: 'Emmanuel Mugisha',
    receiverId: 'u-client1',
    receiverName: 'Kezia Kagabo',
    content: 'Hello Kezia! Yes, I am available and my rate is 15,000 RWF per day. Remera is close to my base. I can start tomorrow. Please register the contract details so I can accept.',
    timestamp: '2026-07-03T08:30:00Z',
    channel: 'chat'
  },
  {
    id: 'm3',
    senderId: 'u-client1',
    senderName: 'Kezia Kagabo',
    receiverId: 'u-worker1',
    receiverName: 'Emmanuel Mugisha',
    content: 'Perfect, I will set up the project on Manason Engineering and deposit 150,000 RWF into the Escrow account right away so we can begin.',
    timestamp: '2026-07-03T08:35:00Z',
    channel: 'chat'
  }
];

export const INITIAL_CONSULTANCY: ConsultancyRequest[] = [
  {
    id: 'c1',
    clientId: 'u-client2',
    clientName: 'Jean-Pierre Nkurunziza',
    type: 'architecture',
    details: 'I am planning to build a 3-story mixed-use commercial building in Gisenyi near the lake. I need a preliminary architectural plan and feasibility study regarding volcanic soil foundations.',
    budget: '2,500,000 RWF',
    phone: '+250788345678',
    email: 'jp@gmail.com',
    status: 'pending',
    createdAt: '2026-07-02'
  }
];
