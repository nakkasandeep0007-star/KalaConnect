import React from 'react';
import { Volume2, VolumeX, Sparkles, X, Mic, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { speakText, stopSpeech } from '../utils/audioSpeech';

interface VoiceHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onStartWorkflow: () => void;
}

export const VoiceHelperModal: React.FC<VoiceHelperModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onStartWorkflow = () => {},
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const playTutorialAudio = () => {
    const text = currentLang === 'hi'
      ? 'कलाकनेक्ट का उपयोग करना बहुत आसान है। पहले अपने बनाए सामान की फोटो खींचें। फिर माइक का बटन दबाकर अपनी भाषा में बताएं। AI अपने आप सुंदर विवरण और सही दाम तय कर देगा। फिर बस एक क्लिक में बाज़ार में प्रकाशित करें।'
      : 'Using KalaConnect is simple. First take a photo of your craft. Next, press the microphone and describe it in your own words. The AI creates a professional listing with fair pricing. Finally, publish with one tap.';
    speakText(text, currentLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        
        {/* Top Decorative Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C25E3E] via-amber-500 to-[#1E293B]" />
        
        <button
          onClick={() => {
            stopSpeech();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          id="close-voice-guide-modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {currentLang === 'hi' ? 'आवाज़ में सहायता और गाइड' : 'Voice Assistant & Quick Guide'}
            </h3>
            <p className="text-xs text-stone-500">
              {currentLang === 'hi' ? 'डिजिटल मदद बिना किसी तकनीकी परेशानी के' : 'Designed for easy voice-first operation'}
            </p>
          </div>
        </div>

        {/* Audio Player Action Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 mb-6 text-center">
          <p className="text-xs sm:text-sm text-amber-900 mb-3 font-medium">
            {currentLang === 'hi' 
              ? 'ऐप का उपयोग कैसे करें? नीचे दिए गए बटन को दबाकर पूरा तरीका अपनी आवाज़ में सुनें:'
              : 'How to use the app? Listen to the step-by-step audio walkthrough in your language:'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={playTutorialAudio}
              id="listen-tutorial-audio-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-sm font-bold shadow-md shadow-[#C25E3E]/20 transition-all hover:scale-105"
            >
              <Volume2 className="w-4 h-4" />
              <span>{currentLang === 'hi' ? 'गाइड सुनें (Audio Play)' : 'Play Audio Guide'}</span>
            </button>
            <button
              onClick={() => stopSpeech()}
              id="stop-tutorial-audio-btn"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium transition-colors"
            >
              <VolumeX className="w-4 h-4" />
              <span>{t.stopVoice}</span>
            </button>
          </div>
        </div>

        {/* 5 Simple Step Icons */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                {currentLang === 'hi' ? 'फोटो खींचें (KalaStudio)' : '1. Photo Studio'}
              </span>
              <p className="text-stone-500">
                {currentLang === 'hi' ? 'AI रोशनी ठीक करेगा और बैकग्राउंड साफ़ कर देगा।' : 'AI cleans background & balances lighting'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                {currentLang === 'hi' ? 'बोलकर बताएं (KalaCatalog)' : '2. Voice Description'}
              </span>
              <p className="text-stone-500">
                {currentLang === 'hi' ? 'माइक दबाकर अपनी बोली में बताएं कि यह क्या है।' : 'Speak in your language to generate English & Hindi catalog'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <div className="text-xs">
              <span className="font-bold text-slate-800">
                {currentLang === 'hi' ? 'उचित दाम तय करें (KalaPrice)' : '3. Fair Pricing Assistant'}
              </span>
              <p className="text-stone-500">
                {currentLang === 'hi' ? 'सामग्री और अपनी मेहनत के घंटे जोड़ें, AI सही मूल्य सुझाएगा।' : 'Enter raw costs & labor to guarantee fair artisan profit'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Launch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              stopSpeech();
              onClose();
              onStartWorkflow();
            }}
            id="modal-start-product-btn"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <span>{currentLang === 'hi' ? 'नया उत्पाद जोड़ना शुरू करें' : 'Start Adding Product'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export const VoiceHelperWidget = VoiceHelperModal;
