/**
 * Web Speech API helper for low-literacy audio assistance
 */

export function speakText(text: string, langCode: string = 'hi-IN', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Match language
  if (langCode === 'hi' || langCode === 'hi-IN') {
    utterance.lang = 'hi-IN';
  } else if (langCode === 'bn') {
    utterance.lang = 'bn-IN';
  } else if (langCode === 'ta') {
    utterance.lang = 'ta-IN';
  } else if (langCode === 'te') {
    utterance.lang = 'te-IN';
  } else if (langCode === 'mr') {
    utterance.lang = 'mr-IN';
  } else if (langCode === 'gu') {
    utterance.lang = 'gu-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.95; // Slightly measured rate for clear comprehension
  utterance.pitch = 1.0;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
