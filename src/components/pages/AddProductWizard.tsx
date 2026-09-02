import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Mic,
  Sparkles,
  BadgeIndianRupee,
  CheckCircle2,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Check,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Package,
} from 'lucide-react';
import { ArtisanProfile, LanguageCode, PageTab, Product, StudioEnhancement } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';
import { saveProductToDb } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import { compressImageFile } from '../../utils/imageCompression';

interface AddProductWizardProps {
  artisan: ArtisanProfile;
  onProductCreated: (newProduct: Product) => void;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
}

export const AddProductWizard: React.FC<AddProductWizardProps> = ({
  artisan,
  onProductCreated,
  setCurrentTab,
  currentLang,
}) => {
  const { user } = useAuth();
  const { draft, updateDraft, resetDraft } = useProductDraft();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard Step State
  const [activeStep, setActiveStep] = useState<number>(1);

  // Real Image Upload State (Supports file upload with preview, file name, delete & replace)
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>(draft.originalImage || '');
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string>(
    draft.enhancedImage || draft.originalImage || ''
  );
  const [imageFileName, setImageFileName] = useState<string>('');

  // Image studio settings
  const [studioSettings, setStudioSettings] = useState<StudioEnhancement>(
    draft.studioSettings || {
      brightness: 15,
      contrast: 10,
      sharpness: 10,
      bgMode: 'studio_white',
      isolateProduct: true,
      authenticStamp: true,
      lightingPreset: 'studio_soft',
    }
  );
  const [isProcessingStudio, setIsProcessingStudio] = useState(false);

  // Voice/Text state
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);

  // Product Fields initialized from draft or defaults
  const [title, setTitle] = useState(draft.title || '');
  const [titleHindi, setTitleHindi] = useState(draft.titleHindi || '');
  const [category, setCategory] = useState(draft.category || '');
  const [craftType, setCraftType] = useState(draft.craftType || artisan.craftType || '');
  const [description, setDescription] = useState(draft.description || '');
  const [descriptionHindi, setDescriptionHindi] = useState(draft.descriptionHindi || '');
  const [materialInput, setMaterialInput] = useState('');
  const [materials, setMaterials] = useState<string[]>(
    draft.materials && draft.materials.length > 0 ? draft.materials : []
  );
  const [dimensions, setDimensions] = useState(draft.dimensions || '');
  const [weight, setWeight] = useState(draft.weight || '');
  const [careInstructions, setCareInstructions] = useState(
    draft.careInstructions || 'Wipe gently with a soft dry cloth.'
  );
  const [keywords, setKeywords] = useState<string[]>(
    draft.keywords && draft.keywords.length > 0 ? draft.keywords : []
  );
  const [quantity, setQuantity] = useState<number>(draft.quantity || 10);

  // Pricing State
  const [rawCost, setRawCost] = useState<number>(draft.rawMaterialCost || 300);
  const [labourHours, setLabourHours] = useState<number>(draft.labourHours || 6);
  const [labourRatePerHour, setLabourRatePerHour] = useState<number>(draft.labourRatePerHour || 120);
  const [otherCosts, setOtherCosts] = useState<number>(draft.otherCosts || 80);
  const [profitMargin, setProfitMargin] = useState<number>(draft.profitMarginPercent || 35);
  const [customPrice, setCustomPrice] = useState<number | null>(
    draft.actualPrice !== draft.suggestedPrice ? draft.actualPrice : null
  );

  // Keep draft in sync
  useEffect(() => {
    if (photoUrl && photoUrl !== draft.originalImage) {
      updateDraft({ originalImage: photoUrl });
    }
  }, [photoUrl]);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Submission Async Status: 'idle' | 'submitting' | 'success' | 'error'
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionErrorMsg, setSubmissionErrorMsg] = useState<string>('');

  // Calculated Pricing
  const totalCost = rawCost + labourHours * labourRatePerHour + otherCosts;
  const calculatedSuggestedPrice = Math.round(totalCost * (1 + profitMargin / 100));
  const finalPrice = customPrice !== null && !isNaN(customPrice) ? customPrice : calculatedSuggestedPrice;
  const netProfit = finalPrice - totalCost;
  const marketMin = Math.round(calculatedSuggestedPrice * 0.85);
  const marketMax = Math.round(calculatedSuggestedPrice * 1.3);

  // Handle Real File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (JPG, PNG, or WEBP).' }));
      return;
    }
    setProductImageFile(file);
    setImageFileName(file.name);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.image;
      return copy;
    });

    try {
      // Compress image client-side to ensure it stays well under 1MB limit with crisp clarity
      const compressedDataUrl = await compressImageFile(file, 1000, 0.78);
      setPhotoUrl(compressedDataUrl);
      setEnhancedPhotoUrl(compressedDataUrl);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPhotoUrl(dataUrl);
        setEnhancedPhotoUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProductImageFile(null);
    setPhotoUrl('');
    setEnhancedPhotoUrl('');
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1 -> 2: Trigger AI Studio Photo Magic
  const triggerStudioEnhance = () => {
    setIsProcessingStudio(true);
    setTimeout(() => {
      setIsProcessingStudio(false);
    }, 600);
  };

  const handleStep1Next = () => {
    if (!photoUrl) {
      setErrors((prev) => ({ ...prev, image: 'Please upload a product image to proceed.' }));
      return;
    }
    setErrors({});
    setActiveStep(2);
  };

  // Step 2 -> 3: Voice/AI Catalog Generation or direct fill
  const triggerAICatalogGeneration = async () => {
    setIsGeneratingCatalog(true);
    try {
      const response = await fetch('/api/gemini/generate-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: photoUrl || enhancedPhotoUrl || undefined,
          voiceOrTextInput: spokenText,
          inputLang: currentLang,
          existingDraft: {
            title,
            category,
            craftType,
            materials,
          },
        }),
      });

      let data: any = null;
      try {
        const rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        console.warn('Could not parse generate-catalog response as JSON:', parseErr);
      }

      if (data && data.catalog) {
        const cat = data.catalog;
        const pTitle = cat.productName || cat.title || title || 'Handcrafted Artisan Product';
        const pTitleHi = cat.hindiName || cat.titleHindi || titleHindi || '';
        const pDesc = cat.englishDescription || cat.englishDesc || description || '';
        const pDescHi = cat.hindiDescription || cat.hindiDesc || descriptionHindi || '';
        const pCategory = cat.category || category || 'Handicrafts & Decor';
        const pCraftType = cat.technique?.value || cat.craftTechnique || craftType || artisan.craftType || 'Traditional Craft';

        const pMaterials: string[] = [];
        if (cat.material?.value) pMaterials.push(cat.material.value);
        if (Array.isArray(cat.materials)) {
          cat.materials.forEach((m: string) => {
            if (!pMaterials.includes(m)) pMaterials.push(m);
          });
        }

        setTitle(pTitle);
        setTitleHindi(pTitleHi);
        setDescription(pDesc);
        setDescriptionHindi(pDescHi);
        setCategory(pCategory);
        setCraftType(pCraftType);
        if (pMaterials.length > 0) {
          setMaterials(pMaterials);
        }
        if (cat.keywords && cat.keywords.length > 0) {
          setKeywords(cat.keywords);
        }
        if (cat.suggestedPrice) {
          setCustomPrice(cat.suggestedPrice);
        }
        updateDraft({
          title: pTitle,
          titleHindi: pTitleHi,
          description: pDesc,
          descriptionHindi: pDescHi,
          category: pCategory,
          craftType: pCraftType,
          materials: pMaterials.length > 0 ? pMaterials : materials,
          keywords: cat.keywords || keywords,
          suggestedPrice: cat.suggestedPrice || draft.suggestedPrice,
          aiCatalog: cat,
        });
      } else {
        // Fallback if network or endpoint returns non-fatal
        if (!title) {
          setTitle(spokenText ? `Authentic Handcrafted ${spokenText.slice(0, 30)}...` : 'Authentic Handcrafted Traditional Artwork');
        }
        if (!description) {
          setDescription(
            spokenText ||
              'Exquisite authentic handcrafted creation made with traditional artisan heritage techniques and organic regional materials.'
          );
        }
        if (!category) setCategory('Handicrafts & Decor');
        if (!craftType) setCraftType(artisan.craftType || 'Traditional Craft');
        if (materials.length === 0) setMaterials(['Natural Clay / Fiber / Wood', 'Eco-friendly Dyes']);
      }
    } catch (err) {
      console.warn('AI catalog gen fallback:', err);
      if (!title) {
        setTitle(spokenText ? `Authentic Handcrafted ${spokenText.slice(0, 30)}...` : 'Authentic Handcrafted Traditional Artwork');
      }
      if (!description) {
        setDescription(
          spokenText ||
            'Exquisite authentic handcrafted creation made with traditional artisan heritage techniques and organic regional materials.'
        );
      }
      if (!category) setCategory('Handicrafts & Decor');
      if (!craftType) setCraftType(artisan.craftType || 'Traditional Craft');
      if (materials.length === 0) setMaterials(['Natural Clay / Fiber / Wood', 'Eco-friendly Dyes']);
    } finally {
      setIsGeneratingCatalog(false);
      setActiveStep(3);
    }
  };

  // Step 3 Validation: Product Details
  const handleStep3Next = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Please enter a product name.';
    }
    if (!category.trim()) {
      newErrors.category = 'Please enter or select a product category.';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a product description.';
    }
    if (materials.length === 0 && !materialInput.trim()) {
      newErrors.material = 'Please enter at least one material used.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // If material input has pending text, add it
    if (materialInput.trim() && !materials.includes(materialInput.trim())) {
      setMaterials((prev) => [...prev, materialInput.trim()]);
      setMaterialInput('');
    }
    setErrors({});
    setActiveStep(4);
  };

  // Step 4 Validation: Pricing & Quantity
  const handleStep4Next = () => {
    const newErrors: { [key: string]: string } = {};
    if (finalPrice <= 0 || isNaN(finalPrice)) {
      newErrors.price = 'Please enter a valid positive price.';
    }
    if (quantity <= 0 || isNaN(quantity)) {
      newErrors.quantity = 'Quantity must be at least 1.';
    }
    if (rawCost < 0) {
      newErrors.rawCost = 'Raw material cost cannot be negative.';
    }
    if (labourHours <= 0) {
      newErrors.labourHours = 'Labor hours must be greater than 0.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setActiveStep(5);
  };

  // Final Form Validation before DB Submit
  const validateCompleteForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!photoUrl) newErrors.image = 'Please upload a product image.';
    if (!title.trim()) newErrors.title = 'Please enter a product name.';
    if (!category.trim()) newErrors.category = 'Please select a product category.';
    if (!description.trim()) newErrors.description = 'Please enter a product description.';
    if (materials.length === 0 && !materialInput.trim()) newErrors.material = 'Please enter the material.';
    if (finalPrice <= 0 || isNaN(finalPrice)) newErrors.price = 'Please enter a valid price.';
    if (quantity <= 0 || isNaN(quantity)) newErrors.quantity = 'Quantity must be at least 1.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // STEP 5: Real Save to Firestore Database
  const handlePublish = async () => {
    if (!validateCompleteForm()) {
      setActiveStep(5);
      return;
    }

    if (!user) {
      setSubmissionStatus('error');
      setSubmissionErrorMsg('Please log in or create an account to save and publish products.');
      return;
    }

    setSubmissionStatus('submitting');
    setSubmissionErrorMsg('');

    try {
      const productPayload: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        titleHindi: titleHindi.trim() || title.trim(),
        category: category.trim(),
        craftType: craftType.trim() || 'Traditional Handicrafts',
        description: description.trim(),
        descriptionHindi: descriptionHindi.trim() || description.trim(),
        materials: materials.length > 0 ? materials : [materialInput.trim() || 'Natural Material'],
        dimensions: dimensions.trim() || 'Standard Artisan Handcrafted Dimensions',
        weight: weight.trim() || 'Standard Artisan Weight',
        careInstructions: careInstructions.trim(),
        careInstructionsHindi: 'मुलायम सूखे कपड़े से साफ़ करें।',
        keywords: keywords.length > 0 ? keywords : [category, craftType, 'Handmade', 'GI Tagged'].filter(Boolean),
        originalImage: photoUrl,
        enhancedImage: enhancedPhotoUrl || photoUrl,
        imageStudioSettings: studioSettings,
        rawMaterialCost: rawCost,
        labourHours,
        labourRatePerHour,
        otherCosts,
        profitMarginPercent: profitMargin,
        suggestedPrice: calculatedSuggestedPrice,
        actualPrice: finalPrice,
        marketRangeMin: marketMin,
        marketRangeMax: marketMax,
        pricingReasoning: `Fair valuation factoring ${labourHours} hours master handwork and regional materials.`,
        pricingReasoningHindi: `${labourHours} घंटे की प्रामाणिक कारीगरी और शुद्ध सामग्री के आधार पर उचित मूल्य।`,
        status: 'published',
        inventory: Number(quantity) || 1,
        viewsCount: 1,
        salesCount: 0,
        wholesaleMOQ: Math.min(5, quantity),
        wholesalePrice: Math.round(finalPrice * 0.75),
        originRegion: `${artisan.location || 'India'}, ${artisan.state || ''}`.trim(),
      };

      // Real Firestore Save Call
      const savedProd = await saveProductToDb(user.uid, productPayload);

      // Notify parent state
      onProductCreated(savedProd);

      // Transition to SUCCESS
      setSubmissionStatus('success');
      setActiveStep(6);

      // Only AFTER database save succeeds, fire confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C25E3E', '#F59E0B', '#10B981', '#1E293B'],
        });
      } catch {
        // Safe fallback if confetti lib is blocked
      }
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setSubmissionStatus('error');
      setSubmissionErrorMsg(
        err?.message || "We couldn't save your product. Please check your internet connection and try again."
      );
    }
  };

  const stepsList = [
    { num: 1, name: 'Upload Photo', icon: Camera },
    { num: 2, name: 'Voice Describe', icon: Mic },
    { num: 3, name: 'Product Details', icon: Sparkles },
    { num: 4, name: 'Pricing & Stock', icon: BadgeIndianRupee },
    { num: 5, name: 'Review', icon: CheckCircle2 },
    { num: 6, name: 'Published', icon: Rocket },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Wizard Header with Progress Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E3E]">
              Add New Product to Your Artisan Catalog
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
              {activeStep === 1 && 'Step 1: Upload Photo & Photo Studio'}
              {activeStep === 2 && 'Step 2: Voice or Text Description'}
              {activeStep === 3 && 'Step 3: Product Details & Category'}
              {activeStep === 4 && 'Step 4: Fair Pricing & Inventory'}
              {activeStep === 5 && 'Step 5: Final Review & Confirmation'}
              {activeStep === 6 && 'Step 6: Product Published Successfully!'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('my-kala')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
          >
            Cancel & Return to Catalog
          </button>
        </div>

        {/* Visual Stepper */}
        <div className="grid grid-cols-6 gap-1 sm:gap-2 pt-2 border-t border-stone-100">
          {stepsList.map((st) => {
            const Icon = st.icon;
            const isDone = activeStep > st.num;
            const isCurrent = activeStep === st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < activeStep && activeStep !== 6 && submissionStatus !== 'submitting') {
                    setActiveStep(st.num);
                  }
                }}
                disabled={st.num > activeStep || submissionStatus === 'submitting'}
                className={`flex flex-col items-center py-1.5 px-1 rounded-xl text-center transition-all ${
                  isCurrent
                    ? 'bg-[#C25E3E] text-white font-bold shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 font-semibold cursor-pointer'
                    : 'text-stone-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center mb-0.5">
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>
                <span className="text-[10px] hidden sm:inline truncate max-w-[70px]">{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner if any */}
      {submissionStatus === 'error' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">Error Publishing Product</h4>
            <p className="text-xs text-red-700 mt-0.5">
              {submissionErrorMsg || "We couldn't save your product. Please try again."}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: REAL IMAGE UPLOAD & PREVIEW */}
      {/* ========================================================================= */}
      {activeStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">Upload Your Product Image</h2>
              <p className="text-xs text-stone-500">
                Upload a real photo of your craft directly from your device (JPG, JPEG, PNG, WEBP).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const text =
                  currentLang === 'hi'
                    ? 'कृपया अपने उत्पाद की एक असली फोटो अपलोड करें।'
                    : 'Please upload a photo of your craft product from your device.';
                speakText(text, currentLang);
              }}
              className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-[#C25E3E]" />
              <span className="hidden sm:inline">Audio Guide</span>
            </button>
          </div>

          {errors.image && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.image}</span>
            </div>
          )}

          {/* Real File Input Area */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            id="product-file-upload-input"
          />

          {!photoUrl ? (
            /* Upload Drop Area */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-[#C25E3E] bg-stone-50 hover:bg-orange-50/20 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-3 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-stone-200 text-stone-500 group-hover:text-[#C25E3E] group-hover:border-[#C25E3E]/40 mx-auto flex items-center justify-center transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to select an image from your computer / phone
                </p>
                <p className="text-xs text-stone-500 mt-1">Supports JPG, PNG, WEBP up to 10MB</p>
              </div>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shadow-xs inline-flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Browse Files</span>
              </button>
            </div>
          ) : (
            /* Image Preview & Controls */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 h-64 sm:h-72 bg-stone-100 flex items-center justify-center">
                  {isProcessingStudio ? (
                    <div className="text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-[#C25E3E] animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-700">AI Enhancing Studio Background...</p>
                    </div>
                  ) : (
                    <img
                      src={studioSettings.isolateProduct ? enhancedPhotoUrl : photoUrl}
                      alt="Uploaded Product"
                      className="w-full h-full object-contain bg-white"
                    />
                  )}

                  {studioSettings.authenticStamp && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-300 shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-slate-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C25E3E]" />
                      <span>CraftMark India Verified</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-black/75 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                    {imageFileName || 'Uploaded Image'}
                  </div>
                </div>

                {/* Remove / Replace Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Photo Enhancement Settings */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Studio Photo Enhancements
                  </h3>

                  {/* Studio Background Selector */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Background Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStudioSettings({ ...studioSettings, isolateProduct: true, bgMode: 'studio_white' });
                          triggerStudioEnhance();
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center justify-between ${
                          studioSettings.bgMode === 'studio_white'
                            ? 'bg-[#C25E3E] text-white border-[#C25E3E]'
                            : 'bg-white border-stone-200 text-stone-800'
                        }`}
                      >
                        <span>Clean White Studio</span>
                        {studioSettings.bgMode === 'studio_white' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudioSettings({ ...studioSettings, isolateProduct: true, bgMode: 'warm_wood' });
                          triggerStudioEnhance();
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center justify-between ${
                          studioSettings.bgMode === 'warm_wood'
                            ? 'bg-[#C25E3E] text-white border-[#C25E3E]'
                            : 'bg-white border-stone-200 text-stone-800'
                        }`}
                      >
                        <span>Warm Teak Texture</span>
                        {studioSettings.bgMode === 'warm_wood' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Authentic Stamp Toggle */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">Add Authentic CraftMark Stamp</span>
                    <input
                      type="checkbox"
                      checked={studioSettings.authenticStamp}
                      onChange={(e) => setStudioSettings({ ...studioSettings, authenticStamp: e.target.checked })}
                      className="w-4 h-4 text-[#C25E3E] rounded focus:ring-[#C25E3E]"
                    />
                  </div>
                </div>

                {/* Direct KalaStudio AI Enhancer Launch Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C25E3E]" />
                      KalaStudio AI Enhancer
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Compare before/after, analyze lighting & extract materials with Gemini AI.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateDraft({
                        originalImage: photoUrl,
                        enhancedImage: enhancedPhotoUrl || photoUrl,
                        title,
                        category,
                        craftType,
                        description,
                        materials,
                        quantity,
                      });
                      setCurrentTab('studio');
                    }}
                    id="wizard-goto-kalastudio-btn"
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1"
                  >
                    <span>Open KalaStudio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStep1Next}
                  id="wizard-step1-next-btn"
                  className="w-full py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Continue to Product Description</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: VOICE OR TEXT DESCRIPTION */}
      {/* ========================================================================= */}
      {activeStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E3E]">Step 2 of 5</span>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Describe Your Handcrafted Item</h2>
            <p className="text-xs text-stone-500">
              Speak or type what you made, materials used, size, and crafting techniques.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 text-center space-y-4">
            <div className="relative inline-block">
              {voiceRecording && <div className="absolute -inset-3 rounded-full bg-red-400/30 animate-ping" />}
              <button
                type="button"
                onClick={() => {
                  if (voiceRecording) {
                    setVoiceRecording(false);
                  } else {
                    setVoiceRecording(true);
                    setTimeout(() => {
                      setVoiceRecording(false);
                    }, 3000);
                  }
                }}
                id="wizard-mic-record-btn"
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  voiceRecording
                    ? 'bg-red-600 text-white scale-110'
                    : 'bg-[#C25E3E] text-white hover:bg-[#A94B2E] hover:scale-105'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {voiceRecording ? 'Listening... Speak in Hindi, Telugu, or English' : 'Tap Microphone or Type Below'}
              </h3>
            </div>

            {/* Editable Spoken Transcript */}
            <div className="text-left bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                Your Spoken Words / Description:
              </label>
              <textarea
                rows={3}
                value={spokenText}
                onChange={(e) => setSpokenText(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-800 border-0 focus:ring-0 outline-hidden resize-none"
                placeholder="उदा. यह हाथ से बना मिट्टी का पानी का जग है जिसमें 2 लीटर पानी आता है..."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold flex items-center gap-2 hover:bg-stone-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={triggerAICatalogGeneration}
              id="wizard-generate-catalog-btn"
              disabled={isGeneratingCatalog}
              className="px-7 py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              {isGeneratingCatalog ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing Details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Prepare Product Details →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: PRODUCT FORM & VALIDATION */}
      {/* ========================================================================= */}
      {activeStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C25E3E]">Step 3 of 5</span>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Product Details & Specifications</h2>
            <p className="text-xs text-stone-500">
              Please enter the product name, category, description, and materials used.
            </p>
          </div>

          <div className="space-y-4">
            {/* Title English & Hindi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. Handcrafted Terracotta Water Pitcher"
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold ${
                    errors.title ? 'border-red-400 bg-red-50/30' : 'border-stone-300'
                  }`}
                />
                {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name (Hindi / स्थानीय भाषा)
                </label>
                <input
                  type="text"
                  value={titleHindi}
                  onChange={(e) => setTitleHindi(e.target.value)}
                  placeholder="उदा. हस्तनिर्मित टेराकोटा वाटर जग"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>

            {/* Category & Craft Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value) setErrors((prev) => ({ ...prev, category: '' }));
                  }}
                  placeholder="e.g. Home Decor, Pottery, Apparel"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    errors.category ? 'border-red-400 bg-red-50/30' : 'border-stone-300'
                  }`}
                />
                {errors.category && <p className="text-[11px] text-red-600 mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Authentic Technique / GI Tag</label>
                <input
                  type="text"
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                  placeholder="e.g. Jaipur Blue Pottery, Pochampally Ikat"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Describe your craft, detailing the heritage process and authentic quality..."
                className={`w-full px-3 py-2 rounded-xl border text-xs leading-relaxed ${
                  errors.description ? 'border-red-400 bg-red-50/30' : 'border-stone-300'
                }`}
              />
              {errors.description && <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>}
            </div>

            {/* Materials Input & Tags */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Materials Used <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (materialInput.trim() && !materials.includes(materialInput.trim())) {
                        setMaterials([...materials, materialInput.trim()]);
                        setMaterialInput('');
                        setErrors((prev) => ({ ...prev, material: '' }));
                      }
                    }
                  }}
                  placeholder="e.g. Natural Riverbed Clay (Press Enter or Add)"
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs ${
                    errors.material ? 'border-red-400 bg-red-50/30' : 'border-stone-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (materialInput.trim() && !materials.includes(materialInput.trim())) {
                      setMaterials([...materials, materialInput.trim()]);
                      setMaterialInput('');
                      setErrors((prev) => ({ ...prev, material: '' }));
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold"
                >
                  Add Material
                </button>
              </div>
              {errors.material && <p className="text-[11px] text-red-600 mt-1">{errors.material}</p>}

              {materials.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {materials.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-xs font-medium text-stone-800 flex items-center gap-1.5"
                    >
                      <span>🌿 {m}</span>
                      <button
                        type="button"
                        onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dimensions & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Dimensions (Optional)</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 10 x 5 inches"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Weight (Optional)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 800 grams"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold flex items-center gap-2 hover:bg-stone-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleStep3Next}
              id="wizard-step3-to-price-btn"
              className="px-7 py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105"
            >
              <span>Next: Pricing & Stock →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: PRICING, QUANTITY & VALIDATION */}
      {/* ========================================================================= */}
      {activeStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C25E3E]">Step 4 of 5</span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">KalaPrice: Fair Pricing & Stock</h2>
              <p className="text-xs text-stone-500">
                Input material costs and labor hours. AI calculates a fair selling price ensuring you are properly compensated.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                {/* Available Quantity */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Available Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-stone-400" />
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(isNaN(val) ? 1 : Math.max(1, val));
                        if (val > 0) setErrors((prev) => ({ ...prev, quantity: '' }));
                      }}
                      className={`w-32 px-3 py-1.5 rounded-lg border text-sm font-bold bg-white ${
                        errors.quantity ? 'border-red-400 bg-red-50' : 'border-stone-300'
                      }`}
                    />
                    <span className="text-xs text-stone-500">Units in inventory</span>
                  </div>
                  {errors.quantity && <p className="text-[11px] text-red-600 mt-1">{errors.quantity}</p>}
                </div>

                {/* Raw Material Cost */}
                <div className="pt-2 border-t border-stone-200">
                  <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                    <span>Raw Material Cost (कच्चे माल का खर्च)</span>
                    <span className="text-[#C25E3E]">₹{rawCost}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={25}
                    value={rawCost}
                    onChange={(e) => setRawCost(Number(e.target.value))}
                    className="w-full accent-[#C25E3E]"
                  />
                </div>

                {/* Labor Hours */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                    <span>Artisan Crafting Time (मेहनत के घंटे)</span>
                    <span className="text-[#C25E3E]">{labourHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={60}
                    step={0.5}
                    value={labourHours}
                    onChange={(e) => setLabourHours(Number(e.target.value))}
                    className="w-full accent-[#C25E3E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Wage Rate / Hour (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={labourRatePerHour}
                      onChange={(e) => setLabourRatePerHour(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Packaging / Other (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={otherCosts}
                      onChange={(e) => setOtherCosts(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Profit Margin */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                    <span>Desired Profit Margin (कारीगर मुनाफ़ा %)</span>
                    <span className="text-emerald-700 font-bold">{profitMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={5}
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Suggested Price & Override */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E07A5F] text-white">
                    Fair Price Recommended
                  </span>
                </div>
                <p className="text-xs text-stone-300">Suggested Selling Price</p>
                <p className="text-4xl font-extrabold font-serif text-amber-300 my-1">
                  ₹{calculatedSuggestedPrice.toLocaleString('en-IN')}
                </p>

                <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-stone-300">
                  <div className="flex justify-between">
                    <span>Cost Basis:</span>
                    <span className="font-semibold text-white">₹{Math.round(totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Margin:</span>
                    <span className="font-bold text-emerald-400">
                      +₹{Math.round(netProfit)} ({profitMargin}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Set Final Actual Price */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">Final Selling Price (₹) *</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-700">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={finalPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomPrice(isNaN(val) ? 0 : val);
                        if (val > 0) setErrors((prev) => ({ ...prev, price: '' }));
                      }}
                      className={`w-28 px-2.5 py-1.5 rounded-lg border font-bold text-sm bg-white ${
                        errors.price ? 'border-red-400 bg-red-50' : 'border-stone-300'
                      }`}
                    />
                  </div>
                </div>
                {errors.price && <p className="text-[11px] text-red-600 mt-1">{errors.price}</p>}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold flex items-center gap-2 hover:bg-stone-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleStep4Next}
              id="wizard-step4-to-review-btn"
              className="px-7 py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105"
            >
              <span>Review Listing →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: FINAL REVIEW & REAL DATABASE SUBMISSION */}
      {/* ========================================================================= */}
      {activeStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ready to Publish</span>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Review Your Product Listing</h2>
            <p className="text-xs text-stone-500">
              Please verify all details before publishing to your artisan store.
            </p>
          </div>

          {/* Full Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="md:col-span-5 space-y-2">
              <div className="rounded-xl overflow-hidden border border-stone-200 h-52 bg-white flex items-center justify-center">
                <img
                  src={enhancedPhotoUrl || photoUrl}
                  alt={title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600 px-1">
                <span>
                  Authenticity: <strong>CraftMark Verified</strong>
                </span>
                <span>
                  Stock: <strong>{quantity} Units</strong>
                </span>
              </div>
            </div>

            <div className="md:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-[#C25E3E]/10 text-[#C25E3E] text-[10px] font-bold">
                  {category || 'Handicrafts'}
                </span>
                <span className="text-2xl font-extrabold text-[#C25E3E] font-serif">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">{description}</p>

              <div className="pt-2 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                <div>
                  <span className="text-stone-400 block">Artisan:</span>
                  <strong>{artisan.name || 'Artisan'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Materials:</span>
                  <strong>{materials.slice(0, 2).join(', ') || 'Natural Materials'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Labor Time:</span>
                  <strong>{labourHours} Hours</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Net Profit:</span>
                  <strong className="text-emerald-700">+₹{Math.round(netProfit)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status Message */}
          {submissionStatus === 'submitting' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-[#C25E3E] animate-spin" />
              <span className="text-sm font-bold">Saving your product to database...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={submissionStatus === 'submitting'}
              onClick={() => setActiveStep(4)}
              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold flex items-center gap-2 hover:bg-stone-50 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pricing</span>
            </button>

            <button
              type="button"
              disabled={submissionStatus === 'submitting'}
              onClick={handlePublish}
              id="wizard-publish-final-btn"
              className="px-8 py-4 rounded-2xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-extrabold text-base flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submissionStatus === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving your product...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Save & Publish Product 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: PUBLISHED SUCCESS SCREEN */}
      {/* ========================================================================= */}
      {activeStep === 6 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
              Product Published Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Your craft item is now securely saved in your Firestore database and live in <strong>My Kala</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentTab('my-kala')}
              id="success-view-catalog-btn"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              View in My Kala
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              id="success-view-dashboard-btn"
              className="px-6 py-3 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              Go to Dashboard
            </button>

            <button
              type="button"
              onClick={() => {
                handleRemoveImage();
                setTitle('');
                setTitleHindi('');
                setDescription('');
                setDescriptionHindi('');
                setMaterials([]);
                setSpokenText('');
                setSubmissionStatus('idle');
                setActiveStep(1);
              }}
              className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-100"
            >
              + Add Another Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
