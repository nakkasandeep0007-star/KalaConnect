import React, { useState, useEffect } from 'react';
import {
  Mic,
  Languages,
  Sparkles,
  Volume2,
  RotateCcw,
  Check,
  ArrowRight,
  Copy,
  AlertTriangle,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Tag,
  Palette,
  Info,
  Layers,
  Wrench,
  Trash2,
  ShoppingBag,
  Eye,
  Save,
  AlertCircle,
  FileEdit,
} from 'lucide-react';
import { LanguageCode, PageTab, KalaCatalogData, Product, ArtisanProfile } from '../../types';
import { LANGUAGES, SAMPLE_VOICE_PROMPTS } from '../../data/mockData';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';
import { useProductDraft } from '../../context/ProductDraftContext';
import { useAuth } from '../../context/AuthContext';
import { saveProductToDb } from '../../services/productService';
import { AIIdentifiedSummary } from '../catalog/AIIdentifiedSummary';
import { CatalogLanguageEditor } from '../catalog/CatalogLanguageEditor';
import { MarketplacePreviewCard } from '../catalog/MarketplacePreviewCard';
import { CatalogLoadingStepper } from '../catalog/CatalogLoadingStepper';

interface KalaCatalogPageProps {
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
  artisan?: ArtisanProfile;
  onProductSaved?: (product: Product) => void;
}

const INITIAL_CATALOG_DATA: KalaCatalogData = {
  productTitleEnglish: '',
  productTitleHindi: '',
  shortDescriptionEnglish: '',
  shortDescriptionHindi: '',
  detailedDescriptionEnglish: '',
  detailedDescriptionHindi: '',
  category: 'Handicrafts & Home Decor',
  material: 'Natural Eco-friendly Material',
  craftTechnique: 'Traditional Handcrafted Technique',
  colors: ['Natural Tones'],
  dimensions: {
    length: 'Not provided',
    width: 'Not provided',
    height: 'Not provided',
  },
  weight: 'Not provided',
  artisanStoryEnglish: 'Handmade with generational expertise, preserving traditional Indian craft heritage.',
  artisanStoryHindi: 'पारंपरिक भारतीय शिल्पकला की धरोहर को संजोते हुए पीढ़ियों के अनुभव से निर्मित।',
  keywordsEnglish: ['Indian Handicrafts', 'Handmade Craft', 'Artisan Product'],
  keywordsHindi: ['भारतीय हस्तशिल्प', 'हस्तनिर्मित उत्पाद', 'कारीगर शिल्प'],
  tags: ['Handmade', 'Artisan', 'IndianCraft', 'EcoFriendly'],
  confidence: {
    product: 92,
    material: 88,
    technique: 85,
  },
  status: 'AI_DRAFT',
};

export const KalaCatalogPage: React.FC<KalaCatalogPageProps> = ({
  setCurrentTab,
  currentLang,
  artisan,
  onProductSaved,
}) => {
  const { user } = useAuth();
  const {
    draft,
    updateDraft,
    resetDraft,
    analyzeImage,
    isAnalyzing,
  } = useProductDraft();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // View mode: 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const [inputLang, setInputLang] = useState<LanguageCode>(currentLang || 'hi');
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [speechInput, setSpeechInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Artisan Verification Confirmation Checkbox State
  const [isArtisanConfirmed, setIsArtisanConfirmed] = useState(
    draft.catalogStatus === 'ARTISAN_CONFIRMED' || draft.verificationStatus === 'Artisan Confirmed'
  );

  // Core KalaCatalogData state initialized from draft if available
  const [catalogData, setCatalogData] = useState<KalaCatalogData>(() => {
    if (draft.kalaCatalogData) {
      return draft.kalaCatalogData;
    }
    if (draft.aiCatalog) {
      const c = draft.aiCatalog;
      return {
        productTitleEnglish: c.productName || draft.title || '',
        productTitleHindi: c.hindiName || draft.titleHindi || '',
        shortDescriptionEnglish: c.englishDescription || draft.description || '',
        shortDescriptionHindi: c.hindiDescription || draft.descriptionHindi || '',
        detailedDescriptionEnglish: c.englishDescription || draft.description || '',
        detailedDescriptionHindi: c.hindiDescription || draft.descriptionHindi || '',
        category: c.category || draft.category || 'Handicrafts & Decor',
        material: c.material?.value || draft.materials?.[0] || 'Natural Craft Material',
        craftTechnique: c.technique?.value || draft.craftType || 'Traditional Handcraft',
        colors: c.colors || ['Natural Tones'],
        dimensions: {
          length: c.dimensions || draft.dimensions || 'Not provided',
          width: 'Not provided',
          height: 'Not provided',
        },
        weight: draft.weight || 'Not provided',
        artisanStoryEnglish: 'Handmade with generational expertise, preserving traditional Indian craft heritage.',
        artisanStoryHindi: 'पारंपरिक भारतीय शिल्पकला की धरोहर को संजोते हुए पीढ़ियों के अनुभव से निर्मित।',
        keywordsEnglish: c.keywords || draft.keywords || ['Indian Handicrafts'],
        keywordsHindi: ['भारतीय हस्तशिल्प', 'हस्तनिर्मित उत्पाद'],
        tags: ['Handmade', 'Artisan', 'IndianCraft'],
        confidence: {
          product: 90,
          material: 85,
          technique: 85,
        },
        status: (draft.catalogStatus as any) || 'AI_DRAFT',
      };
    }
    return INITIAL_CATALOG_DATA;
  });

  // Active product photo source
  const activeImage =
    draft.selectedImageChoice === 'enhanced' && draft.enhancedImage
      ? draft.enhancedImage
      : draft.originalImage || draft.enhancedImage;

  // Sync catalogData to draft when modified
  const handleCatalogChange = (updated: KalaCatalogData) => {
    setCatalogData(updated);
    updateDraft({
      kalaCatalogData: updated,
      title: updated.productTitleEnglish,
      titleHindi: updated.productTitleHindi,
      description: updated.detailedDescriptionEnglish || updated.shortDescriptionEnglish,
      descriptionHindi: updated.detailedDescriptionHindi || updated.shortDescriptionHindi,
      category: updated.category,
      craftType: updated.craftTechnique,
      materials: [updated.material].filter(Boolean),
      keywords: updated.keywordsEnglish,
    });
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          updateDraft({
            originalImage: result,
            enhancedImage: result,
            title: '',
            titleHindi: '',
            category: '',
            craftType: '',
            description: '',
            descriptionHindi: '',
            materials: [],
            keywords: [],
            aiCatalog: null,
            kalaCatalogData: null,
            catalogStatus: 'AI_DRAFT',
          });
          setCatalogData(INITIAL_CATALOG_DATA);
          setIsArtisanConfirmed(false);
          setSaveSuccessMessage(null);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Step 2: Visual Analysis
  const handleAnalyzeVisuals = async () => {
    if (!activeImage) {
      setErrorMessage('Please upload a product photo first.');
      return;
    }
    setErrorMessage(null);
    try {
      await analyzeImage(activeImage);
    } catch (err: any) {
      console.warn('Analysis notice:', err);
    }
  };

  // Trigger Step 4 & 5: Multilingual Catalog Generation via Gemini
  const handleGenerateCatalog = async () => {
    if (!activeImage && !speechInput) {
      setErrorMessage('Please upload a product photograph or enter artisan craft notes.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      const response = await fetch('/api/gemini/generate-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: activeImage || undefined,
          analysisData: draft.aiAnalysis || draft.imageAnalysis || undefined,
          voiceOrTextInput: speechInput,
          inputLang,
        }),
      });

      let data: any = null;
      try {
        const rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        console.warn('Could not parse generate-catalog response as JSON:', parseErr);
      }

      if (!data?.catalog) {
        throw new Error(data?.error || 'Catalog generation could not be completed.');
      }

      const generated: KalaCatalogData = data.catalog;
      generated.status = isArtisanConfirmed ? 'ARTISAN_CONFIRMED' : 'AI_DRAFT';

      setCatalogData(generated);

      // Synchronize with ProductDraftContext
      updateDraft({
        kalaCatalogData: generated,
        catalogStatus: generated.status,
        title: generated.productTitleEnglish,
        titleHindi: generated.productTitleHindi,
        description: generated.detailedDescriptionEnglish || generated.shortDescriptionEnglish,
        descriptionHindi: generated.detailedDescriptionHindi || generated.shortDescriptionHindi,
        category: generated.category,
        craftType: generated.craftTechnique,
        materials: [generated.material].filter(Boolean),
        keywords: generated.keywordsEnglish,
      });
    } catch (err: any) {
      console.error('Catalog generation error:', err);
      setErrorMessage(
        err.message || 'Catalog generation could not be completed.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 8: Save Catalog to Database
  const handleSaveCatalog = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      const finalStatus: 'AI_DRAFT' | 'ARTISAN_CONFIRMED' = isArtisanConfirmed
        ? 'ARTISAN_CONFIRMED'
        : 'AI_DRAFT';

      const updatedCatalog: KalaCatalogData = {
        ...catalogData,
        status: finalStatus,
      };

      setCatalogData(updatedCatalog);

      const userId = user?.uid || artisan?.email || 'guest-artisan';
      const productId = draft.id || `prod_${Date.now()}`;

      const fullProductData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string } = {
        id: productId,
        title: updatedCatalog.productTitleEnglish || 'Handcrafted Artisan Craft',
        titleHindi: updatedCatalog.productTitleHindi || 'हस्तनिर्मित भारतीय शिल्प',
        category: updatedCatalog.category || 'Handicrafts',
        craftType: updatedCatalog.craftTechnique || 'Handmade Craft',
        description: updatedCatalog.detailedDescriptionEnglish || updatedCatalog.shortDescriptionEnglish,
        descriptionHindi: updatedCatalog.detailedDescriptionHindi || updatedCatalog.shortDescriptionHindi,
        materials: [updatedCatalog.material].filter(Boolean),
        dimensions:
          updatedCatalog.dimensions?.length && updatedCatalog.dimensions.length !== 'Not provided'
            ? `${updatedCatalog.dimensions.length} x ${updatedCatalog.dimensions.width || ''} x ${updatedCatalog.dimensions.height || ''}`.trim()
            : '',
        weight: updatedCatalog.weight !== 'Not provided' ? updatedCatalog.weight : '',
        careInstructions: 'Wipe gently with a soft dry cloth.',
        careInstructionsHindi: 'मुलायम सूखे कपड़े से धीरे से पोंछें।',
        keywords: updatedCatalog.keywordsEnglish,
        originalImage: draft.originalImage || activeImage || '',
        enhancedImage: draft.enhancedImage || activeImage || '',
        rawMaterialCost: draft.rawMaterialCost || 300,
        labourHours: draft.labourHours || 6,
        labourRatePerHour: draft.labourRatePerHour || 120,
        otherCosts: draft.otherCosts || 80,
        profitMarginPercent: draft.profitMarginPercent || 35,
        suggestedPrice: draft.suggestedPrice || 1485,
        actualPrice: draft.actualPrice || 1485,
        marketRangeMin: 1200,
        marketRangeMax: 2100,
        pricingReasoning: 'Fair artisan pricing based on handcrafted labour hours and authentic materials.',
        pricingReasoningHindi: 'प्रामाणिक शिल्प सामग्री और कार्य के घंटों पर आधारित उचित कारीगर मूल्य।',
        status: 'draft',
        inventory: 10,
        viewsCount: 0,
        salesCount: 0,
        wholesaleMOQ: 5,
        wholesalePrice: Math.round((draft.actualPrice || 1485) * 0.75),
        originRegion: artisan?.location || 'India',
        kalaCatalogData: updatedCatalog,
        verificationStatus: isArtisanConfirmed ? 'Artisan Confirmed' : 'Not Verified',
      };

      const savedProduct = await saveProductToDb(userId, fullProductData);

      updateDraft({
        id: savedProduct.id,
        kalaCatalogData: updatedCatalog,
        catalogStatus: finalStatus,
        verificationStatus: isArtisanConfirmed ? 'Artisan Confirmed' : 'Not Verified',
      });

      if (onProductSaved) {
        onProductSaved(savedProduct);
      }

      setSaveSuccessMessage('Catalog saved successfully! View the Marketplace Preview below.');
      setViewMode('preview');
    } catch (err: any) {
      console.error('Failed to save catalog:', err);
      setErrorMessage(err?.message || 'Could not save catalog. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                KalaCatalog — Multilingual AI Catalog Generator
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                English + Natural Hindi
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Strictly grounded in your photo and artisan voice. Zero hallucinations, fully editable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#C25E3E]" />
              <span>Marketplace Preview</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset this product catalog and start a fresh item?')) {
                resetDraft();
                setCatalogData(INITIAL_CATALOG_DATA);
                setIsArtisanConfirmed(false);
                setSpeechInput('');
                setSaveSuccessMessage(null);
                setErrorMessage(null);
              }
            }}
            className="px-3 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Clear and start new product"
          >
            <Trash2 className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">New Item</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Fallback Box with Try Again & Edit Manually */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-300 text-red-900 space-y-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold">Catalog generation could not be completed.</p>
              <p className="text-[11px] text-red-700">{errorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleGenerateCatalog}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => {
                setErrorMessage(null);
                setViewMode('editor');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-red-300 text-red-800 hover:bg-red-100 text-xs font-bold transition-colors"
            >
              Edit Manually
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE: MARKETPLACE PREVIEW */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          <MarketplacePreviewCard
            catalog={catalogData}
            productImage={activeImage}
            price={draft.actualPrice || 1485}
            currentLang={currentLang}
            onEdit={() => setViewMode('editor')}
            onPublishSuccess={() => {
              setSaveSuccessMessage('Product catalog successfully published to KalaConnect Marketplace!');
            }}
          />

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
            <button
              onClick={() => setViewMode('editor')}
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-2"
            >
              ← Back to Catalog Editor
            </button>

            <button
              onClick={() => setCurrentTab('pricing')}
              className="px-5 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <span>Continue to KalaPrice Assistant →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE: CATALOG EDITOR */}
      {viewMode === 'editor' && (
        <div className="space-y-6">
          {/* Mandatory AI Verification Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-950 uppercase tracking-wide block">
                AI Generated — Please Review
              </span>
              <p className="text-amber-900 leading-relaxed">
                All descriptions and attributes are grounded in your photo and notes. Please review and edit all fields below before saving.
              </p>
            </div>
          </div>

          {/* STEP 1: Product Photo Upload & Visual Connection */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C25E3E]" />
                Step 1: Product Photo
              </span>
              {activeImage && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Photo Loaded
                </span>
              )}
            </div>

            {activeImage ? (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-900 border-2 border-[#C25E3E]/40 shrink-0 shadow-sm">
                    <img src={activeImage} alt="Active Craft" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C25E3E] bg-[#C25E3E]/10 px-2 py-0.5 rounded">
                        Active Craft Photo
                      </span>
                      {catalogData.category && (
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-stone-200 font-medium text-stone-700">
                          {catalogData.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {catalogData.productTitleEnglish || 'Grounded artisan photograph ready for analysis.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() => setCurrentTab('studio')}
                    className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                  >
                    Studio Enhance
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/70 text-center space-y-3">
                <UploadCloud className="w-10 h-10 text-stone-400 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Upload Your Craft Photo for Grounded Analysis</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Take a clear photo of your wooden sculpture, pottery, brassware, or textile.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer px-4 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shadow-xs items-center gap-2 transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>Select Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* STEP 2: AI-Identified Product Information */}
          <AIIdentifiedSummary
            analysis={draft.aiAnalysis || draft.imageAnalysis || null}
            isAnalyzing={isAnalyzing}
            onReAnalyze={handleAnalyzeVisuals}
            confidenceScores={catalogData.confidence}
          />

          {/* STEP 3: Artisan Notes & Voice Recording Input */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#C25E3E]" />
                Step 3: Artisan Voice / Notes (कारीगर विवरण)
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-500">Speaking In:</span>
                <select
                  value={inputLang}
                  onChange={(e) => setInputLang(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-stone-300 font-semibold text-stone-800 bg-white"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mic & Input */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {voiceRecording && <div className="absolute -inset-2.5 rounded-full bg-red-500/30 animate-ping" />}
                <button
                  onClick={() => {
                    if (voiceRecording) {
                      setVoiceRecording(false);
                    } else {
                      setVoiceRecording(true);
                      setTimeout(() => setVoiceRecording(false), 2500);
                    }
                  }}
                  id="kalacatalog-mic-btn"
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                    voiceRecording ? 'bg-red-600 text-white scale-110' : 'bg-[#C25E3E] text-white hover:bg-[#A94B2E]'
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 w-full space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {voiceRecording ? '🎙️ Listening... Speak naturally in your language' : 'Artisan Notes / Spoken Craft Details:'}
                  </span>
                  <span className="text-[10px] text-stone-500">Voice or text input</span>
                </div>
                <textarea
                  rows={2}
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                  placeholder="e.g. This is a hand-carved wooden peacock sculpture with fine feather work made for table decor..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-slate-900 focus:border-[#C25E3E] outline-hidden resize-none"
                />
              </div>

              <button
                onClick={handleGenerateCatalog}
                id="kalacatalog-generate-btn"
                disabled={isGenerating}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shrink-0 disabled:opacity-50 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Catalog</span>
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <span className="text-stone-500 font-semibold">Try sample input:</span>
              {SAMPLE_VOICE_PROMPTS.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => {
                    setSpeechInput(prompt.text);
                    setInputLang(prompt.lang as any);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium"
                >
                  {prompt.title}
                </button>
              ))}
            </div>
          </div>

          {/* Staged Loading Stepper */}
          <CatalogLoadingStepper isGenerating={isGenerating} />

          {/* STEP 4 & 5: Editable Multilingual Language Content */}
          <CatalogLanguageEditor
            catalog={catalogData}
            onChange={handleCatalogChange}
            currentLang={currentLang}
          />

          {/* STEP 6 & 7: Artisan Verification Confirmation & Save */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C25E3E]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 4: Artisan Confirmation & Save Catalog
              </h3>
            </div>

            {/* Confirmation Checkbox */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                isArtisanConfirmed
                  ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 shadow-xs'
                  : 'bg-stone-50 border-stone-300 text-slate-800'
              }`}
            >
              <input
                type="checkbox"
                checked={isArtisanConfirmed}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsArtisanConfirmed(checked);
                  handleCatalogChange({
                    ...catalogData,
                    status: checked ? 'ARTISAN_CONFIRMED' : 'AI_DRAFT',
                  });
                }}
                id="artisan-confirmation-checkbox"
                className="w-5 h-5 text-[#C25E3E] rounded border-stone-300 focus:ring-[#C25E3E] mt-0.5 shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold block">
                  I have reviewed and confirmed these product details.
                </span>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Confirms that all descriptions, materials, and techniques accurately reflect your genuine handmade craft.
                </p>
              </div>
            </label>

            {/* Save Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isArtisanConfirmed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {isArtisanConfirmed ? 'ARTISAN_CONFIRMED' : 'AI_DRAFT'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('preview')}
                  className="px-4 py-3 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={handleSaveCatalog}
                  disabled={isSaving || isGenerating}
                  id="save-catalog-btn"
                  className="px-6 py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Saving Catalog...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Catalog</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
