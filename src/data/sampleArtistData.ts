import { PreviousWork, CustomerRequest, CustomOrder, Conversation } from '../types';

export const SAMPLE_PREVIOUS_WORKS: PreviousWork[] = [
  {
    id: 'pw-001',
    userId: 'sample-artist',
    title: 'Royal Blue Ceramic Dinner Set (32 Pieces)',
    craftType: 'Jaipur Blue Pottery',
    description: 'Custom handcrafted dinnerware collection commissioned for heritage boutique resort in Udaipur. Features 24k gold leaf rim inlays and natural quartz glaze.',
    materials: ['Quartz Powder', 'Cobalt Oxide', 'Glass Slag', 'Gold Leaf Inlay'],
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    yearCreated: 2025,
    price: 38000,
    craftStory: 'Fired in traditional wood-burning kilns over 72 hours using GI-tagged Jaipur formulation.',
    dimensions: 'Serving Plates: 12", Bowls: 6", Platters: 16"',
    createdAt: '2025-11-12T10:00:00Z',
  },
  {
    id: 'pw-002',
    userId: 'sample-artist',
    title: 'Hand-Molded Terracotta Water Cascading Urn',
    craftType: 'Terracotta & Clay Art',
    description: 'Architectural garden fountain sculpture hand-burnished with natural river stones. Retains porous water cooling properties.',
    materials: ['Alluvial Clay', 'Natural Ochre Pigments', 'Riverbed Silt'],
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    yearCreated: 2025,
    price: 14500,
    craftStory: 'Crafted following 4th generation kumhar techniques honoring sacred earth traditions.',
    dimensions: '28" Height x 18" Diameter',
    createdAt: '2025-08-20T14:30:00Z',
  },
  {
    id: 'pw-003',
    userId: 'sample-artist',
    title: 'Cobalt Turquoise Floral Wall Hanging Tiles (Set of 9)',
    craftType: 'Jaipur Blue Pottery',
    description: 'Mosaic wall installation depicting traditional Rajasthani courtyard jharokha geometry with hand-painted peacock flora.',
    materials: ['Quartz Stone Powder', 'Natural Gum Resin', 'Fuller Earth'],
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    yearCreated: 2024,
    price: 22000,
    craftStory: 'Each tile is hand-pressed and individually brush-painted using squirrel hair brushes.',
    dimensions: 'Each tile: 8" x 8" (Total array: 24" x 24")',
    createdAt: '2024-12-05T09:15:00Z',
  },
];

export const SAMPLE_CUSTOMER_REQUESTS: CustomerRequest[] = [
  {
    id: 'req-101',
    artistId: 'sample-artist',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.sharma@gmail.com',
    customerPhone: '+91 98110 54321',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    customerLocation: 'Bengaluru, Karnataka',
    title: 'Custom 14-inch Blue Pottery Temple Puja Thali',
    description: 'Looking for an auspicious ceremonial thali with deep cobalt peacock glazes and 6 built-in diya grooves for our new home temple.',
    referenceImages: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'
    ],
    budget: 6500,
    deliveryDateRequested: '2026-09-25',
    requestedAt: '2026-08-29T11:20:00Z',
    status: 'pending',
  },
  {
    id: 'req-102',
    artistId: 'sample-artist',
    customerName: 'Vikramaditya Roy',
    customerEmail: 'vikram.roy@heritagehotels.in',
    customerPhone: '+91 99201 88776',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    customerLocation: 'New Delhi',
    title: 'Set of 4 Large Traditional Clay Planters for Heritage Hotel',
    description: 'We need four 20-inch weather-proof terracotta planters with engraved elephant and floral motifs for our hotel courtyard entrance.',
    referenceImages: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80'
    ],
    budget: 18000,
    deliveryDateRequested: '2026-10-10',
    requestedAt: '2026-08-28T16:45:00Z',
    status: 'accepted',
    linkedOrderId: 'ord-881',
    linkedConversationId: 'conv-881',
  },
  {
    id: 'req-103',
    artistId: 'sample-artist',
    customerName: 'Meera Iyer',
    customerEmail: 'meera.iyer@gmail.com',
    customerPhone: '+91 97401 22334',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    customerLocation: 'Chennai, Tamil Nadu',
    title: 'Custom Miniature Terracotta Temple Bells (Set of 12)',
    description: 'Bells needed with customized rustic earthy tint for wedding favor gift boxes.',
    budget: 4200,
    deliveryDateRequested: '2026-09-15',
    requestedAt: '2026-08-25T08:10:00Z',
    status: 'rejected',
    rejectionReason: 'Timeline too tight for proper kiln curing and safe shipping.',
  }
];

export const SAMPLE_ORDERS: CustomOrder[] = [
  {
    id: 'ord-881',
    artistId: 'sample-artist',
    requestId: 'req-102',
    orderNumber: 'KC-2026-881',
    customerName: 'Vikramaditya Roy',
    customerEmail: 'vikram.roy@heritagehotels.in',
    customerPhone: '+91 99201 88776',
    customerLocation: 'New Delhi, DL',
    artworkTitle: 'Set of 4 Large Traditional Clay Planters for Heritage Hotel',
    craftType: 'Traditional Terracotta',
    description: 'Four 20-inch weather-proof terracotta planters with engraved elephant and floral motifs for hotel courtyard entrance.',
    referenceImages: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80'
    ],
    totalPrice: 18000,
    advanceAmount: 4000,
    deadlineDate: '2026-10-10',
    createdAt: '2026-08-28T18:00:00Z',
    status: 'in_progress',
    progressUpdates: [
      {
        id: 'prog-1',
        stageTitle: 'Day 1: Raw Alluvial Clay Preparation & Wheel Turning',
        description: 'Selected fine riverbed clay and turned the four large 20-inch bases on the master potter wheel.',
        imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
        timestamp: '2026-08-29T10:00:00Z',
        completed: true,
      },
      {
        id: 'prog-2',
        stageTitle: 'Day 3: Elephant Motif Relief Carving by Hand',
        description: 'Engraved detailed heritage royal elephant motifs along the circumference before sun drying.',
        imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
        timestamp: '2026-08-30T15:30:00Z',
        completed: true,
      },
      {
        id: 'prog-3',
        stageTitle: 'Day 7: Kiln Firing & Natural Ochre Treatment',
        description: 'Prepared for traditional wood kiln baking at 900°C for weather-resistance.',
        timestamp: '2026-09-02T09:00:00Z',
        completed: false,
      }
    ],
    paymentMilestones: [
      { id: 'm-1', title: 'Advance Booking Token (20%)', amount: 3600, percentage: 20, status: 'paid', paidAt: '2026-08-28T18:15:00Z' },
      { id: 'm-2', title: 'Raw Clay Shaping & Carving (30%)', amount: 5400, percentage: 30, status: 'paid', paidAt: '2026-08-30T16:00:00Z' },
      { id: 'm-3', title: 'Kiln Firing & Quality Inspection (30%)', amount: 5400, percentage: 30, status: 'pending' },
      { id: 'm-4', title: 'Final Delivery & Acceptance (20%)', amount: 3600, percentage: 20, status: 'pending' },
    ],
    deliveryTracking: {
      carrier: 'India Post Speed Post / BlueDart Cargo',
      trackingNumber: 'KC-TRK-774921',
      status: 'in_progress',
      shippedDate: undefined,
      estimatedDelivery: '2026-10-10',
    }
  }
];

export const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-881',
    requestId: 'req-102',
    artistId: 'sample-artist',
    customerName: 'Vikramaditya Roy',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    customerLocation: 'New Delhi',
    artworkTitle: 'Set of 4 Large Traditional Clay Planters for Heritage Hotel',
    budget: 18000,
    status: 'active',
    lastMessage: 'Thank you Rameshwar ji! The wheel-turned shaping photos look exceptional.',
    lastMessageAt: '2026-08-30T17:10:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-1',
        senderId: 'sample-artist',
        senderRole: 'artist',
        senderName: 'Rameshwar Lal Kumhar',
        text: 'Namaste Vikramaditya ji. I have accepted your custom planter commission. I will craft these using high-durability clay suitable for outdoor gardens.',
        createdAt: '2026-08-28T18:05:00Z',
      },
      {
        id: 'msg-2',
        senderId: 'cust-102',
        senderRole: 'customer',
        senderName: 'Vikramaditya Roy',
        text: 'Wonderful! Please ensure the drainage holes at the bottom are at least 1.5 inches wide.',
        createdAt: '2026-08-28T18:20:00Z',
      },
      {
        id: 'msg-3',
        senderId: 'sample-artist',
        senderRole: 'artist',
        senderName: 'Rameshwar Lal Kumhar',
        text: 'Noted! I have just uploaded the Day 3 carving photos to the order progress tracker. The elephant reliefs came out very sharp.',
        createdAt: '2026-08-30T16:30:00Z',
      },
      {
        id: 'msg-4',
        senderId: 'cust-102',
        senderRole: 'customer',
        senderName: 'Vikramaditya Roy',
        text: 'Thank you Rameshwar ji! The wheel-turned shaping photos look exceptional.',
        createdAt: '2026-08-30T17:10:00Z',
      }
    ]
  }
];
