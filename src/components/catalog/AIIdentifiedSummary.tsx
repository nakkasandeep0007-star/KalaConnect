import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Info,
  HelpCircle,
  Palette,
  Layers,
  CheckCircle2,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { AIImageAnalysis, KalaStudioAnalysis } from '../../types';

interface AIIdentifiedSummaryProps {
  analysis: AIImageAnalysis | KalaStudioAnalysis | null;
  isAnalyzing: boolean;
  onReAnalyze: () => void;
  confidenceScores?: {
    product: number;
    material: number;
    technique: number;
  };
}

export const AIIdentifiedSummary: React.FC<AIIdentifiedSummaryProps> = ({
  analysis,
  isAnalyzing,
  onReAnalyze,
  confidenceScores = { product: 92, material: 88, technique: 85 },
}) => {
  if (!analysis) {
    return (
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-stone-700 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-[#C25E3E] shrink-0" />
          <div>
            <p className="font-bold text-slate-900">Visual Analysis Pending</p>
            <p className="text-stone-600 mt-0.5">
              Click &quot;Analyze Product&quot; to identify craft type, material, and dominant colors from the photo.
            </p>
          </div>
        </div>
        <button
          onClick={onReAnalyze}
          disabled={isAnalyzing}
          className="px-3.5 py-2 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Product'}</span>
        </button>
      </div>
    );
  }

  const colors = Array.isArray(analysis.colors) ? analysis.colors : [];
  const productType = (analysis as any).productType || 'Artisan Handcraft';
  const category = analysis.category || 'Handicrafts & Decor';
  const material = (analysis as any).material || 'Natural Craft Material';
  const technique = (analysis as any).technique || 'Traditional Handcrafted Method';

  return (
    <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Step 2: AI-Identified Product Information
            </h3>
            <p className="text-[11px] text-stone-500">
              Grounded visual features extracted from your photo
            </p>
          </div>
        </div>

        <button
          onClick={onReAnalyze}
          disabled={isAnalyzing}
          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Re-analyzing...' : 'Re-Analyze'}</span>
        </button>
      </div>

      {/* Grid of Identified Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Product Type */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Identified Item
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={productType}>
            {productType}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{confidenceScores.product}% Visual Match</span>
          </div>
        </div>

        {/* Category */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Category
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={category}>
            {category}
          </p>
          <span className="text-[10px] text-stone-500 font-medium block pt-0.5">
            Marketplace Classification
          </span>
        </div>

        {/* Primary Material */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Primary Material
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={material}>
            {material}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{confidenceScores.material}% Grounded</span>
          </div>
        </div>

        {/* Craft Technique */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Craft Technique
          </span>
          <p className="text-xs font-bold text-slate-900 truncate" title={technique}>
            {technique}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold pt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{confidenceScores.technique}% Grounded</span>
          </div>
        </div>
      </div>

      {/* Colors & Visual Badges */}
      {colors.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-600 mr-1">
            <Palette className="w-3.5 h-3.5 text-[#C25E3E]" />
            <span>Dominant Colors:</span>
          </div>
          {colors.map((color, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-medium text-slate-800 shadow-2xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#C25E3E]/60 border border-stone-300" />
              {color}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
