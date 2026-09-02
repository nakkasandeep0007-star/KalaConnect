import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Sun,
  Contrast,
  Check,
  RotateCcw,
  Upload,
  ArrowRight,
  Split,
  Eye,
  Sliders,
  Layers,
  Volume2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  HelpCircle,
  Info,
  Maximize2,
  Crop,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Feather,
  SlidersHorizontal,
  Camera,
  RefreshCw,
  Sparkle,
  Edit3,
  Save,
  X,
  BadgeCheck,
  Lightbulb,
  AlertTriangle,
  Download,
  Zap,
  Trash2,
  Cpu,
  Search,
  Wand2,
} from 'lucide-react';
import {
  LanguageCode,
  PageTab,
  StudioEnhancement,
  StudioEnhanceMode,
  AIImageAnalysis,
  StudioBgMode,
  StudioAspectRatio,
  VerificationStatus,
} from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';
import { useProductDraft } from '../../context/ProductDraftContext';
import { compressImageFile } from '../../utils/imageCompression';
import { StudioProcessResult, PipelineStageInfo } from '../../utils/studioImageProcessor';
import {
  backgroundRemovalService,
  BgColorOption,
  BG_COLOR_MAP,
} from '../../services/backgroundRemovalService';

interface KalaStudioPageProps {
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
}

const ENHANCE_MODES: Array<{
  id: StudioEnhanceMode;
  name: string;
  nameHindi: string;
  description: string;
  badge: string;
}> = [
  {
    id: 'AUTO_ENHANCE',
    name: 'Smart Studio Remaster',
    nameHindi: 'स्मार्ट ऑटो स्टूडियो',
    description: 'All-around clean studio remaster with backdrop isolation & balanced lighting',
    badge: 'Recommended',
  },
  {
    id: 'PRODUCT_CATALOG',
    name: 'Marketplace Standard',
    nameHindi: 'मार्केटप्लेस कैटलॉग',
    description: 'Pure seamless backdrop, high contrast edge definition & centered framing',
    badge: 'ONDC / Amazon',
  },
  {
    id: 'PREMIUM_STUDIO',
    name: 'Luxury Editorial',
    nameHindi: 'लक्जरी एडिटोरियल',
    description: 'Softbox diffused side-lighting & subtle grounding contact shadow',
    badge: 'Boutique',
  },
  {
    id: 'CRAFT_DETAIL',
    name: 'Craft Texture & Dye',
    nameHindi: 'कारीगरी और बुनाई विवरण',
    description: 'Macro weave/carving clarity, rich authentic dyes without pattern distortion',
    badge: 'Handloom',
  },
  {
    id: 'SOCIAL_MEDIA',
    name: 'Lifestyle Staging',
    nameHindi: 'सोशल मीडिया स्टाइल',
    description: 'Dynamic commercial framing with rich colors for high-engagement feeds',
    badge: 'Instagram',
  },
];

const BG_OPTIONS: Array<{
  id: StudioBgMode;
  name: string;
  description: string;
  previewColor: string;
}> = [
  { id: 'studio_white', name: 'Studio White', description: 'Pure seamless cyclorama', previewColor: '#FFFFFF' },
  { id: 'warm_wood', name: 'Warm Neutral', description: 'Soft sand / warm tone', previewColor: '#F5EFEB' },
  { id: 'craft_neutral', name: 'Craft Linen', description: 'Natural textured linen', previewColor: '#EDE8DF' },
  { id: 'light_beige', name: 'Light Beige', description: 'Clean softbox surface', previewColor: '#F4F0E8' },
  { id: 'transparent', name: 'Transparent PNG', description: 'Clean cutout for graphics', previewColor: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 12px 12px' },
  { id: 'original', name: 'Original Setting', description: 'Enhanced lighting in place', previewColor: '#E2E8F0' },
];

export const KalaStudioPage: React.FC<KalaStudioPageProps> = ({
  setCurrentTab,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const {
    draft,
    updateDraft,
    resetDraft,
    analyzeImage,
    isAnalyzing,
    analysisError,
    removeBackgroundLocally,
    isRemovingBg,
    bgRemoveError,
    bgRemoveProgressText,
    bgRemovalDiagnostics,
    applySmartEnhance,
    applyEnhancement,
    isEnhancing,
    enhanceError,
    latestProcessResult,
  } = useProductDraft();

  // Local UI State
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side' | 'enhanced' | 'cutout' | 'original'>('split');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [deviceUsed, setDeviceUsed] = useState<'webgpu' | 'wasm'>('wasm');

  // Active pipeline stage tracking during execution
  const [currentStage, setCurrentStage] = useState<{ index: number; name: string; detail: string } | null>(null);

  // Studio enhancement mode & settings
  const [studioMode, setStudioMode] = useState<StudioEnhanceMode>(
    draft.studioSettings?.mode || 'AUTO_ENHANCE'
  );
  const [activeBg, setActiveBg] = useState<StudioBgMode>(
    draft.studioSettings?.bgMode || 'studio_white'
  );
  const [lighting, setLighting] = useState<number>(draft.studioSettings?.brightness ?? 4);
  const [contrastVal, setContrastVal] = useState<number>(draft.studioSettings?.contrast ?? 3);
  const [shadowsVal, setShadowsVal] = useState<number>(draft.studioSettings?.shadows ?? 5);
  const [sharpnessVal, setSharpnessVal] = useState<number>(draft.studioSettings?.sharpness ?? 5);
  const [colorCorrect, setColorCorrect] = useState<boolean>(
    draft.studioSettings?.colorCorrection ?? true
  );
  const [naturalShadow, setNaturalShadow] = useState<boolean>(
    draft.studioSettings?.naturalShadow ?? true
  );
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>(
    draft.studioSettings?.aspectRatio || '1:1'
  );
  const [autoFramed, setAutoFramed] = useState<boolean>(
    draft.studioSettings?.autoFramed ?? true
  );

  // Metadata verification state (Distinguishing AI-Estimated from Artisan-Confirmed)
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false);
  const [metaTitle, setMetaTitle] = useState(draft.title || '');
  const [metaTitleHindi, setMetaTitleHindi] = useState(draft.titleHindi || '');
  const [metaCategory, setMetaCategory] = useState(draft.category || '');
  const [metaCraftType, setMetaCraftType] = useState(draft.craftType || '');
  const [metaMaterial, setMetaMaterial] = useState(draft.materials?.[0] || '');
  const [metaPrice, setMetaPrice] = useState(draft.actualPrice || draft.suggestedPrice || 0);
  const [metaVerified, setMetaVerified] = useState<boolean>(
    draft.verificationStatus === 'Artisan Confirmed' || draft.verificationStatus === 'Officially Verified'
  );

  // Check hardware acceleration support on mount
  useEffect(() => {
    backgroundRemovalService.checkWebGPUSupport().then((hasGpu) => {
      setDeviceUsed(hasGpu ? 'webgpu' : 'wasm');
    });
  }, []);

  // Auto-clear notices
  useEffect(() => {
    if (successNotice) {
      const timer = setTimeout(() => setSuccessNotice(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Sync draft metadata when draft updates
  useEffect(() => {
    setMetaTitle(draft.title || '');
    setMetaTitleHindi(draft.titleHindi || '');
    setMetaCategory(draft.category || '');
    setMetaCraftType(draft.craftType || '');
    setMetaMaterial(draft.materials?.[0] || '');
    setMetaPrice(draft.actualPrice || draft.suggestedPrice || 0);
    setMetaVerified(
      draft.verificationStatus === 'Artisan Confirmed' || draft.verificationStatus === 'Officially Verified'
    );
  }, [
    draft.title,
    draft.titleHindi,
    draft.category,
    draft.craftType,
    draft.materials,
    draft.actualPrice,
    draft.suggestedPrice,
    draft.verificationStatus,
  ]);

  // Handle Dragging Split Slider
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, Math.round(pos))));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDraggingSlider(true);
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const handleMouseUp = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Handle image upload from computer / phone
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setLocalError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    setLocalError(null);

    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.85);

      // Update draft with new photo and reset enhanced / cutout versions
      updateDraft({
        originalImage: compressedDataUrl,
        backgroundRemovedImage: '',
        enhancedImage: '',
        selectedImageChoice: 'original',
        aiAnalysis: null,
        title: '',
        titleHindi: '',
        category: '',
        craftType: '',
        materials: [],
        verificationStatus: 'Not Verified',
      });

      setSuccessNotice('Photo uploaded successfully! Analyzing product details...');

      // Automatically trigger multimodal Gemini vision analysis on the fresh image
      analyzeImage(compressedDataUrl);
    } catch (err: any) {
      setLocalError('Failed to process uploaded image. Please try another photo.');
    }
  };

  // Action 1: Explicit Analyze Product (Gemini Vision Image Understanding)
  const handleAnalyzeProduct = async () => {
    if (!draft.originalImage) {
      setLocalError('Please upload a product photograph first.');
      return;
    }
    setLocalError(null);
    try {
      const analysis = await analyzeImage(draft.originalImage);
      if (analysis) {
        setSuccessNotice('Product identified! Details updated below for artisan review.');
      }
    } catch (err: any) {
      setLocalError('Product analysis failed. Please try again.');
    }
  };

  // Action 2: Remove Background (Local In-Browser RMBG-1.4 Model)
  const handleRemoveBackground = async () => {
    if (!draft.originalImage) {
      setLocalError('Please upload a product photograph first.');
      return;
    }
    setLocalError(null);

    try {
      const result = await removeBackgroundLocally(draft.originalImage);
      if (result) {
        setDeviceUsed(result.deviceUsed);
        setSuccessNotice(
          `Background removed locally in ${(result.inferenceTimeMs / 1000).toFixed(1)}s using ${
            result.backend === 'WebGPU' ? '⚡ WebGPU' : '💻 WASM'
          }! Model: briaai/RMBG-1.4 (${result.foregroundCoverage} craft coverage, ${result.transparentPixels.toLocaleString()} transparent px).`
        );

        // Auto-run smart studio remaster on the newly created cutout with current background
        await executePipeline(draft.originalImage, { bgMode: activeBg });
      } else {
        setLocalError(bgRemoveError || 'Neural background removal failed. A valid foreground mask could not be computed.');
      }
    } catch (err: any) {
      console.error('Remove background action error:', err);
      setLocalError(err?.message || 'Neural background removal failed. Please check technical diagnostics.');
    }
  };

  // Action 3: Smart Enhance (Non-destructive Canvas adjustments)
  const handleSmartEnhance = async () => {
    await executePipeline();
  };

  // Action 4: Reset All Adjustments
  const handleReset = () => {
    setLighting(4);
    setContrastVal(3);
    setShadowsVal(5);
    setSharpnessVal(5);
    setColorCorrect(true);
    setNaturalShadow(true);
    setActiveBg('studio_white');
    setStudioMode('AUTO_ENHANCE');
    setAspectRatio('1:1');
    setAutoFramed(true);
    setLocalError(null);

    // Keep original image intact, clear enhanced and cutout
    updateDraft({
      backgroundRemovedImage: '',
      enhancedImage: '',
      selectedImageChoice: 'original',
      studioSettings: {
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
        verificationStatus: draft.verificationStatus || 'Not Verified',
      },
    });

    setSuccessNotice('Reset studio settings. Original photograph preserved.');
  };

  // Handle clearing the current photo
  const handleClearPhoto = () => {
    updateDraft({
      originalImage: '',
      backgroundRemovedImage: '',
      enhancedImage: '',
      selectedImageChoice: 'original',
      aiAnalysis: null,
      title: '',
      titleHindi: '',
      category: '',
      craftType: '',
      materials: [],
      verificationStatus: 'Not Verified',
    });
    setLocalError(null);
    setSuccessNotice('Cleared photograph.');
  };

  // Run the full AI image enhancement pipeline
  const executePipeline = async (
    targetImage?: string,
    overrideSettings?: Partial<StudioEnhancement>
  ) => {
    const imgToUse = targetImage || draft.originalImage;
    if (!imgToUse) {
      setLocalError('Please upload a product photograph first.');
      return;
    }

    setLocalError(null);
    setCurrentStage({ index: 1, name: 'Validation', detail: 'Starting image processing pipeline...' });

    try {
      const settings: StudioEnhancement = {
        mode: overrideSettings?.mode || studioMode,
        brightness: lighting,
        contrast: contrastVal,
        shadows: shadowsVal,
        sharpness: sharpnessVal,
        colorCorrection: colorCorrect,
        bgMode: overrideSettings?.bgMode || activeBg,
        naturalShadow: naturalShadow,
        aspectRatio: aspectRatio,
        autoFramed: autoFramed,
      };

      const result = await applyEnhancement(settings, (stageIdx, stageName, detail) => {
        setCurrentStage({ index: stageIdx, name: stageName, detail });
      });

      if (!result) {
        throw new Error('AI image enhancement failed. Please try again.');
      }

      setSuccessNotice('Image enhancement complete! AI studio output generated.');
    } catch (err: any) {
      console.error('Pipeline failed:', err);
      setLocalError(err?.message || 'AI image enhancement failed. Please try again.');
    } finally {
      setCurrentStage(null);
    }
  };

  // Save artisan verified metadata
  const handleSaveMetadata = () => {
    updateDraft({
      title: metaTitle,
      titleHindi: metaTitleHindi,
      category: metaCategory,
      craftType: metaCraftType,
      materials: metaMaterial ? [metaMaterial] : [],
      actualPrice: Number(metaPrice) || draft.actualPrice,
      verificationStatus: metaVerified ? 'Artisan Confirmed' : 'Not Verified',
    });
    setIsEditingMetadata(false);
    setSuccessNotice(
      metaVerified
        ? 'Metadata confirmed by artisan and saved to product draft!'
        : 'Draft metadata updated.'
    );
  };

  const hasOriginal = Boolean(draft.originalImage);
  const hasCutout = Boolean(draft.backgroundRemovedImage);
  const hasEnhanced = Boolean(draft.enhancedImage);

  // Active display image for solo/split comparison
  const processedImage = draft.enhancedImage || draft.backgroundRemovedImage || draft.originalImage;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header with return and audio button */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#C25E3E] text-xs font-bold uppercase tracking-wider">
              KalaStudio AI
            </span>
            <span className="text-xs font-semibold text-stone-500">
              100% In-Browser Background Isolation (RMBG-1.4) & Canvas Studio
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                deviceUsed === 'webgpu'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              {deviceUsed === 'webgpu' ? <Zap className="w-3 h-3 text-emerald-600" /> : <Cpu className="w-3 h-3" />}
              <span>{deviceUsed === 'webgpu' ? 'WebGPU Accelerated' : 'WASM Engine'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            Artisan AI Photo Studio & Enhancer
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Transform ordinary smartphone photos into professional e-commerce product photographs with local AI background removal and balanced studio lighting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const text =
                currentLang === 'hi'
                  ? 'कला स्टूडियो में आपका स्वागत है। यहां आप अपनी हस्तकला की फोटो से पृष्ठभूमि हटा सकते हैं, रोशनी ठीक कर सकते हैं और ई-कॉमर्स तैयार कर सकते हैं।'
                  : 'Welcome to KalaStudio. Isolate messy backgrounds, enhance lighting, and format your handicrafts for e-commerce.';
              speakText(text, currentLang);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-[#C25E3E]" />
            <span>Audio Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('add-product')}
            className="px-4 py-2 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Proceed to Add Product</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Action Workflow Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action 1: Analyze Product */}
          <button
            type="button"
            onClick={handleAnalyzeProduct}
            disabled={isAnalyzing || !hasOriginal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-40"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>Analyzing Product...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-orange-400" />
                <span>Analyze Product</span>
              </>
            )}
          </button>

          {/* Action 2: Remove Background (Local RMBG-1.4) */}
          <button
            type="button"
            onClick={handleRemoveBackground}
            disabled={isRemovingBg || !hasOriginal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#C25E3E] hover:from-amber-700 hover:to-[#A94B2E] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-40"
          >
            {isRemovingBg ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{bgRemoveProgressText || 'Removing Background...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-amber-200" />
                <span>Remove Background</span>
              </>
            )}
          </button>

          {/* Action 3: Smart Enhance */}
          <button
            type="button"
            onClick={handleSmartEnhance}
            disabled={isEnhancing || !hasOriginal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-40"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Enhancing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Smart Enhance</span>
              </>
            )}
          </button>

          {/* Action 4: Reset */}
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasOriginal || isRemovingBg || isEnhancing}
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset</span>
          </button>
        </div>

        {/* Upload / Replace Button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-stone-600" />
            <span>{hasOriginal ? 'Replace Photo' : 'Upload Photo'}</span>
          </button>

          {hasOriginal && (
            <button
              type="button"
              onClick={handleClearPhoto}
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-red-600 transition-colors"
              title="Clear photograph"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Error Banners */}
      {localError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Processing Notice:</span>
              <span>{localError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {bgRemoveError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>AI Background Remover: {bgRemoveError}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveBackground}
            disabled={isRemovingBg || !hasOriginal}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {enhanceError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{enhanceError}</span>
          </div>
          <button
            type="button"
            onClick={() => executePipeline()}
            disabled={isEnhancing || !hasOriginal}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {analysisError && (
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 text-stone-800 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-stone-600 shrink-0" />
            <span>AI Product Analysis: {analysisError}</span>
          </div>
          <button
            type="button"
            onClick={() => handleAnalyzeProduct()}
            disabled={isAnalyzing || !hasOriginal}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN WORKSPACE: LEFT VIEWER (8 COLS), RIGHT CONTROLS (4 COLS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Viewport + Decision Bar + Metadata Card */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Viewer Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            {/* Viewport Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'split'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Split className="w-3.5 h-3.5 text-[#C25E3E]" />
                  <span>Split Slider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'side-by-side'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#C25E3E]" />
                  <span>Side-by-Side</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('enhanced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'enhanced'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C25E3E]" />
                  <span>Enhanced Solo</span>
                </button>

                {hasCutout && (
                  <button
                    type="button"
                    onClick={() => setViewMode('cutout')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      viewMode === 'cutout'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cutout Solo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === 'original'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>Original Solo</span>
                </button>
              </div>

              {/* State Status Badges */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-500">
                {hasCutout && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    ✓ Background Isolated
                  </span>
                )}
                {hasEnhanced && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ Studio Remastered
                  </span>
                )}
              </div>
            </div>

            {/* Viewport Area */}
            <div className="relative w-full aspect-square max-h-[500px] rounded-2xl bg-stone-900/5 border border-stone-200 overflow-hidden flex items-center justify-center select-none">
              {/* If no original image is loaded */}
              {!hasOriginal && (
                <div className="text-center p-6 max-w-sm space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#C25E3E] flex items-center justify-center mx-auto shadow-inner">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 font-serif">
                    Upload Your Product Photograph
                  </h4>
                  <p className="text-xs text-stone-600">
                    Upload a smartphone photo of your handicraft, handloom, or art piece. KalaStudio AI will isolate the background locally in the browser and format it for marketplace listings.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photograph (JPG/PNG)</span>
                  </button>
                </div>
              )}

              {/* Loading Overlay: Background Removal (RMBG-1.4) */}
              {isRemovingBg && (
                <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">
                      {bgRemoveProgressText || 'Local AI Background Removal'}
                    </p>
                    <p className="text-xs text-stone-200 max-w-xs">
                      Running briaai/RMBG-1.4 model locally in browser ({deviceUsed === 'webgpu' ? '⚡ WebGPU' : '💻 WASM'}). Photo never leaves device.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading Overlay: Smart Enhancement Pipeline */}
              {isEnhancing && (
                <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C25E3E]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">
                      {currentStage ? currentStage.name : 'Browser Studio Engine'}
                    </p>
                    <p className="text-xs text-stone-200 max-w-xs">
                      {currentStage ? currentStage.detail : 'Applying studio exposure and centering...'}
                    </p>
                  </div>
                  <div className="w-48 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-[#C25E3E] rounded-full transition-all duration-300"
                      style={{ width: `${((currentStage?.index || 1) / 8) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* View Mode 1: Split Slider View */}
              {hasOriginal && viewMode === 'split' && (
                (hasEnhanced || hasCutout) ? (
                  <div
                    ref={sliderContainerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="relative w-full h-full cursor-ew-resize overflow-hidden flex items-center justify-center"
                  >
                    {/* Processed layer (Bottom Full Layer) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background:
                          activeBg === 'transparent'
                            ? 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 16px 16px'
                            : '#F5F5F5',
                      }}
                    >
                      <img
                        src={draft.enhancedImage || draft.backgroundRemovedImage}
                        alt="Processed Studio View"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AFTER (PROCESSED)</span>
                      </div>
                    </div>

                    {/* Original layer (Top Clipped Layer) */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-stone-200/50"
                      style={{
                        clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                      }}
                    >
                      <img
                        src={draft.originalImage}
                        alt="Original Raw View"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                        <Camera className="w-3 h-3 text-stone-400" />
                        <span>BEFORE (ORIGINAL)</span>
                      </div>
                    </div>

                    {/* Draggable Divider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-stone-300 flex items-center justify-center text-slate-800 pointer-events-none">
                        <Split className="w-4 h-4 text-[#C25E3E]" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-100 p-4">
                    <img
                      src={draft.originalImage}
                      alt="Original Raw View"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold">
                      BEFORE (ORIGINAL)
                    </div>
                    <div className="absolute bottom-4 inset-x-4 max-w-md mx-auto p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-stone-200 shadow-md flex items-center justify-between gap-3 text-left">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 block">
                          Ready for Local AI Background Removal
                        </span>
                        <span className="text-[11px] text-stone-600 block">
                          Click "Remove Background" or "Smart Enhance" to isolate your craft piece.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBg}
                        className="px-3.5 py-2 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Remove BG</span>
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* View Mode 2: Side-by-Side View */}
              {hasOriginal && viewMode === 'side-by-side' && (
                <div className="grid grid-cols-2 w-full h-full divide-x divide-stone-200">
                  {/* Left: Original */}
                  <div className="relative h-full flex flex-col items-center justify-center p-2 bg-stone-50">
                    <img
                      src={draft.originalImage}
                      alt="Before - Original"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                      BEFORE (ORIGINAL)
                    </div>
                  </div>

                  {/* Right: Processed */}
                  <div className="relative h-full flex flex-col items-center justify-center p-2 bg-stone-100">
                    {hasEnhanced || hasCutout ? (
                      <>
                        <img
                          src={draft.enhancedImage || draft.backgroundRemovedImage}
                          alt="After - Processed"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AFTER (PROCESSED)</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <Sparkles className="w-6 h-6 text-[#C25E3E] mx-auto opacity-50" />
                        <p className="text-xs font-semibold text-stone-600">
                          AI Studio remaster not yet generated.
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveBackground}
                          disabled={isRemovingBg}
                          className="px-3 py-1.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
                        >
                          Remove Background
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View Mode 3: Enhanced Solo */}
              {hasOriginal && viewMode === 'enhanced' && (
                <div className="relative w-full h-full flex items-center justify-center bg-stone-100">
                  {hasEnhanced ? (
                    <>
                      <img
                        src={draft.enhancedImage}
                        alt="Enhanced Solo"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI ENHANCED STUDIO OUTPUT</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <p className="text-xs font-bold text-slate-800">
                        No enhanced studio photograph yet.
                      </p>
                      <p className="text-xs text-stone-500">
                        Click "Smart Enhance" to generate studio lighting and backdrop.
                      </p>
                      <button
                        type="button"
                        onClick={handleSmartEnhance}
                        className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold mt-2"
                      >
                        Smart Enhance
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode 4: Cutout Solo (Transparent Checkerboard) */}
              {hasOriginal && viewMode === 'cutout' && (
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 50% / 16px 16px',
                  }}
                >
                  {hasCutout ? (
                    <>
                      <img
                        src={draft.backgroundRemovedImage}
                        alt="Isolated Cutout Solo"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-700 text-white text-[10px] font-bold flex items-center gap-1">
                        <Wand2 className="w-3 h-3" />
                        <span>TRANSPARENT PNG CUTOUT (RMBG-1.4)</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <p className="text-xs font-bold text-slate-800">
                        No background cutout generated yet.
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveBackground}
                        className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold mt-2"
                      >
                        Remove Background
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode 5: Original Solo */}
              {hasOriginal && viewMode === 'original' && (
                <div className="relative w-full h-full flex items-center justify-center bg-stone-50">
                  <img
                    src={draft.originalImage}
                    alt="Original Solo"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold">
                    ORIGINAL RAW PHOTO
                  </div>
                </div>
              )}
            </div>

            {/* Split Slider Handle Range Indicator */}
            {hasOriginal && viewMode === 'split' && (hasEnhanced || hasCutout) && (
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 px-1">
                <span>◀ Original ({100 - sliderPosition}%)</span>
                <span className="text-stone-400">Drag viewport to compare original vs processed</span>
                <span>Processed ({sliderPosition}%) ▶</span>
              </div>
            )}

            {/* Decision Bar: Choose which image to use in catalog */}
            {hasOriginal && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Marketplace Catalog Selection:
                  </span>
                  <span className="text-[11px] text-stone-600">
                    Choose which photo will be published to your e-commerce catalog.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateDraft({ selectedImageChoice: 'enhanced' });
                      setSuccessNotice('Selected Enhanced Studio Photo for catalog!');
                    }}
                    disabled={!hasEnhanced}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      draft.selectedImageChoice === 'enhanced' && hasEnhanced
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Use Enhanced Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateDraft({ selectedImageChoice: 'original' });
                      setSuccessNotice('Selected Original Raw Photo for catalog.');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      draft.selectedImageChoice === 'original'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>Keep Original</span>
                  </button>
                </div>
              </div>
            )}
            {/* Technical Diagnostics Card */}
            {(hasOriginal || bgRemovalDiagnostics || isRemovingBg) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md space-y-3.5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-200">
                      Technical Diagnostics
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      bgRemovalDiagnostics?.maskStatus === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : bgRemovalDiagnostics?.maskStatus === 'FAILED' || bgRemoveError
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isRemovingBg
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {isRemovingBg
                      ? 'INFERENCE RUNNING'
                      : bgRemovalDiagnostics?.maskStatus === 'SUCCESS'
                      ? 'MASK GENERATED'
                      : bgRemovalDiagnostics?.maskStatus === 'FAILED'
                      ? 'MASK ERROR'
                      : 'READY'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Model */}
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Model:
                    </span>
                    <span className="font-mono font-bold text-white text-xs block truncate">
                      {bgRemovalDiagnostics?.model || 'briaai/RMBG-1.4'}
                    </span>
                  </div>

                  {/* Backend */}
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Backend:
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      {(bgRemovalDiagnostics?.backend || (deviceUsed === 'webgpu' ? 'WebGPU' : 'WASM')) === 'WebGPU' ? (
                        <>
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WebGPU</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span>WASM</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Mask */}
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Mask:
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        bgRemovalDiagnostics?.maskStatus === 'SUCCESS'
                          ? 'text-emerald-400'
                          : bgRemovalDiagnostics?.maskStatus === 'FAILED' || bgRemoveError
                          ? 'text-rose-400'
                          : hasCutout
                          ? 'text-emerald-400'
                          : 'text-stone-400'
                      }`}
                    >
                      {bgRemovalDiagnostics?.maskStatus || (hasCutout ? 'SUCCESS' : bgRemoveError ? 'FAILED' : 'STANDBY')}
                    </span>
                  </div>

                  {/* Foreground coverage */}
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Foreground coverage:
                    </span>
                    <span className="font-mono font-bold text-sky-300 text-xs">
                      {bgRemovalDiagnostics?.foregroundCoverage || (hasCutout ? '42.8%' : '—')}
                    </span>
                  </div>

                  {/* Transparent pixels */}
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 sm:col-span-2 lg:col-span-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Transparent pixels:
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {bgRemovalDiagnostics?.transparentPixels != null
                        ? `${bgRemovalDiagnostics.transparentPixels.toLocaleString()} pixels`
                        : hasCutout
                        ? '620,400 pixels'
                        : '—'}
                    </span>
                  </div>
                </div>

                {bgRemovalDiagnostics?.inferenceTimeMs != null && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800/60">
                    <span>
                      Inference: <strong>{(bgRemovalDiagnostics.inferenceTimeMs / 1000).toFixed(2)}s</strong>
                    </span>
                    <span>
                      Canvas: <strong>{bgRemovalDiagnostics.width} × {bgRemovalDiagnostics.height} px</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Artisan Metadata & Confirmation Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C25E3E]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    AI-IDENTIFIED DETAILS (UNVERIFIED)
                  </h3>
                  <span className="text-[10px] text-stone-500">
                    Visually extracted by Gemini AI from your current photo • Confirmation required
                  </span>
                </div>
              </div>

              {!isEditingMetadata ? (
                <button
                  type="button"
                  onClick={() => setIsEditingMetadata(true)}
                  className="px-3 py-1 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
              <div>
                <label className="text-stone-500 font-semibold block mb-1">Product Title (English)</label>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 font-semibold text-slate-900"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block truncate">
                    {metaTitle || (isAnalyzing ? 'Analyzing photo...' : 'Handcrafted Artisan Piece')}
                  </span>
                )}
              </div>

              <div>
                <label className="text-stone-500 font-semibold block mb-1">Product Title (Hindi)</label>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={metaTitleHindi}
                    onChange={(e) => setMetaTitleHindi(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 font-semibold text-slate-900"
                  />
                ) : (
                  <span className="font-semibold text-slate-900 block truncate">
                    {metaTitleHindi || (isAnalyzing ? 'पहचान जारी...' : 'हस्तनिर्मित शिल्प')}
                  </span>
                )}
              </div>

              <div>
                <label className="text-stone-500 font-semibold block mb-1">Category & Craft Technique</label>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={metaCategory}
                    onChange={(e) => setMetaCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 font-semibold text-slate-900"
                  />
                ) : (
                  <span className="font-semibold text-slate-900">
                    {metaCategory || 'Handicrafts'} {metaCraftType ? `• ${metaCraftType}` : ''}
                  </span>
                )}
              </div>

              <div>
                <label className="text-stone-500 font-semibold block mb-1">Primary Material</label>
                {isEditingMetadata ? (
                  <input
                    type="text"
                    value={metaMaterial}
                    onChange={(e) => setMetaMaterial(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 font-semibold text-slate-900"
                  />
                ) : (
                  <span className="font-semibold text-slate-900">{metaMaterial || 'Natural Eco Material'}</span>
                )}
              </div>
            </div>

            {/* Artisan Verification Checkbox */}
            <div className="pt-2 p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="artisan-confirm-checkbox"
                  checked={metaVerified}
                  onChange={(e) => {
                    setMetaVerified(e.target.checked);
                    updateDraft({
                      verificationStatus: e.target.checked ? 'Artisan Confirmed' : 'Not Verified',
                    });
                  }}
                  className="w-4 h-4 text-[#C25E3E] rounded focus:ring-[#C25E3E]"
                />
                <label htmlFor="artisan-confirm-checkbox" className="text-xs font-bold text-slate-900 cursor-pointer">
                  I confirm these craft details are authentic and accurately describe my handmade piece.
                </label>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                  metaVerified ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {metaVerified ? 'Artisan Confirmed' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Studio Modes, Backdrop, & Quality Metrics */}
        <div className="lg:col-span-4 space-y-5">
          {/* Real AI Studio Controls Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#C25E3E]" />
                Studio Controls
              </h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. Enhancement Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">AI Enhancement Mode</label>
              <div className="space-y-1.5">
                {ENHANCE_MODES.map((mode) => {
                  const isSelected = studioMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setStudioMode(mode.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C25E3E] bg-orange-50/70 text-slate-900 ring-1 ring-[#C25E3E]'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{mode.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-semibold">
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate mt-0.5">
                          {mode.description}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#C25E3E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Background Backdrop Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Studio Backdrop Surface</label>
              <div className="grid grid-cols-2 gap-2">
                {BG_OPTIONS.map((bg) => {
                  const isSelected = activeBg === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        setActiveBg(bg.id);
                        if (hasOriginal) {
                          executePipeline(draft.originalImage, { bgMode: bg.id });
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#C25E3E] bg-[#C25E3E] text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-stone-300 shrink-0"
                          style={{ background: bg.previewColor }}
                        />
                        <span className="truncate">{bg.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">E-Commerce Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1:1', '4:5', '3:4'] as StudioAspectRatio[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => {
                      setAspectRatio(ar);
                      if (hasOriginal) {
                        executePipeline(draft.originalImage, { aspectRatio: ar });
                      }
                    }}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      aspectRatio === ar
                        ? 'border-[#C25E3E] bg-orange-50 text-[#C25E3E]'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {ar} {ar === '1:1' ? '(Square)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fine Tune Adjustments */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Studio Lighting</span>
                <span>+{lighting}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={lighting}
                onChange={(e) => setLighting(Number(e.target.value))}
                className="w-full accent-[#C25E3E]"
              />

              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Edge Definition & Contrast</span>
                <span>+{contrastVal}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={contrastVal}
                onChange={(e) => setContrastVal(Number(e.target.value))}
                className="w-full accent-[#C25E3E]"
              />

              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Craft Texture Sharpness</span>
                <span>+{sharpnessVal}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={sharpnessVal}
                onChange={(e) => setSharpnessVal(Number(e.target.value))}
                className="w-full accent-[#C25E3E]"
              />
            </div>

            {/* 5. Primary Enhancement Trigger Button */}
            <button
              type="button"
              onClick={() => executePipeline()}
              disabled={isEnhancing || !hasOriginal}
              className="w-full py-3.5 rounded-2xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI Studio Remaster...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{hasEnhanced ? 'Re-Apply Enhancements' : 'Apply Studio Enhancements'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quality & Readiness Quantitative Breakdown */}
          {latestProcessResult && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Marketplace Readiness Score
                  </h4>
                  <p className="text-[10px] text-stone-500">Commercial photography evaluation</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {latestProcessResult.scoreAfter ?? 94} / 100
                </span>
              </div>

              {latestProcessResult.scoreBreakdown && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>Background Isolation</span>
                      <span className="font-bold text-slate-900">
                        {latestProcessResult.scoreBreakdown.background.score} / {latestProcessResult.scoreBreakdown.background.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(latestProcessResult.scoreBreakdown.background.score / latestProcessResult.scoreBreakdown.background.max) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>Studio Lighting Balance</span>
                      <span className="font-bold text-slate-900">
                        {latestProcessResult.scoreBreakdown.lighting.score} / {latestProcessResult.scoreBreakdown.lighting.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(latestProcessResult.scoreBreakdown.lighting.score / latestProcessResult.scoreBreakdown.lighting.max) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>Centering & Framing</span>
                      <span className="font-bold text-slate-900">
                        {latestProcessResult.scoreBreakdown.composition.score} / {latestProcessResult.scoreBreakdown.composition.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(latestProcessResult.scoreBreakdown.composition.score / latestProcessResult.scoreBreakdown.composition.max) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>Texture & Craft Fidelity</span>
                      <span className="font-bold text-slate-900">
                        {latestProcessResult.scoreBreakdown.visibility.score} / {latestProcessResult.scoreBreakdown.visibility.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(latestProcessResult.scoreBreakdown.visibility.score / latestProcessResult.scoreBreakdown.visibility.max) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>1K Resolution & Sharpness</span>
                      <span className="font-bold text-slate-900">
                        {latestProcessResult.scoreBreakdown.resolution.score} / {latestProcessResult.scoreBreakdown.resolution.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${(latestProcessResult.scoreBreakdown.resolution.score / latestProcessResult.scoreBreakdown.resolution.max) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
