import React from 'react';
import {
  X,
  ShieldCheck,
  BadgeIndianRupee,
  Volume2,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { LanguageCode, Product } from '../../types';
import { speakText } from '../../utils/audioSpeech';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  currentLang: LanguageCode;
  onEditPrice?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  currentLang,
  onEditPrice,
}) => {
  if (!product) return null;

  const playAudio = () => {
    const text = currentLang === 'hi'
      ? `${product.titleHindi}। कीमत ${product.actualPrice} रुपये। ${product.descriptionHindi}`
      : `${product.title}. Price ${product.actualPrice} rupees. ${product.description}`;
    speakText(text, currentLang);
  };

  const handleShare = () => {
    const text = `Look at this handcrafted item: ${product.title} on KalaConnect`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">AI Enhanced Studio Shot</span>
            <div className="h-48 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={product.enhancedImage || product.originalImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Raw Original Photo</span>
            <div className="h-48 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={product.originalImage}
                alt="Raw"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Main Product Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E]">
              {product.craftType}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Handcrafted</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            {currentLang === 'hi' ? product.titleHindi || product.title : product.title}
          </h2>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#C25E3E] font-serif">
              ₹{product.actualPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500">
              (B2B Wholesale: ₹{product.wholesalePrice} • MOQ: {product.wholesaleMOQ} pcs)
            </span>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">
              Craft Story & Specifications
            </span>
            <button
              onClick={playAudio}
              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-200"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#C25E3E]" />
              <span>Listen</span>
            </button>
          </div>

          <p className="text-stone-700 leading-relaxed">
            {product.description}
          </p>

          {product.descriptionHindi && (
            <p className="text-stone-600 italic border-t border-stone-200/80 pt-2 font-serif">
              "{product.descriptionHindi}"
            </p>
          )}
        </div>

        {/* Materials & Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-400 font-bold block">MATERIALS</span>
            <span className="font-semibold text-slate-800">{product.materials.join(', ')}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-400 font-bold block">CREATION TIME</span>
            <span className="font-semibold text-slate-800">{product.makingTimeHours} Hours Handwork</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-400 font-bold block">INVENTORY</span>
            <span className="font-semibold text-slate-800">{product.inventory} Available in stock</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 flex-wrap gap-2">
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            {onEditPrice && (
              <button
                onClick={() => {
                  onClose();
                  onEditPrice(product);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94C2E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <BadgeIndianRupee className="w-4 h-4" />
                <span>{currentLang === 'hi' ? 'मूल्य संपादित करें (KalaPrice)' : 'Edit Price (KalaPrice)'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
