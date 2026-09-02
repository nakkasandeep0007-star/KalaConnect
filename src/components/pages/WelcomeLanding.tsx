import React from 'react';
import {
  Sparkles,
  Camera,
  Mic,
  BadgeIndianRupee,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Globe2,
  TrendingUp,
  Store,
  Layers,
  HeartHandshake,
  CheckCircle2,
  Play
} from 'lucide-react';
import { LanguageCode, PageTab } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';

interface WelcomeLandingProps {
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
  onOpenQuickVoiceGuide: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({
  setCurrentTab,
  currentLang,
  onOpenQuickVoiceGuide,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const playHeroSpeech = () => {
    const text = currentLang === 'hi'
      ? 'कलाकनेक्ट: भारत के पारंपरिक कारीगरों, बुनकरों और हस्तशिल्पियों के लिए AI-संचालित वर्चुअल बिज़नेस मैनेजर। फोटो खींचें, बोलकर बताएं और तुरंत अपने उत्पाद को ऑनलाइन बेचें।'
      : 'KalaConnect: Connecting Tradition to Opportunity. The AI-powered business manager for master artisans, weavers, and micro-entrepreneurs.';
    speakText(text, currentLang);
  };

  const steps = [
    {
      step: '01',
      icon: Camera,
      title: 'KalaStudio',
      titleHindi: 'कला स्टूडियो (फोटो सुधार)',
      desc: 'Smart AI enhances imperfect phone photos, corrects shadows, and removes messy home backgrounds.',
      descHindi: 'फोन से ली गई फोटो को AI अपने आप स्टूडियो जैसा सुंदर बनाता है।',
      tag: 'AI Image Engine',
    },
    {
      step: '02',
      icon: Mic,
      title: 'KalaCatalog',
      titleHindi: 'कला कैटलॉग (बोलकर बनाएं)',
      desc: 'Artisans simply describe their craft by voice in Hindi or regional languages. AI writes compelling English & Hindi catalogs.',
      descHindi: 'बस अपनी बोली में बोलें। AI तुरंत पेशेवर हिंदी और अंग्रेज़ी विवरण तैयार कर देगा।',
      tag: 'Voice-to-Catalog',
    },
    {
      step: '03',
      icon: BadgeIndianRupee,
      title: 'KalaPrice',
      titleHindi: 'कला मूल्य (उचित दाम)',
      desc: 'Transparent pricing algorithm factors raw materials, labor hours, and artisan skill to recommend fair, profitable rates.',
      descHindi: 'कच्चे माल और आपकी मेहनत के घंटों के आधार पर सही और मुनाफ़े वाला दाम।',
      tag: 'Fair Wage AI',
    },
    {
      step: '04',
      icon: Store,
      title: 'KalaMarket',
      titleHindi: 'कला बाज़ार (सीधी बिक्री)',
      desc: 'Direct listing to B2B bulk buyers, national retail chains, export curators, and ONDC/GeM platforms.',
      descHindi: 'थोक खरीदारों, सरकारी बाज़ार और वैश्विक ग्राहकों से सीधा जुड़ाव।',
      tag: 'B2B & ONDC Ready',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#201815] via-[#2A1E1A] to-[#161B26] text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-stone-800">
        
        {/* Subtle Indian Craft Traditional Pattern Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#C25E3E]/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>AI-Powered Virtual Business Manager for Indian Artisans</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight sm:leading-none mb-4 font-serif">
            {currentLang === 'hi' ? (
              <>
                कला से बाज़ार तक, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07A5F] via-amber-300 to-amber-100">
                  हर कारीगर का सच्चा साथी
                </span>
              </>
            ) : (
              <>
                Connecting Tradition <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07A5F] via-amber-300 to-amber-100">
                  to Opportunity
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-stone-300 max-w-2xl mb-8 leading-relaxed font-light">
            {currentLang === 'hi'
              ? 'बिना कंप्यूटर जाने या अंग्रेज़ी सीखे—सिर्फ मोबाइल कैमरे और अपनी आवाज़ से अपने हस्तशिल्प को पूरे भारत और दुनिया में बेचें।'
              : 'Empowering traditional weavers, potters, and handicraft creators to conquer digital commerce. From raw photo to AI catalog and fair pricing in 2 minutes.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => setCurrentTab('onboarding')}
              id="hero-get-started-btn"
              className="px-7 py-3.5 rounded-2xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-[#C25E3E]/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              id="hero-explore-dashboard-btn"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-semibold text-sm sm:text-base border border-white/20 flex items-center gap-2 transition-all"
            >
              <span>Open Artisan Dashboard</span>
            </button>

            <button
              onClick={playHeroSpeech}
              id="hero-voice-play-btn"
              className="p-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-colors"
              title="Listen Intro Audio"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 mt-10 border-t border-white/10 text-stone-300">
            <div>
              <p className="text-2xl font-bold text-white font-serif">100%</p>
              <p className="text-xs text-stone-400">Voice-First Workflow</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-serif">7+</p>
              <p className="text-xs text-stone-400">Indian Languages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-serif">+45%</p>
              <p className="text-xs text-stone-400">Fair Artisan Income</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-serif">0</p>
              <p className="text-xs text-stone-400">Tech Skills Required</p>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Journey: Artisan -> AI Virtual Manager -> Marketplace */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C25E3E]/10 text-[#C25E3E] text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>The 5-Step Magic Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            {currentLang === 'hi' ? 'कारीगर से खरीदार तक का सरल सफर' : 'From Artisan Hands to Global Markets'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            KalaConnect automates product photography, catalog writing, pricing calculations, and marketplace publishing.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-[#C25E3E]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold font-mono text-stone-400">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 group-hover:bg-[#C25E3E]/10 group-hover:text-[#C25E3E] transition-colors">
                      {item.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-stone-100 text-slate-800 flex items-center justify-center mb-4 group-hover:bg-[#C25E3E] group-hover:text-white transition-colors duration-200">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5 font-serif">
                    {currentLang === 'hi' ? item.titleHindi : item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {currentLang === 'hi' ? item.descHindi : item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#C25E3E]">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Solving Real Artisan Pain Points */}
      <section className="rounded-3xl bg-white p-6 sm:p-10 border border-stone-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              Why Traditional Artisans Need KalaConnect
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
              Overcoming the Digital Barrier for India's 7 Million+ Artisans
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Craft makers lose up to 60% of their product value to middlemen simply because they lack professional photography, English fluency, or digital listing expertise. KalaConnect puts an AI enterprise business manager in every artisan's pocket.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C25E3E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Overcomes Language & Literacy Barriers</h4>
                  <p className="text-xs text-stone-500">Voice-input in Hindi, Telugu, Bengali, Tamil, etc., automatically converted to professional e-commerce listings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C25E3E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Prevents Middlemen Exploitation</h4>
                  <p className="text-xs text-stone-500">Transparent cost-plus and market-based pricing calculator guarantees fair compensation for authentic hours spent.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C25E3E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Studio Photography Without High Costs</h4>
                  <p className="text-xs text-stone-500">One-tap studio background isolation, shadow adjustment, and authentic CraftMark stamp.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setCurrentTab('add-product')}
                id="landing-try-workflow-btn"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Try Product Creator Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Showcase of Jaipur Blue Pottery */}
          <div className="lg:col-span-6 relative">
            <div className="p-4 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-800">Live AI Output Simulation</span>
                </div>
                <span className="text-[11px] font-semibold text-[#C25E3E] bg-[#C25E3E]/10 px-2 py-0.5 rounded-md">
                  Pehchan Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative rounded-xl overflow-hidden border border-stone-200">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80"
                    alt="Raw Photo"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
                    Raw Photo (Phone)
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden border-2 border-[#C25E3E] shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=85"
                    alt="AI Studio Enhanced"
                    className="w-full h-36 object-cover brightness-105"
                  />
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#C25E3E] text-white text-[10px] font-bold">
                    AI Studio Enhanced ✨
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Jaipur Blue Pottery Peacock Vase</span>
                  <span className="text-xs font-extrabold text-[#C25E3E]">₹1,650</span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  "Handcrafted with authentic quartz powder and natural cobalt glaze. Fired using 19th-century artisan methods."
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fair Trade Wage: ₹780 for 6.5 hrs labor</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#C25E3E] to-[#9E3E20] text-white shadow-xl">
        <h2 className="text-2xl sm:text-4xl font-bold font-serif mb-3">
          {currentLang === 'hi' ? 'अपनी कला को नई पहचान दें' : 'Ready to Take Your Craft Online?'}
        </h2>
        <p className="text-xs sm:text-base text-amber-100 max-w-xl mx-auto mb-6">
          {currentLang === 'hi'
            ? 'बिना किसी पूर्व अनुभव के आज ही अपना पहला उत्पाद जोड़ें।'
            : 'Join thousands of traditional artisans scaling their craft business with AI simplicity.'}
        </p>
        <button
          onClick={() => setCurrentTab('onboarding')}
          id="cta-onboarding-btn"
          className="px-8 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-slate-900 font-extrabold text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {t.getStarted}
        </button>
      </section>

    </div>
  );
};
