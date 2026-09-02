import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIImageAnalysis, ProductDraft, StudioEnhancement, VerificationStatus } from '../types';
import { processStudioImage, StudioProcessResult } from '../utils/studioImageProcessor';
import { compressDataUrl } from '../utils/imageCompression';
import {
  backgroundRemovalService,
  BgColorOption,
  BackgroundRemovalResult,
} from '../services/backgroundRemovalService';

export interface ProductDraftContextType {
  draft: ProductDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProductDraft>>;
  updateDraft: (updates: Partial<ProductDraft>) => void;
  resetDraft: () => void;
  isAnalyzing: boolean;
  analysisError: string | null;
  analyzeImage: (imageSrc?: string) => Promise<AIImageAnalysis | null>;
  isRemovingBg: boolean;
  bgRemoveError: string | null;
  bgRemoveProgressText: string;
  bgRemovalDiagnostics: BackgroundRemovalResult | null;
  removeBackgroundLocally: (
    imageSrc?: string,
    onProgress?: (msg: string) => void
  ) => Promise<BackgroundRemovalResult | null>;
  isEnhancing: boolean;
  enhanceError: string | null;
  applySmartEnhance: (options?: {
    bgColor?: BgColorOption;
    aspectRatio?: '1:1' | 'original' | '4:5' | '3:4';
    brightness?: number;
    contrast?: number;
    sharpness?: number;
  }) => Promise<string | null>;
  applyEnhancement: (
    customSettings?: Partial<StudioEnhancement>,
    onStageProgress?: (stageIndex: number, stageName: string, detail: string) => void
  ) => Promise<StudioProcessResult | null>;
  generateCatalog: (params?: {
    voiceOrTextInput?: string;
    audioBase64?: string;
    audioMimeType?: string;
    inputLang?: string;
  }) => Promise<any>;
  hasUploadedImage: boolean;
  latestProcessResult: StudioProcessResult | null;
}

const DEFAULT_STUDIO_SETTINGS: StudioEnhancement = {
  brightness: 4,
  contrast: 3,
  shadows: 5,
  highlights: -2,
  sharpness: 5,
  colorCorrection: true,
  bgMode: 'studio_white',
  naturalShadow: true,
  aspectRatio: '1:1',
  autoFramed: true,
  verificationStatus: 'Not Verified',
};

const INITIAL_DRAFT: ProductDraft = {
  title: '',
  titleHindi: '',
  category: '',
  craftType: '',
  description: '',
  descriptionHindi: '',
  materials: [],
  dimensions: '',
  weight: '',
  careInstructions: 'Wipe gently with a soft dry cloth.',
  careInstructionsHindi: 'मुलायम सूखे कपड़े से धीरे से पोंछें।',
  keywords: [],
  originalImage: '',
  backgroundRemovedImage: '',
  enhancedImage: '',
  selectedImageChoice: 'original',
  aiAnalysis: null,
  aiCatalog: null,
  studioSettings: DEFAULT_STUDIO_SETTINGS,
  rawMaterialCost: 300,
  labourHours: 6,
  labourRatePerHour: 120,
  otherCosts: 80,
  profitMarginPercent: 35,
  suggestedPrice: 1485,
  actualPrice: 1485,
  quantity: 10,
  originRegion: '',
  verificationStatus: 'Not Verified',
};

const DRAFT_STORAGE_KEY = 'kalaconnect_active_product_draft';

const ProductDraftContext = createContext<ProductDraftContextType | undefined>(undefined);

export const ProductDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<ProductDraft>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not restore saved product draft:', e);
    }
    return INITIAL_DRAFT;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemoveError, setBgRemoveError] = useState<string | null>(null);
  const [bgRemoveProgressText, setBgRemoveProgressText] = useState<string>('');
  const [bgRemovalDiagnostics, setBgRemovalDiagnostics] = useState<BackgroundRemovalResult | null>(null);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [latestProcessResult, setLatestProcessResult] = useState<StudioProcessResult | null>(null);

  // Sync draft to local storage so navigation never causes data loss
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Draft local storage update warning:', e);
    }
  }, [draft]);

  const updateDraft = (updates: Partial<ProductDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const resetDraft = () => {
    setDraft(INITIAL_DRAFT);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  // Real server-side Gemini API image analysis strictly grounded in the uploaded photo
  const analyzeImage = async (imageSrc?: string): Promise<AIImageAnalysis | null> => {
    const targetImage = imageSrc || draft.originalImage;
    if (!targetImage) {
      setAnalysisError('Please upload a product image first.');
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const imageId = `img_${Date.now()}`;
    const productDraftId = draft.id || `draft_${Date.now()}`;

    try {
      // Ensure image is formatted cleanly
      const compressedImage = await compressDataUrl(targetImage, 1000, 0.8);

      const response = await fetch('/api/gemini/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: compressedImage,
          mimeType: 'image/jpeg',
          requestId,
          imageId,
          productDraftId,
        }),
      });

      if (!response.ok) {
        let errJson: any = null;
        try {
          errJson = await response.json();
        } catch (_) {}
        throw new Error(errJson?.error || 'Failed to analyze product photograph. Please try again.');
      }

      const data = await response.json();
      if (!data.success || !data.analysis) {
        throw new Error(data.error || 'No visual analysis could be generated for this photograph.');
      }

      const raw = data.analysis;
      const primaryMaterial =
        typeof raw.material === 'string'
          ? raw.material
          : raw.material?.value || 'Natural Eco Material';
      const primaryTechnique =
        typeof raw.technique === 'string'
          ? raw.technique
          : raw.technique?.value || '';

      const analysis: AIImageAnalysis = {
        productType: raw.productType || 'Handcrafted Product',
        category: raw.category || 'Handicrafts & Decor',
        colors: Array.isArray(raw.colors) ? raw.colors : ['Natural Tone'],
        material: primaryMaterial,
        backgroundQuality: raw.backgroundQuality || 'Standard background',
        lightingQuality: raw.lightingQuality || 'Ambient lighting',
        compositionQuality: raw.compositionQuality || 'Centered',
        productVisibility: raw.productVisibility || 'Clear',
        ecommerceScore: raw.ecommerceScore || 75,
        recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
      };

      // Set fresh product draft fields strictly based on the newly analyzed image
      setDraft((prev) => ({
        ...prev,
        aiAnalysis: analysis,
        title: raw.productType || prev.title,
        titleHindi: raw.hindiName || prev.titleHindi,
        category: raw.category || prev.category,
        craftType: primaryTechnique || prev.craftType,
        materials: [primaryMaterial],
        description: raw.description || prev.description,
        descriptionHindi: raw.descriptionHindi || prev.descriptionHindi,
        suggestedPrice: raw.suggestedPrice || prev.suggestedPrice,
        actualPrice: raw.suggestedPrice || prev.actualPrice,
        verificationStatus: 'Not Verified',
        keywords: [
          raw.productType,
          raw.category,
          primaryMaterial,
          ...(Array.isArray(raw.colors) ? raw.colors : []),
          'Handmade in India',
        ].filter(Boolean),
      }));

      return analysis;
    } catch (err: any) {
      console.error('Image analysis request failure:', err);
      const msg = err?.message || "Failed to analyze product photograph. Please try again.";
      setAnalysisError(msg);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 100% Local AI Background Removal using in-browser RMBG-1.4 model
  const removeBackgroundLocally = async (
    imageSrc?: string,
    onProgress?: (msg: string) => void
  ): Promise<BackgroundRemovalResult | null> => {
    const targetImage = imageSrc || draft.originalImage;
    if (!targetImage) {
      setBgRemoveError('Please upload a product photo first.');
      return null;
    }

    setIsRemovingBg(true);
    setBgRemoveError(null);
    setBgRemoveProgressText('Preparing AI Background Remover (RMBG-1.4)...');

    try {
      const progressHandler = (msg: string) => {
        setBgRemoveProgressText(msg);
        if (onProgress) onProgress(msg);
      };

      const result = await backgroundRemovalService.removeBackground(targetImage, progressHandler);
      setBgRemovalDiagnostics(result);

      // Update draft with transparent PNG background removed image
      setDraft((prev) => ({
        ...prev,
        backgroundRemovedImage: result.transparentDataUrl,
        // Also auto-generate initial enhanced preview on white if not already set
        enhancedImage: prev.enhancedImage || result.transparentDataUrl,
      }));

      return result;
    } catch (err: any) {
      console.error('Local background removal error:', err);
      const diagnostics = backgroundRemovalService.getLatestDiagnostics();
      if (diagnostics) {
        setBgRemovalDiagnostics(diagnostics);
      }
      const msg = err?.message || 'AI Background Removal failed.';
      setBgRemoveError(msg);
      return null;
    } finally {
      setIsRemovingBg(false);
      setBgRemoveProgressText('');
    }
  };

  // Smart Enhance: Apply genuine pixel adjustments (exposure, contrast, saturation, sharpening) on chosen background
  const applySmartEnhance = async (options?: {
    bgColor?: BgColorOption;
    aspectRatio?: '1:1' | 'original' | '4:5' | '3:4';
    brightness?: number;
    contrast?: number;
    sharpness?: number;
  }): Promise<string | null> => {
    const sourceImage = draft.backgroundRemovedImage || draft.originalImage;
    if (!sourceImage) {
      setEnhanceError('No image available to enhance.');
      return null;
    }

    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const enhancedUrl = await backgroundRemovalService.smartEnhance(sourceImage, {
        bgColor: options?.bgColor || 'white',
        aspectRatio: options?.aspectRatio || '1:1',
        brightness: options?.brightness ?? draft.studioSettings?.brightness ?? 6,
        contrast: options?.contrast ?? draft.studioSettings?.contrast ?? 7,
        sharpness: options?.sharpness ?? draft.studioSettings?.sharpness ?? 10,
      });

      setDraft((prev) => ({
        ...prev,
        enhancedImage: enhancedUrl,
        selectedImageChoice: 'enhanced',
      }));

      return enhancedUrl;
    } catch (err: any) {
      console.error('Smart enhance error:', err);
      setEnhanceError(err?.message || 'Smart enhance failed. Please try again.');
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  // AI image enhancement processing with local Browser Canvas pipeline
  const applyEnhancement = async (
    customSettings?: Partial<StudioEnhancement>,
    onStageProgress?: (stageIndex: number, stageName: string, detail: string) => void
  ): Promise<StudioProcessResult | null> => {
    if (!draft.originalImage) {
      setEnhanceError('No image available to enhance.');
      return null;
    }

    setIsEnhancing(true);
    setEnhanceError(null);

    const mergedSettings: StudioEnhancement = {
      ...draft.studioSettings,
      ...(customSettings || {}),
    };

    const bgMode = mergedSettings.bgMode || 'studio_white';
    const aspectRatio = mergedSettings.aspectRatio || '1:1';

    try {
      if (onStageProgress) {
        onStageProgress(1, 'Validation', 'Validating image resolution & color channels...');
      }

      // Use locally pre-segmented transparent image if available
      const transparentImageSource: string | undefined = draft.backgroundRemovedImage || undefined;

      if (onStageProgress) {
        onStageProgress(3, 'Local Canvas Pipeline', 'Applying pixel enhancements, balanced exposure, and centering...');
      }

      // Execute high-precision Browser Canvas image enhancement pipeline
      const localResult = await processStudioImage(draft.originalImage, {
        bgMode,
        aspectRatio,
        brightness: mergedSettings.brightness ?? 4,
        contrast: mergedSettings.contrast ?? 3,
        shadows: mergedSettings.shadows ?? 5,
        highlights: mergedSettings.highlights ?? -2,
        sharpness: mergedSettings.sharpness ?? 5,
        naturalShadow: mergedSettings.naturalShadow ?? true,
        autoFramed: mergedSettings.autoFramed ?? true,
        colorCorrection: mergedSettings.colorCorrection ?? true,
        transparentImageSource,
        onStageProgress: (idx, name, detail) => {
          if (onStageProgress) {
            onStageProgress(idx, name, detail);
          }
        },
      });

      setLatestProcessResult(localResult);
      setDraft((prev) => ({
        ...prev,
        enhancedImage: localResult.dataUrl,
        studioSettings: mergedSettings,
        selectedImageChoice: 'enhanced',
      }));

      return localResult;
    } catch (err: any) {
      console.error('Enhancement failure:', err);
      const errMsg = err?.message || 'Image enhancement failed. Please try again.';
      setEnhanceError(errMsg);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  // Multilingual vision & voice catalog generation via Gemini Free Tier with Strict Grounding
  const generateCatalog = async (params?: {
    voiceOrTextInput?: string;
    audioBase64?: string;
    audioMimeType?: string;
    inputLang?: string;
    analysisData?: any;
  }): Promise<any> => {
    try {
      const response = await fetch('/api/gemini/generate-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: draft.originalImage || draft.enhancedImage || undefined,
          analysisData: params?.analysisData || draft.aiAnalysis || draft.imageAnalysis || undefined,
          voiceOrTextInput: params?.voiceOrTextInput || '',
          audioBase64: params?.audioBase64,
          audioMimeType: params?.audioMimeType,
          inputLang: params?.inputLang || 'hi',
        }),
      });

      let data: any = null;
      try {
        const rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        console.warn('Could not parse generate-catalog response as JSON:', parseErr);
      }

      const catalog = data?.catalog;
      if (!catalog) {
        throw new Error(data?.error || 'Catalog generation could not be completed.');
      }

      const pName =
        catalog.productTitleEnglish ||
        catalog.english?.title ||
        catalog.extracted?.productName ||
        catalog.productName ||
        draft.title;

      const pNameHi =
        catalog.productTitleHindi ||
        catalog.hindi?.title ||
        catalog.hindiName ||
        draft.titleHindi;

      const pDesc =
        catalog.detailedDescriptionEnglish ||
        catalog.shortDescriptionEnglish ||
        catalog.english?.description ||
        catalog.englishDescription ||
        draft.description;

      const pDescHi =
        catalog.detailedDescriptionHindi ||
        catalog.shortDescriptionHindi ||
        catalog.hindi?.description ||
        catalog.hindiDescription ||
        draft.descriptionHindi;

      const pCategory = catalog.category || catalog.extracted?.category || draft.category;
      const pCraftType =
        catalog.craftTechnique ||
        catalog.extracted?.craftTechnique ||
        catalog.technique?.value ||
        draft.craftType;

      const pMaterials: string[] = [];
      if (catalog.material && typeof catalog.material === 'string' && !catalog.material.includes('Not specified')) {
        pMaterials.push(catalog.material);
      } else if (catalog.extracted?.material && catalog.extracted.material !== 'Not specified') {
        pMaterials.push(catalog.extracted.material);
      } else if (catalog.material?.value && !catalog.material.value.includes('Not provided')) {
        pMaterials.push(catalog.material.value);
      }
      if (Array.isArray(catalog.materials)) {
        catalog.materials.forEach((m: string) => {
          if (!pMaterials.includes(m)) pMaterials.push(m);
        });
      }

      const pDimensions =
        catalog.dimensions?.length && catalog.dimensions.length !== 'Not provided'
          ? `${catalog.dimensions.length} x ${catalog.dimensions.width || ''} x ${catalog.dimensions.height || ''}`.trim()
          : typeof catalog.dimensions === 'string' && !catalog.dimensions.includes('Not provided')
          ? catalog.dimensions
          : draft.dimensions;

      const pKeywords =
        catalog.keywordsEnglish ||
        catalog.seoKeywords ||
        catalog.keywords ||
        (pName ? [pName, pCategory, 'Handmade in India'] : []);

      setDraft((prev) => ({
        ...prev,
        aiCatalog: catalog,
        kalaCatalogData: catalog,
        catalogStatus: 'AI_DRAFT',
        title: pName || prev.title,
        titleHindi: pNameHi || prev.titleHindi,
        category: pCategory || prev.category,
        craftType: pCraftType || prev.craftType,
        description: pDesc || prev.description,
        descriptionHindi: pDescHi || prev.descriptionHindi,
        materials: pMaterials.length > 0 ? pMaterials : prev.materials,
        dimensions: pDimensions || prev.dimensions,
        keywords: pKeywords.length > 0 ? pKeywords : prev.keywords,
        verificationStatus: 'Not Verified', // Must never be automatically Verified
      }));

      return catalog;
    } catch (err) {
      console.error('generateCatalog error in draft context:', err);
      throw err;
    }
  };

  return (
    <ProductDraftContext.Provider
      value={{
        draft,
        setDraft,
        updateDraft,
        resetDraft,
        isAnalyzing,
        analysisError,
        analyzeImage,
        isRemovingBg,
        bgRemoveError,
        bgRemoveProgressText,
        bgRemovalDiagnostics,
        removeBackgroundLocally,
        isEnhancing,
        enhanceError,
        applySmartEnhance,
        applyEnhancement,
        generateCatalog,
        hasUploadedImage: Boolean(draft.originalImage),
        latestProcessResult,
      }}
    >
      {children}
    </ProductDraftContext.Provider>
  );
};

export const useProductDraft = (): ProductDraftContextType => {
  const context = useContext(ProductDraftContext);
  if (!context) {
    throw new Error('useProductDraft must be used within a ProductDraftProvider');
  }
  return context;
};
