export type UserRole = 'artisan' | 'buyer' | 'artist' | 'customer';

export type BuyerBusinessType =
  | 'Retailer'
  | 'Distributor'
  | 'Hotel'
  | 'Corporate'
  | 'Exporter'
  | 'Other';

export interface BuyerProfile {
  id?: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: BuyerBusinessType | string;
  cityState: string;
  role: 'buyer';
  avatarUrl?: string;
  createdAt?: string;
}

export type PageTab =
  | 'role-selection'
  | 'customer-portal'
  | 'welcome'
  | 'onboarding'
  | 'auth'
  | 'dashboard'
  | 'profile'
  | 'previous-work'
  | 'catalog'
  | 'catalog-generator'
  | 'ai-catalog'
  | 'add-product'
  | 'orders'
  | 'requests'
  | 'messages'
  | 'earnings'
  | 'settings'
  | 'studio'
  | 'pricing'
  | 'products'
  | 'market'
  | 'b2b-marketplace'
  | 'b2b'
  | 'insights';

export type ProductStatus = 'draft' | 'ai_ready' | 'published';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ArtisanProfile {
  name: string;
  businessName: string;
  craftType: string;
  experienceYears: number;
  location: string;
  state: string;
  phone: string;
  email: string;
  preferredLanguage: LanguageCode;
  pehchanId: string;
  craftMarkVerified: boolean;
  avatarUrl: string;
  bio: string;
  bankAccountLinked: boolean;
  upiId: string;
  totalEarnings: number;
  role?: UserRole;
  specialization?: string;
  availableForCustomOrders?: boolean;
}

export type VerificationStatus =
  | 'Not Verified'
  | 'Artisan Confirmed'
  | 'Documents Submitted'
  | 'Officially Verified';

export interface PreviousWork {
  id: string;
  userId: string;
  title: string;
  craftType: string;
  description: string;
  materials: string[];
  imageUrl: string;
  yearCreated: number | string;
  price?: number;
  craftStory?: string;
  dimensions?: string;
  createdAt: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface CustomerRequest {
  id: string;
  artistId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAvatar?: string;
  customerLocation: string;
  title: string;
  description: string;
  referenceImages?: string[];
  budget: number;
  deliveryDateRequested: string;
  requestedAt: string;
  status: RequestStatus;
  rejectionReason?: string;
  linkedOrderId?: string;
  linkedConversationId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'artist' | 'customer';
  senderName: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  requestId: string;
  artistId: string;
  customerName: string;
  customerAvatar?: string;
  customerLocation?: string;
  artworkTitle: string;
  budget: number;
  status: 'active' | 'archived';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  messages: ChatMessage[];
}

export type OrderStatus =
  | 'requested'
  | 'accepted'
  | 'requirements_confirmed'
  | 'advance_pending'
  | 'advance_paid'
  | 'in_progress'
  | 'progress_update'
  | 'ready_for_delivery'
  | 'delivery_in_progress'
  | 'delivered'
  | 'final_payment'
  | 'completed';

export interface ArtworkProgressUpdate {
  id: string;
  stageTitle: string;
  description: string;
  imageUrl?: string;
  timestamp: string;
  completed: boolean;
}

export interface PaymentMilestone {
  id: string;
  title: string;
  amount: number;
  percentage: number;
  status: 'paid' | 'pending';
  paidAt?: string;
}

export interface DeliveryTracking {
  carrier?: string;
  trackingNumber?: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';
  shippedDate?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface CustomOrder {
  id: string;
  artistId: string;
  requestId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation: string;
  artworkTitle: string;
  craftType: string;
  description: string;
  referenceImages: string[];
  totalPrice: number;
  advanceAmount: number;
  deadlineDate: string;
  createdAt: string;
  status: OrderStatus;
  progressUpdates: ArtworkProgressUpdate[];
  paymentMilestones: PaymentMilestone[];
  deliveryTracking: DeliveryTracking;
}

export type StudioEnhanceMode =
  | 'AUTO_ENHANCE'
  | 'PRODUCT_CATALOG'
  | 'PREMIUM_STUDIO'
  | 'CRAFT_DETAIL'
  | 'SOCIAL_MEDIA';

export type StudioBgMode =
  | 'studio_white'
  | 'warm_wood'
  | 'craft_neutral'
  | 'light_beige'
  | 'transparent'
  | 'original';

export type StudioAspectRatio = 'original' | '1:1' | '4:5' | '3:4';

export interface StudioEnhancement {
  mode?: StudioEnhanceMode;
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  shadows?: number; // -50 to 50
  highlights?: number; // -50 to 50
  sharpness: number; // 0 to 50
  colorCorrection?: boolean;
  bgMode: StudioBgMode;
  isolateProduct?: boolean;
  naturalShadow?: boolean;
  aspectRatio?: StudioAspectRatio;
  autoFramed?: boolean;
  verificationStatus?: VerificationStatus;
}

export interface KalaStudioAnalysis {
  productType: string;
  category: string;
  colors: string[];
  material: string;
  technique: string;
  lightingQuality: string;
  backgroundQuality: string;
  compositionQuality: string;
  qualityScore: number;
  recommendations: string[];
  visibleDetails?: string[];
  productVisibility?: string;
  requiresConfirmation?: string[];
}

export interface KalaCatalogData {
  productTitleEnglish: string;
  productTitleHindi: string;

  shortDescriptionEnglish: string;
  shortDescriptionHindi: string;

  detailedDescriptionEnglish: string;
  detailedDescriptionHindi: string;

  category: string;
  material: string;
  craftTechnique: string;

  colors: string[];

  dimensions: {
    length: string;
    width: string;
    height: string;
  };

  weight: string;

  artisanStoryEnglish: string;
  artisanStoryHindi: string;

  keywordsEnglish: string[];
  keywordsHindi: string[];

  tags: string[];

  confidence: {
    product: number;
    material: number;
    technique: number;
  };

  status: 'AI_DRAFT' | 'ARTISAN_CONFIRMED';
}

export interface KalaCatalogVoiceOutput {
  detectedLanguage: string;
  extracted: {
    productName: string;
    category: string;
    material: string;
    craftTechnique: string;
    colors: string[];
    dimensions: string;
    usage: string;
    specialFeatures: string;
    artisanNotes: string;
  };
  hindi: {
    title: string;
    description: string;
  };
  english: {
    title: string;
    description: string;
  };
  seoKeywords: string[];
}

export interface PricingInputs {
  materialCost: number;
  labourRate: number;
  hoursRequired: number;
  labourHours?: number;
  packagingCost: number;
  shippingCost: number;
  additionalExpenses: number;
  otherCosts?: number;
  profitMargin: number;
  craftsmanshipFactor?: number;
  craftComplexity?: string;
  category?: string;
  productType?: string;
  material?: string;
  craftTechnique?: string;
}

export interface KalaPricingData {
  materialCost: number;
  labourRate: number;
  hoursRequired: number;
  packagingCost: number;
  shippingCost: number;
  additionalExpenses: number;
  profitMargin: number;

  labourCost: number;
  productionCost: number;
  basePrice: number;

  marketLow: number;
  marketMedian: number;
  marketHigh: number;

  costRecoveryPrice: number;
  recommendedPrice: number;
  premiumPrice: number;

  selectedPrice: number | null;
  selectedOption: 'cost_recovery' | 'recommended' | 'premium' | 'custom';

  benchmarkSource: string;
  status: 'DRAFT' | 'SAVED';

  craftAdjustment: number;
  confidence: 'High' | 'Medium' | 'Solid';
  explanationEnglish: string;
  explanationHindi: string;
  reasonsEnglish: string[];
  reasonsHindi: string[];
  isOutsideBenchmark?: boolean;
  benchmarkCategory?: string;
}

export interface KalaPricingResult {
  productionCost: number;
  recommendedPrice: number;
  minimumPrice: number;
  costRecoveryPrice?: number;
  premiumPrice: number;
  estimatedMargin: number;
  marketPosition: string;
  explanation: string;
  explanationHindi?: string;
  pricingData?: KalaPricingData;
  calculationSteps: {
    materialCost: number;
    labourCost: number;
    packagingCost: number;
    shippingCost: number;
    additionalExpenses: number;
    otherCosts: number;
    productionCost: number;
    baseSellingPrice: number;
    craftsmanshipAdjustment: number;
  };
  benchmark?: {
    category: string;
    productType: string;
    minPrice: number;
    medianPrice: number;
    maxPrice: number;
    sampleCount: number;
    source: string;
  };
}

export interface Product {
  id: string;
  artisanId?: string;
  userId?: string;
  title: string;
  titleHindi: string;
  category: string;
  craftType: string;
  description: string;
  descriptionHindi: string;
  materials: string[];
  material?: string;
  colors?: string[];
  dimensions: string;
  weight: string;
  careInstructions: string;
  careInstructionsHindi: string;
  keywords: string[];
  originalImage: string;
  image?: string;
  backgroundRemovedImage?: string;
  enhancedImage: string;
  originalImageUrl?: string;
  enhancedImageUrl?: string;
  selectedImageUrl?: string;
  imageAnalysis?: KalaStudioAnalysis | AIImageAnalysis;
  catalogData?: KalaCatalogVoiceOutput | AICatalogOutput;
  kalaCatalogData?: KalaCatalogData;
  pricingData?: KalaPricingResult;
  pricingInputs?: PricingInputs;
  imageStudioSettings?: StudioEnhancement;
  rawMaterialCost: number;
  labourHours: number;
  labourRatePerHour: number;
  otherCosts: number;
  profitMarginPercent: number;
  suggestedPrice: number;
  actualPrice: number;
  price?: number;
  retailPrice?: number;
  marketRangeMin: number;
  marketRangeMax: number;
  pricingReasoning: string;
  pricingReasoningHindi: string;
  status: ProductStatus;
  publishedToB2B?: boolean;
  createdAt: string;
  updatedAt?: string;
  inventory: number;
  stock?: number;
  viewsCount: number;
  salesCount: number;
  wholesaleMOQ: number;
  moq?: number;
  wholesalePrice: number;
  originRegion: string;
  verificationStatus?: VerificationStatus;
  
  // B2B Wholesale Marketplace fields
  isB2BListed?: boolean;
  b2bWholesalePrice?: number;
  b2bMOQ?: number;
  b2bStock?: number;
  b2bDeliveryDays?: number;
  b2bBuyerTypes?: string[];
  b2bDescription?: string;
  artisanName?: string;
  artisanLocation?: string;
}

export type B2BRequestStatus = 'New' | 'Viewed' | 'Offer Sent' | 'Accepted' | 'Rejected';

export interface B2BQuoteRequest {
  id: string;
  requestId: string;
  productId: string;
  productName: string;
  productImage?: string;
  category?: string;
  craftType?: string;
  artisanId?: string;
  artisanName?: string;
  artisanLocation?: string;
  buyerId?: string;
  buyerName: string;
  buyerOrg?: string;
  buyerLocation: string;
  quantity: number;
  targetPrice: number;
  deliveryLocation: string;
  requiredBy: string;
  message: string;
  status: B2BRequestStatus;
  createdAt: string;
  
  // Artisan Offer Fields
  offeredPrice?: number;
  offeredDeliveryDays?: number;
  artisanOfferMessage?: string;
  offeredAt?: string;
  rejectionReason?: string;
}

export interface BuyerInquiry {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerName: string;
  buyerOrg: string;
  buyerType: 'Retail Chain' | 'Export House' | 'Boutique Curator' | 'Government/ONDC' | 'Hotel Group';
  quantityRequested: number;
  offerPricePerUnit: number;
  message: string;
  receivedDate: string;
  status: 'new' | 'negotiating' | 'accepted' | 'declined';
  buyerLocation: string;
}

export interface AIImageAnalysis {
  productType: string;
  category: string;
  colors: string[];
  material: string;
  backgroundQuality: string;
  lightingQuality: string;
  compositionQuality: string;
  productVisibility?: string;
  ecommerceScore: number;
  qualityScore?: number;
  technique?: string;
  recommendations: string[];
}

export interface AICatalogConfidenceField {
  value: string;
  confidence: 'High' | 'Medium' | 'Low';
  exactDetail?: string;
}

export interface AICatalogOutput {
  productName: string;
  hindiName: string;
  category: string;
  englishDescription: string;
  hindiDescription: string;
  colors: string[];
  material: AICatalogConfidenceField;
  technique: AICatalogConfidenceField;
  keywords: string[];
  requiresConfirmation: string[];
  dimensions?: string;
  careInstructions?: string;
  careInstructionsHindi?: string;
  suggestedPrice?: number;
}

export interface ProductDraft {
  id?: string;
  title: string;
  titleHindi: string;
  category: string;
  craftType: string;
  description: string;
  descriptionHindi: string;
  materials: string[];
  material?: string;
  colors?: string[];
  dimensions: string;
  weight: string;
  careInstructions: string;
  careInstructionsHindi: string;
  keywords: string[];
  originalImage: string;
  backgroundRemovedImage?: string;
  enhancedImage: string;
  originalImageUrl?: string;
  enhancedImageUrl?: string;
  selectedImageUrl?: string;
  selectedImageChoice: 'original' | 'enhanced';
  imageAnalysis?: KalaStudioAnalysis | null;
  aiAnalysis?: AIImageAnalysis | null;
  aiCatalog?: AICatalogOutput | null;
  catalogData?: KalaCatalogVoiceOutput | null;
  kalaCatalogData?: KalaCatalogData | null;
  catalogStatus?: 'AI_DRAFT' | 'ARTISAN_CONFIRMED';
  pricingInputs?: PricingInputs;
  pricingData?: KalaPricingResult | null;
  studioSettings: StudioEnhancement;
  rawMaterialCost: number;
  labourHours: number;
  labourRatePerHour: number;
  otherCosts: number;
  profitMarginPercent: number;
  suggestedPrice: number;
  actualPrice: number;
  quantity: number;
  originRegion: string;
  verificationStatus?: VerificationStatus;
}

export interface InsightMetric {
  month: string;
  revenue: number;
  orders: number;
  views: number;
}
