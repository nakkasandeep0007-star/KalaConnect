import React, { useState } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Heart,
  Globe,
  Tag,
  Ruler,
  Weight,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Volume2,
  Check,
} from 'lucide-react';
import { KalaCatalogData, LanguageCode } from '../../types';
import { speakText } from '../../utils/audioSpeech';

interface MarketplacePreviewCardProps {
  catalog: KalaCatalogData;
  productImage: string;
  price?: number;
  currentLang: LanguageCode;
  onEdit: () => void;
  onPublishSuccess?: () => void;
}

export const MarketplacePreviewCard: React.FC<MarketplacePreviewCardProps> = ({
  catalog,
  productImage,
  price = 1485,
  currentLang,
  onEdit,
  onPublishSuccess,
}) => {
  const [langView, setLangView] = useState<'en' | 'hi'>('en');
  const [isPublished, setIsPublished] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const title = langView === 'hi' ? catalog.productTitleHindi || catalog.productTitleEnglish : catalog.productTitleEnglish;
  const shortDesc = langView === 'hi' ? catalog.shortDescriptionHindi || catalog.shortDescriptionEnglish : catalog.shortDescriptionEnglish;
  const detailedDesc = langView === 'hi' ? catalog.detailedDescriptionHindi || catalog.detailedDescriptionEnglish : catalog.detailedDescriptionEnglish;
  const story = langView === 'hi' ? catalog.artisanStoryHindi || catalog.artisanStoryEnglish : catalog.artisanStoryEnglish;
  const keywords = langView === 'hi' ? catalog.keywordsHindi : catalog.keywordsEnglish;

  const handlePublish = () => {
    setPublishLoading(true);
    setTimeout(() => {
      setPublishLoading(false);
      setIsPublished(true);
      if (onPublishSuccess) onPublishSuccess();
    }, 900);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Marketplace Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isPublished ? 'Live on Marketplace' : 'Ready for Buyers'}
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Live customer preview in both English and Hindi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher for Preview */}
          <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700">
            <button
              onClick={() => setLangView('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                langView === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLangView('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                langView === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            onClick={onEdit}
            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-slate-700 transition-colors"
          >
            Edit Fields
          </button>
        </div>
      </div>

      {/* Main Product Card Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Photo & Visual Specs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group">
            {productImage ? (
              <img
                src={productImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2" />
                <span className="text-xs font-semibold">No Image Available</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 shadow-xs border border-stone-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Handcraft</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C25E3E] text-white shadow-xs">
                Direct from Artisan
              </span>
            </div>
          </div>

          {/* Quick Specifications Pill Bar */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
              Physical Specifications
            </span>
            <div className="grid grid-cols-2 gap-2 text-stone-700">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#C25E3E] shrink-0" />
                <span className="truncate">
                  {catalog.dimensions?.length && catalog.dimensions.length !== 'Not provided'
                    ? `${catalog.dimensions.length} × ${catalog.dimensions.width || ''} × ${catalog.dimensions.height || ''}`
                    : 'Dimensions on request'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-[#C25E3E] shrink-0" />
                <span className="truncate">{catalog.weight || 'Weight on request'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Price, Descriptions, Story */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category & Craft Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
              {catalog.category || 'Handicrafts'}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              {catalog.craftTechnique || 'Handmade Craft'}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
              {catalog.material || 'Natural Materials'}
            </span>
          </div>

          {/* Product Title */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif leading-tight">
                {title || 'Handcrafted Artisan Product'}
              </h1>
              <button
                onClick={() => speakText(title, langView)}
                className="p-2 rounded-xl text-stone-400 hover:text-[#C25E3E] hover:bg-stone-100 shrink-0"
                title="Hear audio"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              By Verified Indian Artisan • Craftmark Certified
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500 font-medium line-through">
              ₹{Math.round(price * 1.35).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Fair Artisan Price
            </span>
          </div>

          {/* Short Description */}
          {shortDesc && (
            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              {shortDesc}
            </div>
          )}

          {/* Detailed Description */}
          {detailedDesc && (
            <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1 text-xs text-stone-600 leading-relaxed">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                Product Description
              </span>
              <p>{detailedDesc}</p>
            </div>
          )}

          {/* Artisan Heritage Story Box */}
          {story && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-amber-950">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#C25E3E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Artisan Story</span>
              </span>
              <p className="leading-relaxed italic">{story}</p>
            </div>
          )}

          {/* Tags */}
          {catalog.tags && catalog.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag className="w-3.5 h-3.5 text-[#C25E3E]" />
              {catalog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Publish Action Button */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePublish}
              disabled={publishLoading || isPublished}
              id="marketplace-publish-btn"
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                isPublished
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#C25E3E] hover:bg-[#A94B2E] text-white hover:scale-[1.02]'
              }`}
            >
              {publishLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Publishing to Marketplace...</span>
                </>
              ) : isPublished ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Published to Marketplace!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Publish to Marketplace</span>
                </>
              )}
            </button>

            <button
              onClick={onEdit}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
            >
              Edit Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
