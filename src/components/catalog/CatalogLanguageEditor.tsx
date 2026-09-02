import React, { useState } from 'react';
import {
  Volume2,
  Tag,
  BookOpen,
  FileText,
  Sparkles,
  Layers,
  Ruler,
  Weight,
  Plus,
  X,
  Languages,
  Check,
  Info,
} from 'lucide-react';
import { KalaCatalogData, LanguageCode } from '../../types';
import { speakText } from '../../utils/audioSpeech';

interface CatalogLanguageEditorProps {
  catalog: KalaCatalogData;
  onChange: (updated: KalaCatalogData) => void;
  currentLang: LanguageCode;
}

export const CatalogLanguageEditor: React.FC<CatalogLanguageEditorProps> = ({
  catalog,
  onChange,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'english' | 'hindi' | 'dimensions'>('english');
  const [newTag, setNewTag] = useState('');
  const [newKeywordEn, setNewKeywordEn] = useState('');
  const [newKeywordHi, setNewKeywordHi] = useState('');

  const updateField = <K extends keyof KalaCatalogData>(key: K, value: KalaCatalogData[K]) => {
    onChange({
      ...catalog,
      [key]: value,
    });
  };

  const updateDimension = (key: 'length' | 'width' | 'height', val: string) => {
    onChange({
      ...catalog,
      dimensions: {
        ...catalog.dimensions,
        [key]: val,
      },
    });
  };

  // Add / remove tags
  const handleAddTag = () => {
    if (newTag.trim() && !catalog.tags.includes(newTag.trim())) {
      updateField('tags', [...catalog.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField(
      'tags',
      catalog.tags.filter((t) => t !== tagToRemove)
    );
  };

  // Add / remove English keywords
  const handleAddKeywordEn = () => {
    if (newKeywordEn.trim() && !catalog.keywordsEnglish.includes(newKeywordEn.trim())) {
      updateField('keywordsEnglish', [...catalog.keywordsEnglish, newKeywordEn.trim()]);
      setNewKeywordEn('');
    }
  };

  const handleRemoveKeywordEn = (kw: string) => {
    updateField(
      'keywordsEnglish',
      catalog.keywordsEnglish.filter((k) => k !== kw)
    );
  };

  // Add / remove Hindi keywords
  const handleAddKeywordHi = () => {
    if (newKeywordHi.trim() && !catalog.keywordsHindi.includes(newKeywordHi.trim())) {
      updateField('keywordsHindi', [...catalog.keywordsHindi, newKeywordHi.trim()]);
      setNewKeywordHi('');
    }
  };

  const handleRemoveKeywordHi = (kw: string) => {
    updateField(
      'keywordsHindi',
      catalog.keywordsHindi.filter((k) => k !== kw)
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <Languages className="w-5 h-5 text-[#C25E3E]" />
            <span>Multilingual Catalog Content</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            English and Natural Indian Hindi product copy with full editing capability
          </p>
        </div>

        <div className="flex items-center p-1 bg-stone-100 rounded-2xl shrink-0 self-start sm:self-auto border border-stone-200">
          <button
            onClick={() => setActiveTab('english')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'english'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 English Catalog
          </button>
          <button
            onClick={() => setActiveTab('hindi')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hindi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            🇮🇳 Hindi (हिंदी)
          </button>
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dimensions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            📐 Specs & Dimensions
          </button>
        </div>
      </div>

      {/* ENGLISH TAB */}
      {activeTab === 'english' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Product Title (English)
              </label>
              <button
                type="button"
                onClick={() => speakText(catalog.productTitleEnglish, 'en')}
                className="text-stone-400 hover:text-[#C25E3E] flex items-center gap-1 text-[11px] font-semibold"
                title="Hear English pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>
            <input
              type="text"
              value={catalog.productTitleEnglish}
              onChange={(e) => updateField('productTitleEnglish', e.target.value)}
              placeholder="e.g. Handcrafted Carved Wooden Peacock Sculpture"
              className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-300 font-bold text-sm text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden transition-colors"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Short Description (Marketplace Summary)
              </label>
              <span className="text-[10px] text-stone-500">1-2 lines for preview cards</span>
            </div>
            <textarea
              rows={2}
              value={catalog.shortDescriptionEnglish}
              onChange={(e) => updateField('shortDescriptionEnglish', e.target.value)}
              placeholder="Brief summary highlighting the craftsmanship and aesthetic..."
              className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-300 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#C25E3E] outline-hidden leading-relaxed resize-none"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Detailed Product Description
              </label>
              <button
                type="button"
                onClick={() => speakText(catalog.detailedDescriptionEnglish, 'en')}
                className="text-stone-400 hover:text-[#C25E3E] flex items-center gap-1 text-[11px] font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={catalog.detailedDescriptionEnglish}
              onChange={(e) => updateField('detailedDescriptionEnglish', e.target.value)}
              placeholder="In-depth description detailing material, artistic finish, home styling recommendations..."
              className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-300 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#C25E3E] outline-hidden leading-relaxed"
            />
          </div>

          {/* Artisan Heritage Story */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C25E3E]" />
                <span>Artisan Heritage Story (English)</span>
              </label>
              <span className="text-[10px] text-amber-800 font-medium">Connects emotionally with buyers</span>
            </div>
            <textarea
              rows={3}
              value={catalog.artisanStoryEnglish}
              onChange={(e) => updateField('artisanStoryEnglish', e.target.value)}
              placeholder="Narrative about traditional handmade Indian art and the artisan behind the piece..."
              className="w-full bg-white p-3 rounded-xl border border-amber-300 text-xs sm:text-sm text-slate-800 focus:border-[#C25E3E] outline-hidden leading-relaxed"
            />
          </div>

          {/* English SEO Search Keywords */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              English SEO Keywords
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-stone-50 rounded-2xl border border-stone-200">
              {catalog.keywordsEnglish.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-stone-300 text-xs font-medium text-slate-800 shadow-2xs"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeywordEn(kw)}
                    className="text-stone-400 hover:text-red-600 font-bold"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeywordEn}
                onChange={(e) => setNewKeywordEn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeywordEn();
                  }
                }}
                placeholder="Add English search keyword..."
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden focus:border-[#C25E3E]"
              />
              <button
                type="button"
                onClick={handleAddKeywordEn}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HINDI TAB */}
      {activeTab === 'hindi' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Title Hindi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                उत्पाद का नाम (Hindi Title)
              </label>
              <button
                type="button"
                onClick={() => speakText(catalog.productTitleHindi, 'hi')}
                className="text-stone-400 hover:text-[#C25E3E] flex items-center gap-1 text-[11px] font-semibold"
                title="हिंदी में सुनें"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>आवाज़ सुनें</span>
              </button>
            </div>
            <input
              type="text"
              value={catalog.productTitleHindi}
              onChange={(e) => updateField('productTitleHindi', e.target.value)}
              placeholder="उदा. पारंपरिक हस्तनिर्मित नक्काशीदार लकड़ी का मोर"
              className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-300 font-bold text-sm text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden transition-colors"
            />
          </div>

          {/* Short Description Hindi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                संक्षिप्त विवरण (Short Summary)
              </label>
              <button
                type="button"
                onClick={() => speakText(catalog.shortDescriptionHindi, 'hi')}
                className="text-stone-400 hover:text-[#C25E3E] flex items-center gap-1 text-[11px] font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>सुनें</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={catalog.shortDescriptionHindi}
              onChange={(e) => updateField('shortDescriptionHindi', e.target.value)}
              placeholder="शिल्प की सुंदरता और उपयोगिता को रेखांकित करने वाला संक्षिप्त विवरण..."
              className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-300 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#C25E3E] outline-hidden leading-relaxed resize-none"
            />
          </div>

          {/* Detailed Description Hindi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                विस्तृत विवरण (Detailed Hindi Description)
              </label>
              <button
                type="button"
                onClick={() => speakText(catalog.detailedDescriptionHindi, 'hi')}
                className="text-stone-400 hover:text-[#C25E3E] flex items-center gap-1 text-[11px] font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>सुनें</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={catalog.detailedDescriptionHindi}
              onChange={(e) => updateField('detailedDescriptionHindi', e.target.value)}
              placeholder="हस्तशिल्प विधि, सामग्री, सजावट एवं देखभाल के बारे में प्रामाणिक विवरण..."
              className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-300 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#C25E3E] outline-hidden leading-relaxed"
            />
          </div>

          {/* Artisan Heritage Story Hindi */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C25E3E]" />
                <span>कारीगर की धरोहर कहानी (Artisan Heritage Story)</span>
              </label>
              <button
                type="button"
                onClick={() => speakText(catalog.artisanStoryHindi, 'hi')}
                className="text-stone-400 hover:text-[#C25E3E] flex items-center gap-1 text-[11px] font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>सुनें</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={catalog.artisanStoryHindi}
              onChange={(e) => updateField('artisanStoryHindi', e.target.value)}
              placeholder="पारंपरिक भारतीय शिल्पकला की परंपरा और इसे तैयार करने वाले कारीगर के अनुभव की कहानी..."
              className="w-full bg-white p-3 rounded-xl border border-amber-300 text-xs sm:text-sm text-slate-800 focus:border-[#C25E3E] outline-hidden leading-relaxed"
            />
          </div>

          {/* Hindi SEO Search Keywords */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              हिंदी खोज शब्द (Hindi Keywords)
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-stone-50 rounded-2xl border border-stone-200">
              {catalog.keywordsHindi.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-stone-300 text-xs font-medium text-slate-800 shadow-2xs"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeywordHi(kw)}
                    className="text-stone-400 hover:text-red-600 font-bold"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeywordHi}
                onChange={(e) => setNewKeywordHi(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeywordHi();
                  }
                }}
                placeholder="नया खोज शब्द जोड़ें..."
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden focus:border-[#C25E3E]"
              />
              <button
                type="button"
                onClick={handleAddKeywordHi}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                जोड़ें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECS & DIMENSIONS TAB */}
      {activeTab === 'dimensions' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Exact measurements and weights protect you against buyer return disputes. Please enter accurate physical specs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Length */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#C25E3E]" />
                <span>Length</span>
              </label>
              <input
                type="text"
                value={catalog.dimensions?.length || ''}
                onChange={(e) => updateDimension('length', e.target.value)}
                placeholder="e.g. 6 inches / 15 cm"
                className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden"
              />
            </div>

            {/* Width */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#C25E3E]" />
                <span>Width</span>
              </label>
              <input
                type="text"
                value={catalog.dimensions?.width || ''}
                onChange={(e) => updateDimension('width', e.target.value)}
                placeholder="e.g. 4 inches / 10 cm"
                className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden"
              />
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#C25E3E]" />
                <span>Height</span>
              </label>
              <input
                type="text"
                value={catalog.dimensions?.height || ''}
                onChange={(e) => updateDimension('height', e.target.value)}
                placeholder="e.g. 10 inches / 25 cm"
                className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-[#C25E3E]" />
                <span>Weight</span>
              </label>
              <input
                type="text"
                value={catalog.weight || ''}
                onChange={(e) => updateField('weight', e.target.value)}
                placeholder="e.g. 450 grams / 0.45 kg"
                className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C25E3E]" />
                <span>Category</span>
              </label>
              <input
                type="text"
                value={catalog.category || ''}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g. Woodwork & Carving"
                className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#C25E3E] outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shared Marketplace Tags Section */}
      <div className="pt-4 border-t border-stone-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#C25E3E]" />
            <span>Marketplace Discovery Tags</span>
          </label>
          <span className="text-[10px] text-stone-500">Shared across platforms</span>
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-stone-50 rounded-2xl border border-stone-200">
          {catalog.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#C25E3E]/30 text-xs font-semibold text-[#C25E3E] shadow-2xs"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-stone-400 hover:text-red-600 font-bold"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a new marketplace tag (e.g. EcoFriendly)..."
            className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden focus:border-[#C25E3E]"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold transition-colors"
          >
            Add Tag
          </button>
        </div>
      </div>
    </div>
  );
};
